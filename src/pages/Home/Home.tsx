import { Link } from "react-router-dom";
import { ArrowRight, Boxes, MousePointerClick, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const steps = [
  {
    icon: Boxes,
    title: "Crea escenas",
    description: "Combina fotografías 360° y fotografías normales dentro de un mismo recorrido.",
  },
  {
    icon: MousePointerClick,
    title: "Coloca hotspots",
    description: "Haz clic directamente sobre la imagen para conectar habitaciones o mostrar información.",
  },
  {
    icon: Share2,
    title: "Exporta y comparte",
    description: "Genera un HTML autónomo, un ZIP listo para hosting o un iframe para tu sitio web.",
  },
];

export function Home() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="mb-2 text-sm font-medium text-accent-400">Editor de recorridos virtuales</p>
        <h1 className="mb-4 text-3xl font-semibold text-surface-50 sm:text-4xl">
          Crea recorridos 360° de propiedades sin tocar código
        </h1>
        <p className="mb-8 max-w-2xl text-surface-300">
          Combina fotografías panorámicas del dron con fotografías normales de interiores,
          conecta las habitaciones con hotspots y exporta un recorrido listo para publicar.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400 transition-colors"
        >
          Ir a mis proyectos
          <ArrowRight size={16} />
        </Link>

        <div className="mt-16 grid gap-5 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-surface-800 bg-surface-900 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                <Icon size={18} />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-surface-50">{title}</h3>
              <p className="text-sm text-surface-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
