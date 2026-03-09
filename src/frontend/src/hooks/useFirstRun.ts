import { useEffect, useState } from "react";

const WELCOME_COMPLETED_KEY = "consignflow-welcome-completed";

export function useFirstRun() {
  const [isFirstRun, setIsFirstRun] = useState<boolean>(() => {
    // Initialize from localStorage immediately to avoid hydration mismatch
    if (typeof window !== "undefined") {
      try {
        const completed = localStorage.getItem(WELCOME_COMPLETED_KEY);
        return !completed;
      } catch {
        return true;
      }
    }
    return true;
  });

  useEffect(() => {
    try {
      const completed = localStorage.getItem(WELCOME_COMPLETED_KEY);
      setIsFirstRun(!completed);
    } catch (error) {
      console.error("Failed to read welcome status from localStorage:", error);
    }
  }, []);

  const markWelcomeCompleted = () => {
    try {
      localStorage.setItem(WELCOME_COMPLETED_KEY, "true");
      setIsFirstRun(false);
    } catch (error) {
      console.error("Failed to save welcome status to localStorage:", error);
    }
  };

  return {
    isFirstRun,
    markWelcomeCompleted,
  };
}
