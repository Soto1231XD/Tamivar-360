import { localProjectRepository } from "./LocalProjectRepository";
import type { ProjectRepository } from "./ProjectRepository";

/**
 * Único punto de selección de implementación. Cuando exista backend,
 * bastará con cambiar esta línea por ApiProjectRepository.
 */
export const projectRepository: ProjectRepository = localProjectRepository;

export type { ProjectRepository } from "./ProjectRepository";
