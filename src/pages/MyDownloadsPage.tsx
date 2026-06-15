import { useState, useEffect } from 'react';
import { Download, Package, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { createSignedDownloadUrl, isStoragePath } from '../lib/storage';

interface DownloadItem {
  id: string;
  product_name: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export default function MyDownloadsPage() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    fetchDownloads();
  }, [user?.id]);

  // Dispara la descarga con un <a> temporal, sin navegar ni abrir pestaña
  // (el signed URL ya fuerza Content-Disposition: attachment).
  const triggerDownload = (url: string, filename?: string, newTab = false) => {
    const a = document.createElement('a');
    a.href = url;
    if (newTab) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else if (filename) {
      a.download = filename;
    }
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownload = async (dl: DownloadItem) => {
    setDownloadError('');
    // Archivos legacy con URL http publica: abrir en pestaña nueva.
    if (!isStoragePath(dl.file_url)) {
      triggerDownload(dl.file_url, undefined, true);
      return;
    }
    // Archivos del bucket privado: signed URL temporal -> descarga en el lugar.
    setDownloadingId(dl.id);
    try {
      const url = await createSignedDownloadUrl(dl.file_url);
      if (!url) {
        setDownloadError('No se pudo generar el enlace de descarga. Verificá que tu compra esté pagada.');
        return;
      }
      triggerDownload(url, dl.file_name);
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchDownloads = async () => {
    if (!user?.id) return;
    setLoading(true);

    const allDownloads: DownloadItem[] = [];

    // Fetch files from product_files for purchased products
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('id, order_items(product_id, products(id, name)), created_at')
      .eq('user_id', user.id)
      .eq('payment_status', 'pagado');

    if (paidOrders) {
      // Get unique product IDs from paid orders
      const productIds = new Set<string>();
      const productNameMap: Record<string, string> = {};

      for (const order of paidOrders) {
        const items = order.order_items as unknown as Array<{ product_id: string | null; products?: { id: string; name: string } | null }>;
        for (const item of items) {
          if (item.product_id) {
            productIds.add(item.product_id);
            if (item.products) {
              productNameMap[item.product_id] = item.products.name;
            }
          }
        }
      }

      // Fetch files for those products
      if (productIds.size > 0) {
        const { data: files } = await supabase
          .from('product_files')
          .select('*')
          .in('product_id', Array.from(productIds));

        if (files) {
          for (const file of files) {
            allDownloads.push({
              id: file.id,
              product_name: productNameMap[file.product_id] || 'Producto',
              file_name: file.file_name,
              file_url: file.file_url,
              created_at: file.created_at,
            });
          }
        }
      }
    }

    // Also fetch from downloads table
    const { data: directDownloads } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', user.id);

    if (directDownloads) {
      for (const d of directDownloads) {
        allDownloads.push({
          id: d.id,
          product_name: 'Archivo descargable',
          file_name: d.file_name,
          file_url: d.file_url,
          created_at: d.created_at,
        });
      }
    }

    // Deduplicate by file_url
    const unique = Array.from(new Map(allDownloads.map(d => [d.file_url, d])).values());
    unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setDownloads(unique);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-primary-900 mb-8">Mis descargas</h1>

          {downloadError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {downloadError}
            </div>
          )}

          {downloads.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <h2 className="font-display text-2xl font-bold text-primary-900 mb-2">Aun no tienes descargas disponibles</h2>
              <p className="text-gray-500 mb-6">Compra moldes digitales para acceder a tus descargas</p>
              <Link to="/catalogo" className="btn-primary">Ver catalogo</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {downloads.map(dl => (
                <div key={dl.id} className="card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dl.product_name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{dl.file_name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Disponible desde {new Date(dl.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(dl)}
                      disabled={downloadingId === dl.id}
                      className="btn-primary text-sm py-2 inline-flex items-center gap-2 self-start sm:self-center disabled:opacity-60"
                    >
                      {downloadingId === dl.id ? (
                        <><Loader2 size={16} className="animate-spin" /> Generando...</>
                      ) : (
                        <><Download size={16} /> Descargar</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
