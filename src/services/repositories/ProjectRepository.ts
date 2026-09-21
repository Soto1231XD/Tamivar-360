import type { Project, ProjectSummary } from "@/types";

/**
 * Contrato de persistencia de proyectos. La UI y los hooks dependen
 * únicamente de esta interfaz, nunca de IndexedDB/Dexie directamente.
 * Esto permite sustituir LocalProjectRepository por una futura
 * ApiProjectRepository (NestJS + MySQL) sin tocar componentes.
 */
export interface ProjectRepository {
  list(): Promise<ProjectSummary[]>;
  get(id: string): Promise<Project | undefined>;
  create(project: Project): Promise<void>;
  update(project: Project): Promise<void>;
  remove(id: string): Promise<void>;
  duplicate(id: string, newName: string): Promise<Project>;
}
