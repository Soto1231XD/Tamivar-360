import type { Project, ValidationIssue, ValidationResult } from "@/types";

export function validateProject(project: Project): ValidationResult {
  const issues: ValidationIssue[] = [];
  const sceneIds = new Set(project.scenes.map((s) => s.id));

  if (!project.initialSceneId || !sceneIds.has(project.initialSceneId)) {
    issues.push({ severity: "error", message: "El proyecto no tiene una escena inicial configurada." });
  }

  if (project.scenes.length === 0) {
    issues.push({ severity: "error", message: "El proyecto no tiene ninguna escena." });
  }

  const incomingLinks = new Set<string>();
  if (project.initialSceneId) incomingLinks.add(project.initialSceneId);

  let validHotspotCount = 0;

  for (const scene of project.scenes) {
    if (!scene.imageId) {
      issues.push({ severity: "error", message: `La escena "${scene.name}" no tiene imagen.`, sceneId: scene.id });
    }
    if (!scene.name.trim()) {
      issues.push({ severity: "error", message: "Hay una escena sin nombre.", sceneId: scene.id });
    }

    for (const hotspot of scene.hotspots) {
      if (hotspot.type === "navigation") {
        if (!sceneIds.has(hotspot.targetSceneId)) {
          issues.push({
            severity: "error",
            message: `Un hotspot de "${scene.name}" apunta a una escena eliminada.`,
            sceneId: scene.id,
            hotspotId: hotspot.id,
          });
          continue;
        }
        incomingLinks.add(hotspot.targetSceneId);
      }
      validHotspotCount += 1;
    }
  }

  for (const scene of project.scenes) {
    if (scene.id === project.initialSceneId) continue;
    if (!incomingLinks.has(scene.id)) {
      issues.push({
        severity: "warning",
        message: `"${scene.name}" no tiene ninguna conexión de entrada.`,
        sceneId: scene.id,
      });
    }
  }

  if (validHotspotCount > 0) {
    issues.push({ severity: "ok", message: `${validHotspotCount} hotspots válidos.` });
  }
  if (project.initialSceneId && sceneIds.has(project.initialSceneId)) {
    issues.push({ severity: "ok", message: "Escena inicial configurada." });
  }
  if (project.scenes.length > 0 && project.scenes.every((s) => s.imageId)) {
    issues.push({ severity: "ok", message: "Todas las escenas tienen imagen." });
  }

  const isExportable = !issues.some((issue) => issue.severity === "error");
  return { issues, isExportable };
}
