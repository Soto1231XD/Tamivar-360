import { Image as ImageIcon, Orbit } from "lucide-react";
import clsx from "clsx";
import type { SceneType } from "@/types";

export function SceneTypeBadge({ type, className }: { type: SceneType; className?: string }) {
  const Icon = type === "panorama" ? Orbit : ImageIcon;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        type === "panorama" ? "bg-accent-500/15 text-accent-400" : "bg-surface-700 text-surface-300",
        className
      )}
    >
      <Icon size={10} />
      {type === "panorama" ? "360°" : "Normal"}
    </span>
  );
}
