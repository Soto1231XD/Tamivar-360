import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/project/ProjectCard";
import { NewProjectModal } from "@/components/project/NewProjectModal";
import { projectRepository } from "@/services/repositories";
import { createEmptyProject } from "@/constants/factories";
import { importProjectPackage } from "@/services/export/projectPackage";
import { toast } from "@/components/ui/Toast";
import type { ProjectSummary } from "@/types";

export function Projects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const refresh = async () => {
    setLoading(true);
    setProjects(await projectRepository.list());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (name: string) => {
    const project = createEmptyProject(name);
    await projectRepository.create(project);
    setModalOpen(false);
    navigate(`/editor/${project.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    await projectRepository.remove(id);
    toast.success("Proyecto eliminado");
    refresh();
  };

  const handleDuplicate = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    await projectRepository.duplicate(id, `${project?.name ?? "Proyecto"} (copia)`);
    toast.success("Proyecto duplicado");
    refresh();
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      await importProjectPackage(file);
      toast.success("Proyecto importado correctamente");
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo importar el archivo .tour");
    } finally {
      setImporting(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-surface-50">Proyectos</h1>
            <p className="mt-1 text-sm text-surface-400">Recorridos virtuales de tus propiedades</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => importInputRef.current?.click()} disabled={importing}>
              <Upload size={16} /> {importing ? "Importando…" : "Importar proyecto"}
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Nuevo proyecto
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".tour,.zip"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {!loading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-700 py-24 text-center">
            <p className="mb-4 text-surface-400">Aún no tienes proyectos.</p>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Crear tu primer recorrido
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} onDuplicate={handleDuplicate} />
          ))}
        </div>
      </div>

      <NewProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
    </AppShell>
  );
}
