import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, Eye, Loader2, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import type { AutosaveStatus } from "@/hooks/useAutosave";

interface EditorToolbarProps {
  projectName: string;
  projectId: string;
  autosaveStatus: AutosaveStatus;
  onValidate: () => void;
  onExport: () => void;
}

const statusLabel: Record<AutosaveStatus, string> = {
  idle: "",
  saving: "Guardando…",
  saved: "Guardado",
  error: "Error al guardar",
};

export function EditorToolbar({ projectName, projectId, autosaveStatus, onValidate, onExport }: EditorToolbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-800 bg-surface-900 px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/projects"
          aria-label="Volver a proyectos"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-800 hover:text-surface-100"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="truncate text-sm font-semibold text-surface-50">{projectName}</h1>
        {statusLabel[autosaveStatus] && (
          <span
            className={clsx(
              "flex items-center gap-1 text-xs",
              autosaveStatus === "error" ? "text-red-400" : "text-surface-500"
            )}
          >
            {autosaveStatus === "saving" && <Loader2 size={12} className="animate-spin" />}
            {autosaveStatus === "saved" && <CheckCircle2 size={12} />}
            {statusLabel[autosaveStatus]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onValidate}>
          <ShieldCheck size={15} /> Validar
        </Button>
        <a href={`/preview/${projectId}`} target="_blank" rel="noreferrer">
          <Button variant="secondary" size="sm">
            <Eye size={15} /> Previsualizar
          </Button>
        </a>
        <Button variant="primary" size="sm" onClick={onExport}>
          <Download size={15} /> Exportar
        </Button>
      </div>
    </header>
  );
}
