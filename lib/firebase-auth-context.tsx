"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";

export type AccountType = "USER" | "DEVELOPER";

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: "CLIENT" | "ADMIN";
  accountType?: AccountType;
}

interface AuthContextValue {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, accountType?: AccountType) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useFirebaseAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useFirebaseAuth must be used within FirebaseAuthProvider");
  return ctx;
}

async function getUserProfile(uid: string): Promise<FirebaseUser | null> {
  const fb = getFirebaseClient();
  if (!fb) return null;
  const userDoc = await getDoc(doc(fb.db, "users", uid));
  const data = userDoc.data();
  return {
    uid,
    email: data?.email ?? null,
    displayName: data?.displayName ?? null,
    photoURL: data?.photoURL ?? null,
    role: data?.role ?? "CLIENT",
    accountType: (data?.accountType === "DEVELOPER" ? "DEVELOPER" : "USER") as AccountType,
  };
}

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fb = getFirebaseClient();
    if (!fb) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(fb.auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(
          profile ?? {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? null,
            displayName: firebaseUser.displayName ?? null,
            photoURL: firebaseUser.photoURL ?? null,
            role: "CLIENT",
            accountType: "USER",
          }
        );
      } catch {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? null,
          displayName: firebaseUser.displayName ?? null,
          photoURL: firebaseUser.photoURL ?? null,
          role: "CLIENT",
          accountType: "USER",
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Refresh session cookie when user loads (handles expired cookies, page refresh)
  useEffect(() => {
    const fb = getFirebaseClient();
    if (!fb || !user) return;
    const currentUser = fb.auth.currentUser;
    if (!currentUser) return;
    const refresh = async () => {
      try {
        const idToken = await currentUser.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } catch (e) {
        console.error("Session refresh failed:", e);
      }
    };
    refresh();
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps -- only run when uid changes

  const setSessionCookie = async (idToken: string) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Failed to set session");
  };

  const signIn = async (email: string, password: string) => {
    const fb = getFirebaseClient();
    if (!fb) throw new Error("Firebase not configured");
    const { user: firebaseUser } = await signInWithEmailAndPassword(fb.auth, email, password);
    const idToken = await firebaseUser.getIdToken();
    await setSessionCookie(idToken);
  };

  const signUp = async (email: string, password: string, name: string, accountType: AccountType = "USER") => {
    const fb = getFirebaseClient();
    if (!fb) throw new Error("Firebase not configured");
    const { user: firebaseUser } = await createUserWithEmailAndPassword(fb.auth, email, password);
    await setDoc(doc(fb.db, "users", firebaseUser.uid), {
      email,
      displayName: name,
      photoURL: null,
      role: "CLIENT",
      accountType: accountType === "DEVELOPER" ? "DEVELOPER" : "USER",
      createdAt: new Date().toISOString(),
    });
    const idToken = await firebaseUser.getIdToken();
    await setSessionCookie(idToken);
  };

  const signInWithGoogle = async () => {
    const fb = getFirebaseClient();
    if (!fb) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    const { user: firebaseUser } = await signInWithPopup(fb.auth, provider);
    const userDoc = await getDoc(doc(fb.db, "users", firebaseUser.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(fb.db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: "CLIENT",
        accountType: "USER",
        createdAt: new Date().toISOString(),
      });
    }
    const idToken = await firebaseUser.getIdToken();
    await setSessionCookie(idToken);
  };

  const signOut = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    const fb = getFirebaseClient();
    if (fb) await firebaseSignOut(fb.auth);
  };

  const refreshUser = async () => {
    const fb = getFirebaseClient();
    const currentUser = fb?.auth?.currentUser;
    if (!currentUser) return;
    const profile = await getUserProfile(currentUser.uid);
    if (profile) setUser(profile);
  };

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
