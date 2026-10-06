/*
  047_integridad_pedidos_y_cierres_auditoria — auditoría de seguridad 2026-10-05

  Pegar completa en Supabase > SQL Editor. Idempotente (se puede correr dos
  veces). No toca datos: solo funciones, triggers y policies.

  Cierra los caminos por los que alguien podía terminar descargando moldes
  pagos sin pagar lo que corresponde. Todos dependían de que el admin aprobara
  a mano un pedido que "parecía" bien:

  1) Formato sin precio => rechazo (antes: piso = mínimo global).
     Un order_item con formato "DXF" en un producto que no vende DXF (hoy,
     NINGÚN producto tiene precio_dxf/pds/mrk/ads cargado) pasaba el trigger
     de piso con el 15 % del precio más barato. El webhook de Mercado Pago
     tenía el mismo problema pero peor (piso 0) y se corrige en api/.
     Ahora: si el formato declarado no tiene precio en ese producto (en
     ninguna moneda), el insert se rechaza: ese formato no está a la venta.

  2) Sumar ítems a un pedido pendiente después de pagar el total original.
     La policy de order_items (035) exige que el pedido siga 'pendiente' pero
     no tiene ventana de tiempo ni compara la suma de ítems con orders.total.
     Alguien podía armar un pedido de 1 molde, transferir ese monto, y desde
     la consola del navegador agregarle 20 ítems más al mismo pedido antes de
     que el admin lo marcara pagado => la RLS entregaba los 21 productos.
     Ahora: trigger que exige (a) pedido creado hace menos de 15 minutos (el
     checkout inserta los ítems segundos después del pedido) y (b) suma de
     ítems <= total del pedido (+1 % de tolerancia por redondeo).

  3) cart_snapshot (JSON escrito por el navegador) sin validar.
     api/guest-order.ts y el panel admin lo usan como respaldo cuando
     order_items quedó vacío. Un invitado podía insertar un pedido SIN
     order_items (así el trigger de piso nunca corre) y un snapshot con 30
     moldes caros a $1, pagar $30 por transferencia, y al aprobarlo el admin
     bajar los 30. Ahora: trigger en orders que valida cada ítem del snapshot
     contra el catálogo (producto activo, formato con precio, precio >= piso
     del formato) y suma <= total. api/guest-order.ts además revalida al
     entregar.

  4) Un usuario logueado podía poner guest_email ajeno en su propio pedido
     (la policy 022 no lo prohibía): al marcarlo pagado, el sitio le mandaba
     a ese tercero un mail "oficial" con el link de descarga, y ese tercero
     podía ver el pedido en /mi-pedido. Ahora: pedido con cuenta => sin
     guest_email.

  5) downloads: tabla legada en la que ningún código escribe; la policy de
     INSERT (038) dejaba crear filas con file_url arbitrario (solo ruido en
     "Mis descargas", la firma del archivo igual la frena la policy de
     storage). Se cierra el INSERT.

  6) Defensa en profundidad: is_recent_guest_order() sin EXECUTE para roles
     futuros; handle_new_user() con search_path fijo; el trigger anti
     escalada de rol también en INSERT (hoy no hay policy de INSERT en
     profiles, pero si alguien la agrega mañana, role sigue sin poder ser
     'admin').
*/

-- ============================================================
-- 1) Piso de precio: el formato declarado tiene que estar a la venta
-- ============================================================
CREATE OR REPLACE FUNCTION public.validar_piso_precio_order_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p RECORD;
  file_type text;
  precio_especifico_ars numeric;
  precio_especifico_usd numeric;
  piso_ars numeric;
  piso_usd numeric;
