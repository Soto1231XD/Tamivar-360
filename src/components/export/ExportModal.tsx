import { useState } from "react";
import { saveAs } from "file-saver";
import { AlertTriangle, Archive, FileArchive, FileCode, Link2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IframeCodeBox } from "./IframeCodeBox";
import { validateProject } from "@/services/validation/tourValidator";
import { exportProjectAsStandaloneHtml } from "@/services/export/htmlExporter";
import { exportProjectAsZip } from "@/services/export/zipExporter";
import { exportProjectPackage } from "@/services/export/projectPackage";
import { slugify } from "@/utils/slug";
import { toast } from "@/components/ui/Toast";
import type { Project } from "@/types";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

type ExportKind = "html" | "zip" | "package" | null;

export function ExportModal({ open, onClose, project }: ExportModalProps) {
  const [running, setRunning] = useState<ExportKind>(null);
  const validation = validateProject(project);
  const slug = slugify(project.name);

  const run = async (kind: Exclude<ExportKind, null>) => {
    setRunning(kind);
    try {
      if (kind === "html") {
        const blob = await exportProjectAsStandaloneHtml(project);
        saveAs(blob, `${slug}.html`);
      } else if (kind === "zip") {
        const blob = await exportProjectAsZip(project);
        saveAs(blob, `${slug}-tour.zip`);
      } else if (kind === "package") {
        const blob = await exportProjectPackage(project);
        saveAs(blob, `${slug}.tour`);
      }
      toast.success("Exportación generada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al exportar el recorrido");
    } finally {
      setRunning(null);
    }
  };

  const viewerUrl = `${window.location.origin}/viewer/${project.id}`;

  return (
    <Modal open={open} onClose={onClose} title="Exportar recorrido" widthClassName="max-w-xl">
      <div className="space-y-5">
        {!validation.isExportable && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            El recorrido tiene errores de validación. Corrígelos antes de exportar para clientes.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <ExportOptionCard
            icon={FileCode}
            title="HTML autónomo"
            description="Un solo archivo con todo incluido. Ideal para recorridos pequeños."
            actionLabel="Descargar .html"
            onRun={() => run("html")}
            loading={running === "html"}
            disabled={!validation.isExportable || running !== null}
          />
          <ExportOptionCard
            icon={FileArchive}
            title="ZIP de producción"
            description="index.html + assets/css/js. Recomendado para recorridos grandes."
            actionLabel="Descargar .zip"
            onRun={() => run("zip")}
            loading={running === "zip"}
            disabled={!validation.isExportable || running !== null}
          />
          <ExportOptionCard
            icon={Archive}
            title="Respaldo del proyecto"
            description="Archivo .tour para respaldar o mover el proyecto editable entre computadoras."
            actionLabel="Descargar .tour"
            onRun={() => run("package")}
            loading={running === "package"}
            disabled={running !== null}
          />
        </div>

        <div className="rounded-xl border border-surface-700 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-surface-100">
            <Link2 size={15} /> URL e iframe
          </div>
          <p className="mb-3 text-xs text-surface-500">
            Funciona en este navegador de inmediato. Al publicar el editor en un hosting, esta misma ruta
            quedará disponible públicamente.
          </p>
          <IframeCodeBox url={viewerUrl} />
        </div>
      </div>
    </Modal>
  );
}

function ExportOptionCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onRun,
  loading,
  disabled,
}: {
  icon: typeof FileCode;
  title: string;
  description: string;
  actionLabel: string;
  onRun: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-surface-700 p-3.5">
      <Icon size={18} className="mb-2 text-accent-400" />
      <h3 className="mb-1 text-sm font-semibold text-surface-50">{title}</h3>
      <p className="mb-3 flex-1 text-xs text-surface-500">{description}</p>
      <Button variant="secondary" size="sm" onClick={onRun} disabled={disabled}>
        {loading ? "Generando…" : actionLabel}
      </Button>
    </div>
  );
}
