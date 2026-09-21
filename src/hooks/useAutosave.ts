import { useEffect, useRef, useState } from "react";
import { projectRepository } from "@/services/repositories";
import type { Project } from "@/types";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 900;

/**
 * Persiste el proyecto automáticamente cuando cambia, con debounce.
 * Compara por updatedAt para evitar escribir en IndexedDB si nada cambió.
 */
export function useAutosave(project: Project | null): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const lastSavedRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!project) return;
    if (lastSavedRef.current === project.updatedAt) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("saving");

    timeoutRef.current = setTimeout(async () => {
      try {
        await projectRepository.update(project);
        lastSavedRef.current = project.updatedAt;
        setStatus("saved");
      } catch (error) {
        console.error("Error al autoguardar el proyecto", error);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [project]);

  return status;
}
