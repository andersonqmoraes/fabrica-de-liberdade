import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { storage, db } from "./config";
import type { MediaFile } from "@/types";

const MEDIA_COLLECTION = "media_files";

export async function uploadMedia(file: File, folder = "media"): Promise<MediaFile> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${folder}/${timestamp}_${safeName}`;

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  const mediaFile: Omit<MediaFile, "id"> & { storagePath: string; createdAt: unknown } = {
    name: file.name,
    url,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
    storagePath: path,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, MEDIA_COLLECTION), mediaFile);

  return { id: docRef.id, ...mediaFile } as MediaFile & { storagePath: string };
}

export async function listMediaFiles(): Promise<(MediaFile & { storagePath?: string })[]> {
  const q = query(collection(db, MEDIA_COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<MediaFile, "id"> & { storagePath?: string }),
  }));
}

export async function deleteMedia(docId: string, storagePath?: string): Promise<void> {
  // Delete from Firestore
  await deleteDoc(doc(db, MEDIA_COLLECTION, docId));

  // Delete from Storage (best-effort)
  if (storagePath) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch {
      // File may already be gone
    }
  }
}

export async function getMediaUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path));
}
