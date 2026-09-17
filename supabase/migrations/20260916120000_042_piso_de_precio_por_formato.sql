/*
  042_piso_de_precio_por_formato — FIX DE SEGURIDAD (auditoría 2026-09-16)

  ## Problema
  El piso de precio de la migración 036 (validar_piso_precio_order_item)
  calcula el mínimo aceptable como el 15% del precio de catálogo MÁS BARATO
  entre TODOS los formatos cargados del producto — nunca mira NEW.formato.
  api/mp-webhook.ts sí resuelve el precio del FORMATO específico declarado
  (función precioReal()) desde que se corrigió ese mismo riesgo para
  Mercado Pago, pero el trigger SQL — que corre en TODO insert de
  order_items, incluidos los pagos manuales (transferencia, Binance, PayPal,
  Payoneer, Wise) y las compras de invitado — se quedó con el criterio viejo.

  Ejemplo concreto: un producto con PDF-A4 a $30.000 y Cartón a $80.000.
  Antes: se podía insertar un order_item con formato='Moldes en Cartón' y
  price=$4.500 (15% del PDF-A4, el más barato) y el trigger lo aceptaba
  igual, porque nunca comparaba contra el precio real de Cartón. La policy
  de storage (migración 037) entrega igual los archivos de Cartón porque
  matchea por formato_a_file_type(oi.formato) = 'carton', sin mirar el precio.

  ## Fix
  Mismo criterio que ya usa formato_a_file_type() (migración 037) para
  saber qué formato es cada order_item, mapeado a la columna de precio real
  correspondiente (ARS y USD por separado, igual que 036). El piso pasa a
  ser el 15% del precio REAL de ESE formato. Si ese precio específico no
  está cargado (0/NULL) — o si el formato no matchea ninguno conocido —
  se cae al criterio de 036 (mínimo global) como red de seguridad, nunca
  más permisivo que antes.

  Idempotente.
*/

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
  precios_ars numeric[];
  precios_usd numeric[];
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

  -- 1) Precio del FORMATO específico declarado en el order_item (mismo
  --    mapeo que ya usa el filtro de archivos de la migración 037, para que
  --    "qué formato es esto" nunca discrepe entre el precio y el archivo
  --    que se entrega).
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

  -- 2) Si el formato específico no tiene precio cargado en ninguna moneda
  --    (o no matcheó ninguno conocido con precio > 0), cae al criterio de
  --    la migración 036: mínimo global entre todos los formatos cargados.
  --    Nunca queda MÁS permisivo que antes de este fix.
  IF piso_ars IS NULL AND piso_usd IS NULL THEN
    precios_ars := ARRAY[]::numeric[];
    IF COALESCE(p.price, 0) > 0 THEN precios_ars := array_append(precios_ars, p.price); END IF;
    IF COALESCE(p.precio_carton, 0) > 0 THEN precios_ars := array_append(precios_ars, p.precio_carton); END IF;
    IF COALESCE(p.precio_pdf_a4, 0) > 0 THEN precios_ars := array_append(precios_ars, p.precio_pdf_a4); END IF;
    IF COALESCE(p.precio_pdf_ploter, 0) > 0 THEN precios_ars := array_append(precios_ars, p.precio_pdf_ploter); END IF;
    IF COALESCE(p.precio_dxf, 0) > 0 THEN precios_ars := array_append(precios_ars, p.precio_dxf); END IF;
    IF COALESCE(p.precio_pds, 0) > 0 THEN precios_ars := array_append(precios_ars, p.precio_pds); END IF;
    IF COALESCE(p.precio_mrk, 0) > 0 THEN precios_ars := array_append(precios_ars, p.precio_mrk); END IF;
    IF COALESCE(p.precio_ads, 0) > 0 THEN precios_ars := array_append(precios_ars, p.precio_ads); END IF;

    precios_usd := ARRAY[]::numeric[];
    IF COALESCE(p.precio_usd_carton, 0) > 0 THEN precios_usd := array_append(precios_usd, p.precio_usd_carton); END IF;
    IF COALESCE(p.precio_usd_pdf_a4, 0) > 0 THEN precios_usd := array_append(precios_usd, p.precio_usd_pdf_a4); END IF;
    IF COALESCE(p.precio_usd_pdf_ploter, 0) > 0 THEN precios_usd := array_append(precios_usd, p.precio_usd_pdf_ploter); END IF;
    IF COALESCE(p.precio_usd_dxf, 0) > 0 THEN precios_usd := array_append(precios_usd, p.precio_usd_dxf); END IF;
    IF COALESCE(p.precio_usd_pds, 0) > 0 THEN precios_usd := array_append(precios_usd, p.precio_usd_pds); END IF;
    IF COALESCE(p.precio_usd_mrk, 0) > 0 THEN precios_usd := array_append(precios_usd, p.precio_usd_mrk); END IF;
    IF COALESCE(p.precio_usd_ads, 0) > 0 THEN precios_usd := array_append(precios_usd, p.precio_usd_ads); END IF;

    IF array_length(precios_ars, 1) IS NULL AND array_length(precios_usd, 1) IS NULL THEN
      RETURN NEW; -- sin ningun precio de catalogo cargado en ninguna moneda: no se puede validar
    END IF;

    piso_ars := CASE WHEN array_length(precios_ars, 1) IS NOT NULL
      THEN (SELECT MIN(v) FROM unnest(precios_ars) AS v) * 0.15 ELSE NULL END;
    piso_usd := CASE WHEN array_length(precios_usd, 1) IS NOT NULL
      THEN (SELECT MIN(v) FROM unnest(precios_usd) AS v) * 0.15 ELSE NULL END;
  END IF;

  -- Rechazar solo si NO alcanza ninguno de los dos pisos vigentes (el que no
  -- tenga precio cargado no cuenta en contra).
  IF (piso_ars IS NULL OR NEW.price < piso_ars) AND (piso_usd IS NULL OR NEW.price < piso_usd) THEN
    RAISE EXCEPTION
      'El precio del item ($%) está muy por debajo del mínimo esperado para el formato "%" de este producto (mínimo ARS: %, mínimo USD: %). Si es una compra legítima con talles reducidos, contactar al administrador.',
      NEW.price, NEW.formato, COALESCE(piso_ars, 0), COALESCE(piso_usd, 0);
  END IF;

  RETURN NEW;
END;
$$;

-- El trigger ya existe (036); CREATE OR REPLACE FUNCTION de arriba alcanza
-- para que use el cuerpo nuevo. Se repite el DROP/CREATE del trigger solo
-- por prolijidad e idempotencia (misma definición, no cambia nada más).
DROP TRIGGER IF EXISTS validar_piso_precio_order_item_trigger ON order_items;
CREATE TRIGGER validar_piso_precio_order_item_trigger
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_piso_precio_order_item();
