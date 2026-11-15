"use client";

/**
 * Turns the first page of a PDF into a picture, right in the visitor's browser, so a
 * certificate that only exists as a PDF still gets a real preview (no PNG needed).
 *
 * It uses Mozilla's PDF.js, loaded only when a PDF preview is actually needed, from the
 * jsDelivr CDN at a fixed version (the "legacy" build, which also runs on older phones and
 * browsers). Nothing is installed in the project, so the site can't fail to build because of
 * it. If PDF.js can't load or the PDF can't be read, the caller shows its fallback instead.
 */

const PDFJS_VERSION = "5.4.54";
const BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/legacy/build/`;

type PdfPage = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: Record<string, unknown>) => { promise: Promise<void> };
};
type PdfDoc = { getPage: (n: number) => Promise<PdfPage>; destroy?: () => unknown };
type PdfJs = {
  getDocument: (src: { url: string }) => { promise: Promise<PdfDoc> };
  GlobalWorkerOptions: { workerSrc: string };
};

let library: Promise<PdfJs> | null = null;

function loadPdfJs() {
  if (!library) {
    // a plain browser import from the CDN; kept out of the site's own bundle on purpose
    const browserImport = new Function("u", "return import(u)") as (u: string) => Promise<PdfJs>;
    library = browserImport(`${BASE}pdf.min.mjs`).then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `${BASE}pdf.worker.min.mjs`;
      return pdfjs;
    });
    // a failed load (offline, blocked) can be retried next time
    library.catch(() => {
      library = null;
    });
  }
  return library;
}

const previews = new Map<string, Promise<string>>();

/**
 * Picture of page 1 as an object URL. Two sizes: "small" for the hover preview,
 * "large" for the full viewer. Each PDF is drawn once per size and remembered.
 */
export function pdfPreview(src: string, size: "small" | "large" = "small"): Promise<string> {
  const key = `${size}:${src}`;
  const known = previews.get(key);
  if (known) return known;

  const width = size === "small" ? 640 : 1800;
  const job = (async () => {
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument({ url: src }).promise;
    try {
      const page = await doc.getPage(1);
      const natural = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / natural.width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, canvas, viewport }).promise;
      const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.9));
      if (!blob) throw new Error("no picture");
      return URL.createObjectURL(blob);
    } finally {
      doc.destroy?.();
    }
  })();

  previews.set(key, job);
  job.catch(() => previews.delete(key));
  return job;
}
