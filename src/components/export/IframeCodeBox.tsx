import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface IframeCodeBoxProps {
  url: string;
}

export function IframeCodeBox({ url }: IframeCodeBoxProps) {
  const [copied, setCopied] = useState<"url" | "iframe" | null>(null);

  const iframeCode = `<iframe\n  src="${url}"\n  width="100%"\n  height="600"\n  style="border:0"\n  allowfullscreen>\n</iframe>`;

  const copy = async (text: string, which: "url" | "iframe") => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-surface-400">URL del recorrido</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-xs text-surface-300">
            {url}
          </code>
          <Button variant="secondary" size="sm" onClick={() => copy(url, "url")}>
            {copied === "url" ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-surface-400">Código iframe</p>
        <pre className="overflow-x-auto rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-xs text-surface-300">
          {iframeCode}
        </pre>
        <Button variant="secondary" size="sm" className="mt-2" onClick={() => copy(iframeCode, "iframe")}>
          {copied === "iframe" ? <Check size={14} /> : <Copy size={14} />}
          Copiar iframe
        </Button>
      </div>
    </div>
  );
}
