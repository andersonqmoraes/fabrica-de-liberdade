import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface Tool {
  id: string;
  name: string;
  description: { "pt-BR": string; en: string; es: string };
  category: string;
  badge: string;
  badgeColor: string;
  rating: number;
  href: string;
  free: boolean;
  tags: string[];
  active: boolean;
  order: number;
}

const COL = "tools";

export async function getTools(): Promise<Tool[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("order", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Tool));
}

export async function createTool(data: Omit<Tool, "id">): Promise<string> {
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateTool(id: string, data: Partial<Tool>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteTool(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