BEGIN
  SELECT price, precio_carton, precio_pdf_a4, precio_pdf_ploter,
         precio_dxf, precio_pds, precio_mrk, precio_ads,
         precio_usd_carton, precio_usd_pdf_a4, precio_usd_pdf_ploter,
         precio_usd_dxf, precio_usd_pds, precio_usd_mrk, precio_usd_ads
  INTO p
  FROM products
  WHERE id = NEW.product_id;

  IF NOT FOUND THEN
    RETURN NEW; -- producto inexistente/eliminado: lo bloquea la FK, no esta validacion
  END IF;

  IF COALESCE(NEW.quantity, 1) < 1 OR COALESCE(NEW.quantity, 1) > 50 THEN
    RAISE EXCEPTION 'Cantidad inválida (%)', NEW.quantity;
  END IF;
  IF NEW.price IS NULL OR NEW.price < 0 THEN
    RAISE EXCEPTION 'Precio inválido (%)', NEW.price;
  END IF;

  -- Mismo mapeo que el filtro de archivos (037) y que api/utils.ts
  -- (formatoAFileType), para que "qué formato es esto" nunca discrepe
  -- entre el precio que se cobra y el archivo que se entrega.
  file_type := public.formato_a_file_type(NEW.formato);
  precio_especifico_ars := CASE file_type
    WHEN 'carton'      THEN p.precio_carton
    WHEN 'pdf_plotter' THEN p.precio_pdf_ploter
    WHEN 'dxf'         THEN p.precio_dxf
    WHEN 'pds'         THEN p.precio_pds
    WHEN 'mrk'         THEN p.precio_mrk
    WHEN 'ads'         THEN p.precio_ads
    ELSE COALESCE(p.precio_pdf_a4, p.price)
  END;
  precio_especifico_usd := CASE file_type
    WHEN 'carton'      THEN p.precio_usd_carton
    WHEN 'pdf_plotter' THEN p.precio_usd_pdf_ploter
    WHEN 'dxf'         THEN p.precio_usd_dxf
    WHEN 'pds'         THEN p.precio_usd_pds
    WHEN 'mrk'         THEN p.precio_usd_mrk
    WHEN 'ads'         THEN p.precio_usd_ads
    ELSE p.precio_usd_pdf_a4
  END;

  IF COALESCE(precio_especifico_ars, 0) > 0 THEN
    piso_ars := precio_especifico_ars * 0.15;
  END IF;
  IF COALESCE(precio_especifico_usd, 0) > 0 THEN
    piso_usd := precio_especifico_usd * 0.15;
  END IF;

  -- ANTES (042): sin precio para ese formato se caía al mínimo global.
  -- AHORA: un formato sin precio cargado no está a la venta para ese
  -- producto; se rechaza en vez de cobrarlo como el más barato.
  IF piso_ars IS NULL AND piso_usd IS NULL THEN
    RAISE EXCEPTION
      'El formato "%" no está disponible para este producto (sin precio cargado).',
      COALESCE(NEW.formato, 'pdf_a4');
  END IF;

  IF (piso_ars IS NULL OR NEW.price < piso_ars) AND (piso_usd IS NULL OR NEW.price < piso_usd) THEN
    RAISE EXCEPTION
      'El precio del item ($%) está muy por debajo del mínimo esperado para el formato "%" de este producto (mínimo ARS: %, mínimo USD: %). Si es una compra legítima con talles reducidos, contactar al administrador.',
      NEW.price, NEW.formato, COALESCE(piso_ars, 0), COALESCE(piso_usd, 0);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validar_piso_precio_order_item_trigger ON order_items;
CREATE TRIGGER validar_piso_precio_order_item_trigger
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_piso_precio_order_item();

-- ============================================================
-- 2) Los ítems de un pedido: solo al crearlo y nunca por más que el total
-- ============================================================
CREATE OR REPLACE FUNCTION public.validar_total_pedido_order_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric;
  v_created timestamptz;
  v_suma numeric;
BEGIN
  SELECT total, created_at INTO v_total, v_created FROM orders WHERE id = NEW.order_id;
  IF NOT FOUND THEN
    RETURN NEW; -- lo bloquea la FK
  END IF;

  -- El checkout inserta los ítems en el mismo instante que el pedido.
  IF v_created < now() - interval '15 minutes' THEN
    RAISE EXCEPTION 'No se pueden agregar ítems a un pedido creado hace más de 15 minutos.';
  END IF;

  SELECT COALESCE(SUM(price * COALESCE(quantity, 1)), 0) INTO v_suma
  FROM order_items
  WHERE order_id = NEW.order_id;

  IF v_suma + NEW.price * COALESCE(NEW.quantity, 1) > v_total * 1.01 + 1 THEN
    RAISE EXCEPTION 'La suma de los ítems (%) supera el total del pedido (%).',
      v_suma + NEW.price * COALESCE(NEW.quantity, 1), v_total;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validar_total_pedido_order_item_trigger ON order_items;
CREATE TRIGGER validar_total_pedido_order_item_trigger
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_total_pedido_order_item();

-- ============================================================
-- 3) cart_snapshot validado contra el catálogo al crear el pedido
-- ============================================================
CREATE OR REPLACE FUNCTION public.validar_cart_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  it jsonb;
  v_suma numeric := 0;
  v_pid uuid;
  v_price numeric;
  v_qty integer;
  v_file_type text;
  v_precio_ars numeric;
  v_precio_usd numeric;
  v_piso numeric;
  p RECORD;
