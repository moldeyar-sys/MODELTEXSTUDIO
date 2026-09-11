// Funcion serverless: permite a quien compro SIN CREAR CUENTA consultar y
// descargar los archivos de su pedido usando numero de pedido + email (nunca
// contrasena). Usa la service role (la misma que ya usa notify-order.ts) para
// leer el pedido real y firmar las descargas — asi no hace falta abrir el
// acceso a orders/order_items/product_files a nadie sin sesion: la unica
// puerta es esta funcion, y solo entrega datos si pedido + email calzan.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FILES_BUCKET = 'product-files';
const SIGNED_URL_TTL = 300; // 5 minutos: alcanza para arrancar la descarga, se puede volver a pedir cuando quiera

function signPath(path: string): string {
  // Cada segmento (separado por "/") se codifica aparte para no romper la barra.
  return path.split('/').map(encodeURIComponent).join('/');
}

// Mismo mapeo que la migración 037 (formato_a_file_type) y que api/mp-webhook.ts
// (precioReal): texto libre que el comprador eligió -> file_type real del archivo.
// Este endpoint usa la service role (ignora RLS), así que el filtro por formato
// tiene que aplicarse acá también — la policy de product_files sola no alcanza.
function formatoAFileType(formato: string | null | undefined): string {
  const f = (formato || '').toLowerCase();
  if (f.includes('cart')) return 'carton';
  if (f.includes('pl')) return 'pdf_plotter';
  if (f.includes('dxf') || f.includes('aama')) return 'dxf';
  if (f.includes('pds') || f.includes('optitex')) return 'pds';
  if (f.includes('mrk') || f.includes('tizado')) return 'mrk';
  if (f.includes('ads') || f.includes('audaces')) return 'ads';
  return 'pdf_a4';
}

/**
 * Filtra los archivos de un producto según lo que efectivamente compró el
 * cliente: si el producto tiene un solo file_type entre todos sus archivos,
 * se entregan todos (compatibilidad con productos ya cargados donde son
 * piezas del mismo formato). Si tiene más de uno, solo el que coincide con
 * el formato pagado.
 */
function filesPermitidosPorFormato(
  fileRows: { id: string; product_id: string; file_type?: string | null }[],
  formatoPorProducto: Map<string, string[]>,
): typeof fileRows {
  const byProduct = new Map<string, typeof fileRows>();
  for (const f of fileRows) {
    const list = byProduct.get(f.product_id) || [];
    list.push(f);
    byProduct.set(f.product_id, list);
  }
  const result: typeof fileRows = [];
  for (const [productId, files] of byProduct) {
    const distinctTypes = new Set(files.map((f) => f.file_type || 'pdf_a4'));
    if (distinctTypes.size <= 1) {
      result.push(...files);
      continue;
    }
    const purchasedTypes = new Set(formatoPorProducto.get(productId) || []);
    result.push(...files.filter((f) => purchasedTypes.has(f.file_type || 'pdf_a4')));
  }
  return result;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!SERVICE_ROLE) {
    console.error('guest-order: falta SUPABASE_SERVICE_ROLE_KEY');
    res.status(500).json({ error: 'La consulta de pedidos todavía no está configurada.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!orderId || !email) {
      res.status(400).json({ error: 'Falta el número de pedido o el email.' });
      return;
    }

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&guest_email=eq.${encodeURIComponent(email)}` +
        `&select=id,total,payment_method,payment_status,order_status,created_at,cart_snapshot,` +
        `order_items(quantity,price,formato,sizes,product_name,product:products(id,name))`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (!orderRes.ok) throw new Error(`Supabase orders ${orderRes.status}: ${await orderRes.text()}`);
    const rows = (await orderRes.json()) as any[];
    const order = rows?.[0];

    if (!order) {
      res.status(404).json({ error: 'No encontramos ningún pedido con ese número y ese email. Revisá que estén bien escritos.' });
      return;
    }

    const summary = {
      id: order.id,
      total: order.total,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      created_at: order.created_at,
    };

    if (order.payment_status !== 'pagado') {
      res.status(200).json({
        order: summary,
        files: [],
        pending: true,
      });
      return;
    }

    // Si el guardado de order_items falló en el checkout (ver CheckoutPage), se
    // reconstruye desde el respaldo guardado junto con el pedido (cart_snapshot) —
    // mismo patrón ya usado en el panel admin — para no dejar a un cliente que
    // sí pagó sin forma de bajar lo que compró.
    const items: any[] =
      order.order_items?.length
        ? order.order_items
        : (order.cart_snapshot || []).map((c: any) => ({
            quantity: c.quantity,
            price: c.price,
            formato: c.formato,
            sizes: c.sizes,
            product_name: c.product_name,
            product: { id: c.product_id, name: c.product_name },
          }));
    const productIds = Array.from(new Set(items.map((it) => it.product?.id).filter(Boolean)));
    const productNames = new Map(items.map((it) => [it.product?.id, it.product?.name || it.product_name || 'Producto']));
    const formatoPorProducto = new Map<string, string[]>();
    for (const it of items) {
      const pid = it.product?.id;
      if (!pid) continue;
      const list = formatoPorProducto.get(pid) || [];
      list.push(formatoAFileType(it.formato));
      formatoPorProducto.set(pid, list);
    }

    let files: { id: string; product_name: string; file_name: string; signed_url: string | null }[] = [];
    if (productIds.length > 0) {
      const filesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/product_files?product_id=in.(${productIds.join(',')})&select=id,product_id,file_name,file_url,file_type`,
        { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
      );
      const allFileRows = filesRes.ok ? ((await filesRes.json()) as any[]) : [];
      const fileRows = filesPermitidosPorFormato(allFileRows, formatoPorProducto);

      files = await Promise.all(
        fileRows.map(async (f) => {
          let signedUrl: string | null = null;
          try {
            const signRes = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${FILES_BUCKET}/${signPath(f.file_url)}`, {
              method: 'POST',
              headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ expiresIn: SIGNED_URL_TTL }),
            });
            if (signRes.ok) {
              const signData = (await signRes.json()) as { signedURL?: string };
              if (signData.signedURL) signedUrl = `${SUPABASE_URL}/storage/v1${signData.signedURL}`;
            }
          } catch {
            /* si falla firmar uno, el resto sigue */
          }
          return {
            id: f.id as string,
            product_name: productNames.get(f.product_id) || 'Producto',
            file_name: f.file_name as string,
            signed_url: signedUrl,
          };
        }),
      );
    }

    res.status(200).json({ order: summary, files: files.filter((f) => f.signed_url) });
  } catch (err) {
    console.error('guest-order error', err);
    res.status(500).json({ error: 'Error interno consultando el pedido.' });
  }
}
