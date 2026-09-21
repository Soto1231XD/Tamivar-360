import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { validateProject } from "@/services/validation/tourValidator";
import type { Project } from "@/types";

interface ProjectValidationPanelProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

export function ProjectValidationPanel({ open, onClose, project }: ProjectValidationPanelProps) {
  const result = validateProject(project);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Validación del recorrido"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <ul className="space-y-2">
        {result.issues.map((issue, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {issue.severity === "ok" && <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent-400" />}
            {issue.severity === "warning" && <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />}
            {issue.severity === "error" && <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />}
            <span className="text-surface-200">{issue.message}</span>
          </li>
        ))}
      </ul>
      {!result.isExportable && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          Corrige los errores antes de exportar el recorrido.
        </p>
      )}
    </Modal>
  );
}