BEGIN
  IF NEW.cart_snapshot IS NULL THEN
    RETURN NEW;
  END IF;
  IF jsonb_typeof(NEW.cart_snapshot) <> 'array' THEN
    RAISE EXCEPTION 'cart_snapshot inválido.';
  END IF;
  IF jsonb_array_length(NEW.cart_snapshot) > 50 THEN
    RAISE EXCEPTION 'cart_snapshot demasiado grande.';
  END IF;

  FOR it IN SELECT * FROM jsonb_array_elements(NEW.cart_snapshot) LOOP
    BEGIN
      v_pid := (it->>'product_id')::uuid;
      v_price := (it->>'price')::numeric;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'cart_snapshot con producto o precio inválido.';
    END;
    v_qty := GREATEST(COALESCE((it->>'quantity')::integer, 1), 1);
    IF v_qty > 50 THEN
      RAISE EXCEPTION 'cart_snapshot con cantidad inválida.';
    END IF;

    SELECT price, precio_carton, precio_pdf_a4, precio_pdf_ploter,
           precio_dxf, precio_pds, precio_mrk, precio_ads,
           precio_usd_carton, precio_usd_pdf_a4, precio_usd_pdf_ploter,
           precio_usd_dxf, precio_usd_pds, precio_usd_mrk, precio_usd_ads
    INTO p
    FROM products
    WHERE id = v_pid AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'cart_snapshot: producto % inexistente o inactivo.', v_pid;
    END IF;

    v_file_type := public.formato_a_file_type(it->>'formato');
    v_precio_ars := CASE v_file_type
      WHEN 'carton'      THEN p.precio_carton
      WHEN 'pdf_plotter' THEN p.precio_pdf_ploter
      WHEN 'dxf'         THEN p.precio_dxf
      WHEN 'pds'         THEN p.precio_pds
      WHEN 'mrk'         THEN p.precio_mrk
      WHEN 'ads'         THEN p.precio_ads
      ELSE COALESCE(p.precio_pdf_a4, p.price)
    END;
    v_precio_usd := CASE v_file_type
      WHEN 'carton'      THEN p.precio_usd_carton
      WHEN 'pdf_plotter' THEN p.precio_usd_pdf_ploter
      WHEN 'dxf'         THEN p.precio_usd_dxf
      WHEN 'pds'         THEN p.precio_usd_pds
      WHEN 'mrk'         THEN p.precio_usd_mrk
      WHEN 'ads'         THEN p.precio_usd_ads
      ELSE p.precio_usd_pdf_a4
    END;

    -- Piso en la moneda del pedido (orders.currency; ARS si no está).
    IF COALESCE(NEW.currency, 'ARS') = 'USD' THEN
      v_piso := v_precio_usd;
    ELSE
      v_piso := v_precio_ars;
    END IF;
    IF COALESCE(v_piso, 0) <= 0 THEN
      RAISE EXCEPTION 'cart_snapshot: el formato "%" no está disponible para el producto %.', it->>'formato', v_pid;
    END IF;
    IF v_price < v_piso * 0.15 THEN
      RAISE EXCEPTION 'cart_snapshot: precio % por debajo del mínimo para el producto % (%).', v_price, v_pid, it->>'formato';
    END IF;

    v_suma := v_suma + v_price * v_qty;
  END LOOP;

  IF v_suma > NEW.total * 1.01 + 1 THEN
    RAISE EXCEPTION 'cart_snapshot: la suma del carrito (%) supera el total del pedido (%).', v_suma, NEW.total;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validar_cart_snapshot_trigger ON orders;
CREATE TRIGGER validar_cart_snapshot_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_cart_snapshot();

-- ============================================================
-- 4) Pedido con cuenta => sin guest_email
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND guest_email IS NULL
    AND payment_status = 'pendiente'
    AND order_status = 'pendiente'
  );

-- ============================================================
-- 5) downloads: tabla legada, sin escritura desde el cliente
-- ============================================================
DROP POLICY IF EXISTS "Users can insert own downloads" ON downloads;

-- ============================================================
-- 6) Defensa en profundidad
-- ============================================================
REVOKE ALL ON FUNCTION public.is_recent_guest_order(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_recent_guest_order(uuid) TO anon, authenticated;

ALTER FUNCTION public.handle_new_user() SET search_path = public;

CREATE OR REPLACE FUNCTION public.prevent_role_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Un perfil nuevo nunca nace admin salvo que lo cree un admin (o el
  -- trigger de auth, que corre sin uid y no manda role).
  IF NEW.role IS DISTINCT FROM 'user' AND auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.role := 'user';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_on_insert ON public.profiles;
CREATE TRIGGER trg_prevent_role_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_on_insert();
