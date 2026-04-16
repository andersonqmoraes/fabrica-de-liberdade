import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "./config";
import Cookies from "js-cookie";

const AUTH_COOKIE = "fdl-auth";

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  // Salva cookie para o middleware verificar
  const token = await credential.user.getIdToken();
  Cookies.set(AUTH_COOKIE, token, { expires: 7, secure: true, sameSite: "strict" });
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  Cookies.remove(AUTH_COOKIE);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
