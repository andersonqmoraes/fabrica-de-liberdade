import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./config";
import type { MediaFile } from "@/types";

export async function uploadMedia(
  file: File,
  folder = "media"
): Promise<MediaFile> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${folder}/${timestamp}_${safeName}`;

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return {
    id: path,
    name: file.name,
    url,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
}

export async function deleteMedia(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function listMedia(folder = "media"): Promise<string[]> {
  const folderRef = ref(storage, folder);
  const result = await listAll(folderRef);
  return Promise.all(result.items.map((item) => getDownloadURL(item)));
}

export async function getMediaUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}
