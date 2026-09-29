import { zip } from 'fflate';

/**
 * Los archivos gratis están en el bucket público de Supabase: con ?download=
 * Supabase responde "Content-Disposition: attachment" y el navegador descarga
 * el archivo en vez de abrir el PDF en otra pestaña.
 */
export function directDownloadUrl(url: string, name: string) {
  if (!/\/storage\/v1\/object\/public\//.test(url)) return url;
  return `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(name)}`;
}

export function downloadFile(url: string, name: string) {
  const a = document.createElement('a');
  a.href = directDownloadUrl(url, name);
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export interface ZipEntry {
  /** Ruta dentro del ZIP, con carpetas: "PDF A4/VST414 TALLE L.pdf". */
  path: string;
  url: string;
}

function saveBlob(blob: Blob, name: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 60_000);
}

/**
 * Baja los archivos (de a 3 en paralelo) y los guarda en un ZIP sin
 * comprimir: PDF y CDR ya vienen comprimidos, recomprimirlos solo tarda más.
 */
export async function downloadZip(zipName: string, entries: ZipEntry[], onProgress?: (done: number, total: number) => void) {
  const files: Record<string, Uint8Array> = {};
  const used = new Set<string>();
  const uniquePath = (p: string) => {
    let out = p;
    for (let i = 2; used.has(out.toLowerCase()); i++) out = p.replace(/(\.[^./]+)?$/, ` (${i})$1`);
    used.add(out.toLowerCase());
    return out;
  };

  let done = 0;
  const queue = [...entries];
  const worker = async () => {
    for (let e = queue.shift(); e; e = queue.shift()) {
      const res = await fetch(e.url);
      if (!res.ok) throw new Error(`No se pudo bajar ${e.path} (${res.status})`);
      files[uniquePath(e.path)] = new Uint8Array(await res.arrayBuffer());
      onProgress?.(++done, entries.length);
    }
  };
  await Promise.all([worker(), worker(), worker()]);

  const data = await new Promise<Uint8Array>((resolve, reject) =>
    zip(files, { level: 0 }, (err, out) => (err ? reject(err) : resolve(out))),
  );
  saveBlob(new Blob([data], { type: 'application/zip' }), zipName);
}

export function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('es-AR', { maximumFractionDigits: 1 })} MB`;
}
