"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { UserProfileData, UserRole, UserStatus } from "@/lib/db/types";
import { isMasterAdminEmail, getSuperadminEmail } from "@/lib/env";

export function translateAuthError(err: any): string {
  const code = err?.code || "";
  if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") return "Correo o contraseña incorrectos. Verifica tus credenciales.";
  if (code === "auth/email-already-in-use") return "Este correo ya está registrado. Por favor selecciona 'Iniciar Sesión'.";
  if (code === "auth/weak-password") return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
  if (code === "auth/invalid-email") return "El formato del correo electrónico no es válido.";
  if (code === "auth/popup-closed-by-user") return "Inicio de sesión con Google cancelado.";
  if (code === "auth/network-request-failed") return "Error de red al conectar con los servidores de autenticación.";
  if (code === "auth/operation-not-allowed") return "El método de autenticación no está habilitado en Firebase Console.";
  return err?.message || "Ocurrió un error en la autenticación.";
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData | null;
  isAdmin: boolean;
  isActive: boolean;
  isPending: boolean;
  isDisabled: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginAsMasterAdminDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar el perfil del usuario con el backend
  const syncProfile = useCallback(async (fbUser: User | null) => {
    if (!fbUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setUserProfile(data.profile);
        }
      } else {
        const userEmail = fbUser.email || "";
        const isMaster = isMasterAdminEmail(userEmail);
        setUserProfile({
          uid: fbUser.uid,
          email: userEmail,
          displayName: fbUser.displayName || (isMaster ? "Germán Morales" : "Atleta"),
          photoURL: fbUser.photoURL || undefined,
          role: isMaster ? "admin" : "athlete",
          status: isMaster ? "active" : "pending",
          intervalsAthleteId: isMaster ? (process.env.INTERVALS_ATHLETE_ID || "i442091") : undefined,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Aviso al sincronizar perfil en AuthContext:", err);
      const userEmail = fbUser.email || "";
      const isMaster = isMasterAdminEmail(userEmail);
      setUserProfile({
        uid: fbUser.uid,
        email: userEmail,
        displayName: fbUser.displayName || (isMaster ? "Germán Morales" : "Atleta"),
        photoURL: fbUser.photoURL || undefined,
        role: isMaster ? "admin" : "athlete",
        status: isMaster ? "active" : "pending",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Escuchar cambios de autenticación de Firebase con timeout de seguridad
  useEffect(() => {
    let unsubscribe = () => {};
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    const checkSavedSession = (): boolean => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sgea_mock_user");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.email) {
              setUser({
                uid: parsed.uid || "superadmin-root",
                email: parsed.email,
                displayName: parsed.displayName || "Germán Morales",
              } as unknown as User);
              setUserProfile(parsed);
              return true;
            }
          } catch {}
        }
      }
      return false;
    };

    try {
      if (auth) {
        unsubscribe = onAuthStateChanged(auth, (fbUser) => {
          clearTimeout(safetyTimer);
          if (fbUser) {
            setUser(fbUser);
            syncProfile(fbUser);
          } else {
            const restored = checkSavedSession();
            if (!restored) {
              syncProfile(null);
            } else {
              setLoading(false);
            }
          }
        });
      } else {
        clearTimeout(safetyTimer);
        const restored = checkSavedSession();
        if (!restored) syncProfile(null);
        else setLoading(false);
      }
    } catch {
      clearTimeout(safetyTimer);
      const restored = checkSavedSession();
      if (!restored) syncProfile(null);
      else setLoading(false);
    }

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [syncProfile]);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado.");
      }
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await syncProfile(result.user);
    } catch (err: any) {
      const msg = translateAuthError(err);
      console.warn("Aviso en signInWithGoogle:", msg);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!auth) throw new Error("Firebase Auth no está inicializado.");
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
      setUser(cred.user);
      await syncProfile(cred.user);
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    setError(null);
    setLoading(true);
    try {
      if (!auth) throw new Error("Firebase Auth no está inicializado.");
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      setUser(cred.user);
      await syncProfile(cred.user);
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    if (!auth) throw new Error("Firebase Auth no está inicializado.");
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    } catch (err: any) {
      const msg = translateAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn("Aviso al cerrar sesión:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sgea_mock_user");
      }
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await syncProfile(user);
    }
  };

  // Método para pruebas locales explícitas del Superadministrador
  const loginAsMasterAdminDemo = () => {
    const superadminEmail = getSuperadminEmail();
    const demoAdmin: UserProfileData = {
      uid: "superadmin-root",
      email: superadminEmail,
      displayName: "Germán Morales",
      role: "admin",
      status: "active",
      intervalsAthleteId: "i442091",
      createdAt: "2026-08-01T00:00:00.000Z",
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("sgea_mock_user", JSON.stringify(demoAdmin));
    }
    setError(null);
    setUser({
      uid: "superadmin-root",
      email: superadminEmail,
      displayName: "Germán Morales",
    } as unknown as User);
    setUserProfile(demoAdmin);
    setLoading(false);
  };

  const clearError = () => setError(null);

  const isAdmin = userProfile?.role === "admin" || isMasterAdminEmail(user?.email || userProfile?.email);
  const isActive = userProfile?.status === "active";
  const isPending = userProfile?.status === "pending";
  const isDisabled = userProfile?.status === "disabled";

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isActive,
        isPending,
        isDisabled,
        loading,
        error,
        clearError,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signOutUser,
        refreshProfile,
        loginAsMasterAdminDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
