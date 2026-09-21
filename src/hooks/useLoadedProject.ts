import { useEffect, useState } from "react";
import { projectRepository } from "@/services/repositories";
import type { Project } from "@/types";

interface LoadedProjectState {
  project: Project | null;
  loading: boolean;
  notFound: boolean;
}

/** Carga un proyecto por id directamente desde el repositorio, sin pasar por el editor. */
export function useLoadedProject(projectId: string | undefined): LoadedProjectState {
  const [state, setState] = useState<LoadedProjectState>({ project: null, loading: true, notFound: false });

  useEffect(() => {
    if (!projectId) {
      setState({ project: null, loading: false, notFound: true });
      return;
    }
    let cancelled = false;
    setState({ project: null, loading: true, notFound: false });
    projectRepository.get(projectId).then((project) => {
      if (cancelled) return;
      setState({ project: project ?? null, loading: false, notFound: !project });
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return state;
}
