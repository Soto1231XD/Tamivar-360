import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import clsx from "clsx";

interface SceneUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  /** Estilo compacto para cuando ya hay fotos en la lista y sólo se quieren agregar más. */
  compact?: boolean;
}

export function SceneUploadDropzone({ onFilesSelected, compact }: SceneUploadDropzoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition-colors cursor-pointer",
        compact ? "px-4 py-4" : "px-6 py-10",
        dragActive ? "border-accent-400 bg-accent-500/5" : "border-surface-700 hover:border-surface-500"
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length) onFilesSelected(files);
      }}
    >
      <UploadCloud size={compact ? 18 : 26} className="text-surface-500" />
      <p className="text-sm text-surface-300">
        {compact
          ? "Arrastra más fotos o haz clic para agregar"
          : "Arrastra una o varias fotografías aquí, o haz clic para seleccionarlas"}
      </p>
      {!compact && <p className="text-xs text-surface-500">JPG o PNG — panorámicas 360° y fotografías normales, mezcladas</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFilesSelected(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
