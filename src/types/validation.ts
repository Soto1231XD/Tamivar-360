export type ValidationSeverity = "ok" | "warning" | "error";

export interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
  sceneId?: string;
  hotspotId?: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  isExportable: boolean;
}
