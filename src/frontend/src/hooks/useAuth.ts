import { useCallback, useEffect } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

const AUTH_KEY = "consignflow-auth-principal";

/**
 * Thin wrapper over useInternetIdentity that:
 * 1. Persists the principal string to localStorage on successful login.
 * 2. Clears it on logout.
 * 3. Exposes a simple `isAuthenticated` boolean and the persisted `principalId`.
 */
export function useAuth() {
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();

  const principalId =
    identity?.getPrincipal().isAnonymous() === false
      ? identity.getPrincipal().toText()
      : null;

  // Persist principal to localStorage whenever it changes
  useEffect(() => {
    if (principalId) {
      try {
        localStorage.setItem(AUTH_KEY, principalId);
      } catch {
        // ignore storage errors
      }
    }
  }, [principalId]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
    clear();
  }, [clear]);

  // Read persisted principal from storage (survives page reload until II is re-initialised)
  const storedPrincipal = (() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(AUTH_KEY);
    } catch {
      return null;
    }
  })();

  const isAuthenticated = !!principalId;
  // While II is initialising we optimistically trust the stored value
  const isAuthenticatedOrLoading =
    isAuthenticated || (isInitializing && !!storedPrincipal);

  return {
    isAuthenticated,
    isAuthenticatedOrLoading,
    isInitializing,
    isLoggingIn,
    principalId: principalId ?? storedPrincipal,
    login,
    logout,
  };
}
