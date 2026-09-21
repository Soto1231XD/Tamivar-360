function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serializa JSON de forma segura para incrustarlo dentro de un <script>. */
function safeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

interface BuildTourHtmlOptions {
  title: string;
  /** CSS a incrustar inline (usado en la exportación HTML autónoma). */
  inlineCss?: string[];
  /** Hojas de estilo externas referenciadas por ruta relativa (exportación ZIP). */
  cssHrefs?: string[];
  /** JS a incrustar inline. */
  inlineScripts?: string[];
  /** Scripts externos referenciados por ruta relativa. */
  scriptHrefs?: string[];
  tourData: unknown;
}

export function buildTourHtmlDocument({
  title,
  inlineCss = [],
  cssHrefs = [],
  inlineScripts = [],
  scriptHrefs = [],
  tourData,
}: BuildTourHtmlOptions): string {
  const styleTags = [
    ...cssHrefs.map((href) => `<link rel="stylesheet" href="${href}" />`),
    ...inlineCss.map((css) => `<style>${css}</style>`),
  ].join("\n");

  const scriptTags = [
    ...scriptHrefs.map((href) => `<script src="${href}"></script>`),
    ...inlineScripts.map((js) => `<script>${js}</script>`),
    `<script>window.__TAMIVAR_TOUR__ = ${safeJson(tourData)};</script>`,
  ].join("\n");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
${styleTags}
</head>
<body>
<div id="tamivar-tour" style="width:100vw;height:100vh;"></div>
${scriptTags}
</body>
</html>
`;
}
