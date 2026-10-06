// Funcion serverless: permite a quien compro SIN CREAR CUENTA consultar y
// descargar los archivos de su pedido usando numero de pedido + email (nunca
// contrasena). Usa la service role (la misma que ya usa notify-order.ts) para
// leer el pedido real y firmar las descargas — asi no hace falta abrir el
// acceso a orders/order_items/product_files a nadie sin sesion: la unica
// puerta es esta funcion, y solo entrega datos si pedido + email calzan.

import { formatoAFileType, pisoDelItem, PRODUCT_PRICE_COLUMNS } from './utils';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jotibqgyrcgwctiolhcw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const FILES_BUCKET = 'product-files';
const SIGNED_URL_TTL = 300; // 5 minutos: alcanza para arrancar la descarga, se puede volver a pedir cuando quiera

function signPath(path: string): string {
  // Cada segmento (separado por "/") se codifica aparte para no romper la barra.
  return path.split('/').map(encodeURIComponent).join('/');
}

// El mapeo formato -> file_type (formatoAFileType, en api/utils.ts) es el
// mismo que usa la migración 037 y el webhook. Este endpoint usa la service
// role (ignora RLS), así que el filtro por formato tiene que aplicarse acá
// también — la policy de product_files sola no alcanza.

/**
 * Filtra los archivos de un producto según lo que efectivamente compró el
 * cliente: si el producto tiene un solo file_type entre todos sus archivos,
 * se entregan todos (compatibilidad con productos ya cargados donde son
 * piezas del mismo formato). Si tiene más de uno, solo el que coincide con
 * el formato pagado.
 */
function filesPermitidosPorFormato(
  fileRows: { id: string; product_id: string; file_name: string; file_url: string; file_type?: string | null }[],
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
    const orderIdInput = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!orderIdInput || !email) {
      res.status(400).json({ error: 'Falta el número de pedido o el email.' });
      return;
    }
    // CheckoutPage.tsx solo le muestra al invitado los primeros 8 caracteres
    // del UUID (ej. "#a1b2c3d4"), pero acá se buscaba por id=eq.<eso mismo> —
    // un UUID truncado nunca matchea (y hace que PostgREST devuelva 400
    // "invalid input syntax for type uuid", que este código traducía como un
    // genérico "Error interno"), así que el invitado no podía consultar su
    // propio pedido con el dato que el sitio le dio. Un UUID completo se
    // sigue buscando exacto (más rápido, usa el índice); un prefijo de 8
    // caracteres hex se busca con LIKE, siempre combinado con el email como
    // segundo factor (igual de seguro: adivinar un prefijo de 8 caracteres Y
    // el email exacto de otra persona no es más fácil que hoy).
    const esUuidCompleto = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdInput);
    const esPrefijoCorto = /^[0-9a-f]{8}$/i.test(orderIdInput);
    if (!esUuidCompleto && !esPrefijoCorto) {
      res.status(404).json({ error: 'No encontramos ningún pedido con ese número y ese email. Revisá que estén bien escritos.' });
      return;
    }
    // Postgres no tiene operador LIKE nativo sobre uuid, así que un prefijo
    // corto se resuelve trayendo los pedidos de ESE email (siempre exige el
    // email exacto como segundo factor, acotado a los últimos 50 para no
    // traer de más) y comparando el prefijo en el código, en vez de armar un
    // filtro id=like.* que Postgres podría rechazar.
    const filtroId = esUuidCompleto ? `&id=eq.${encodeURIComponent(orderIdInput)}` : '';
    const ORDERS_BASE = `${SUPABASE_URL}/rest/v1/orders?guest_email=eq.${encodeURIComponent(email)}${filtroId}`;
    const ORDERS_TAIL = `order_items(quantity,price,formato,sizes,product_name,product:products(id,name))&order=created_at.desc&limit=50`;
    const H2 = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };
    let orderRes = await fetch(
      `${ORDERS_BASE}&select=id,total,payment_method,payment_status,order_status,created_at,currency,cart_snapshot,${ORDERS_TAIL}`,
      { headers: H2 },
    );
    if (!orderRes.ok) {
      // Resiliente: orders.currency puede no estar aplicada todavia.
      orderRes = await fetch(
        `${ORDERS_BASE}&select=id,total,payment_method,payment_status,order_status,created_at,cart_snapshot,${ORDERS_TAIL}`,
        { headers: H2 },
      );
    }
    if (!orderRes.ok) throw new Error(`Supabase orders ${orderRes.status}: ${await orderRes.text()}`);
    const rows = (await orderRes.json()) as any[];
    // Ya vienen ordenados por más reciente primero (order=created_at.desc):
    // el primero que matchea el prefijo corto es el pedido correcto.
    const order = esUuidCompleto
      ? rows?.[0]
      : rows.find((o) => String(o.id).toLowerCase().startsWith(orderIdInput.toLowerCase()));

    if (!order) {
      res.status(404).json({ error: 'No encontramos ningún pedido con ese número y ese email. Revisá que estén bien escritos.' });
      return;
    }

    const summary = {
      id: order.id,
      total: order.total,
      currency: order.currency ?? 'ARS',
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
    const usandoRespaldo = !order.order_items?.length;
    const items: any[] = !usandoRespaldo
      ? order.order_items
      : (Array.isArray(order.cart_snapshot) ? order.cart_snapshot : []).map((c: any) => ({
          quantity: c.quantity,
          price: c.price,
          formato: c.formato,
          sizes: c.sizes,
          product_name: c.product_name,
          product: { id: c.product_id, name: c.product_name },
        }));

    // El cart_snapshot lo escribe el NAVEGADOR y no pasa por el trigger de
    // piso de precio de order_items (migración 042): un pedido de invitado
    // con order_items vacío a propósito y un snapshot con 30 moldes caros a
    // $1 cada uno, aprobado a mano por transferencia, entregaba los 30. Antes
    // de entregar nada desde el respaldo se verifica contra el catálogo real:
    // cada item con precio >= precio real del formato (ajustado por talles) y
    // la suma de los items <= total del pedido. Si no cierra, el pedido queda
    // "en revisión" y no se firma ningún archivo.
    if (usandoRespaldo && items.length) {
      const ids = Array.from(new Set(items.map((it) => it.product?.id).filter(Boolean)));
      const pRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=in.(${ids.map(encodeURIComponent).join(',')})&select=${PRODUCT_PRICE_COLUMNS}`,
        { headers: H2 },
      );
      const productos = new Map<string, any>();
      if (pRes.ok) for (const p of (await pRes.json()) as any[]) productos.set(p.id, p);
      let suma = 0;
      let coherente = items.length <= 50;
      const moneda: 'ARS' | 'USD' = order.currency === 'USD' ? 'USD' : 'ARS';
      for (const it of items) {
        const qty = Math.max(1, Number(it.quantity) || 1);
        const piso = pisoDelItem(productos.get(it.product?.id), it.formato, it.sizes, moneda);
        const price = Number(it.price);
        if (piso === null || !Number.isFinite(price) || price < piso) { coherente = false; break; }
        suma += price * qty;
      }
      if (coherente && suma > Number(order.total) * 1.01 + 1) coherente = false;
      if (!coherente) {
        console.warn(`guest-order: pedido ${order.id} pagado pero su cart_snapshot no cierra contra el catálogo; requiere revisión manual`);
        res.status(200).json({ order: summary, files: [], pending: true, review: true });
        return;
      }
    }
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
