"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  clearShortlistCookie,
  fetchBackendShortlist,
  syncShortlistWithBackend,
} from "@/lib/cookies/shortlist";

export type UserRole = "student" | "buyer" | "university" | "admin";

export interface AuthUser {
  id?: string;
  email: string;
  name?: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  country?: string;
  user_metadata?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (
    email: string,
    role?: UserRole,
    name?: string,
    id?: string,
    organization?: string,
    country?: string,
    user_metadata?: any,
  ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check local session cache first
    try {
      const stored = localStorage.getItem("vista_user_session");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    setIsLoading(false);
    let cancelled = false;
    const reconcileSession = async () => {
      let supabase: typeof import("@/lib/supabase/client").supabase;
      try {
        ({ supabase } = await import("@/lib/supabase/client"));
      } catch {
        return;
      }
      if (cancelled) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          const emailLower = (session.user.email || "").toLowerCase();
          // Admin comes only from server-controlled app_metadata
          const isAdmin = session.user.app_metadata?.role === "admin";
          const rawMetaRole = session.user.user_metadata?.role as UserRole;
          const metaRole = rawMetaRole === "admin" ? undefined : rawMetaRole;

          // Check if user is already logged in with an institutional role
          let existingStored: AuthUser | null = null;
          try {
            const raw = localStorage.getItem("vista_user_session");
            if (raw) existingStored = JSON.parse(raw);
          } catch {}

          if (
            existingStored &&
            existingStored.role &&
            existingStored.role !== "student" &&
            (existingStored.role !== "admin" || isAdmin)
          ) {
            // Never downgrade an active university, buyer, or admin session
            return;
          }

          let role: UserRole = metaRole || "student";
          if (isAdmin) {
            role = "admin";
          } else if (
            emailLower.includes(".edu") ||
            emailLower.includes(".ac.") ||
            emailLower.includes("uni") ||
            emailLower.includes("admissions") ||
            emailLower.includes("utoronto") ||
            emailLower.includes("toronto") ||
            emailLower.includes("tum.de") ||
            emailLower.includes("tcd.ie") ||
            emailLower.includes("tma.uz") ||
            emailLower.includes("hec.fr") ||
            emailLower.includes("psl.eu") ||
            emailLower.includes("tudelft.nl") ||
            emailLower.includes("uniroma1.it") ||
            emailLower.includes("auckland.ac.nz")
          ) {
            role = "university";
          } else if (
            emailLower.includes("consult") ||
            emailLower.includes("agency") ||
            emailLower.includes("buyer") ||
            emailLower.includes("b2b") ||
            emailLower.includes("apex")
          ) {
            role = "buyer";
          }

          const meta = session.user.user_metadata;
          const extractedName =
            meta?.name ||
            meta?.full_name ||
            (meta?.first_name
              ? `${meta.first_name} ${meta.last_name || ""}`.trim()
              : undefined) ||
            session.user.email?.split("@")[0];

          const currentUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || "",
            name: extractedName,
            role: role,
            organization: meta?.organization,
            country: meta?.country_name,
            user_metadata: meta,
          };
          setUser(currentUser);
          localStorage.setItem(
            "vista_user_session",
            JSON.stringify(currentUser),
          );
        }
      } catch {
        // A failed reconciliation must not disturb the cached public session.
      }
    };

    window.addEventListener("pointerdown", reconcileSession, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", reconcileSession, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", reconcileSession);
      window.removeEventListener("keydown", reconcileSession);
    };
  }, []);

  const login = (
    email: string,
    role: UserRole = "student",
    name?: string,
    id?: string,
    organization?: string,
    country?: string,
    user_metadata?: any,
  ) => {
    const newUser: AuthUser = {
      id,
      email,
      role,
      name: name || email.split("@")[0],
      organization,
      country,
      user_metadata,
    };
    setUser(newUser);
    try {
      localStorage.setItem("vista_user_session", JSON.stringify(newUser));
    } catch {
      // ignore
    }

    // Immediately fetch and isolate this user's specific shortlists (syncing any guest shortlists)
    if (newUser.id || newUser.email) {
      syncShortlistWithBackend({ id: newUser.id, email: newUser.email }).catch(
        () => {},
      );
    }
  };

  const logout = () => {
    const currentUser = user;
    setUser(null);
    try {
      localStorage.removeItem("vista_user_session");
    } catch {
      // ignore
    }
    clearShortlistCookie(currentUser);
    clearShortlistCookie(null);
    import("@/lib/supabase/client")
      .then(({ supabase }) => supabase.auth.signOut())
      .catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoggedIn: false,
      isLoading: false,
      login: () => {},
      logout: () => {},
    };
  }
  return context;
}
