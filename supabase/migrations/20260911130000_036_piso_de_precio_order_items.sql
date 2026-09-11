/*
  036_piso_de_precio_order_items — FIX DE SEGURIDAD CRÍTICO

  ## Problema
  order_items.price (y por extensión orders.total, que es la suma de estos)
  lo escribe el CLIENTE en el INSERT (ver src/pages/CheckoutPage.tsx), sin
  que nada del lado servidor lo recalcule contra el precio real de
  products. El pago automático por Mercado Pago ya está protegido (el
  webhook vuelve a pedir el monto real a la API de MP y lo compara contra
  un piso calculado desde products — ver api/mp-webhook.ts, función
  precioMinimo), pero para pagos MANUALES (transferencia, Binance, PayPal,
  Payoneer, Wise) el único control es que el admin compare a ojo el total
  del pedido contra el catálogo antes de tocar "Marcar pagado". Alguien
  podía insertar un order_item con un price inventado muy por debajo del
  real (ej. $500 en vez de $80.000), pagar exactamente eso, y esperar que
  el admin no lo note.

  ## Fix (a propósito conservador)
  Un piso MÍNIMO por producto, calcado de precioMinimo() en mp-webhook.ts
  (mismas columnas, incluyendo los formatos industriales precio_dxf/pds/
  mrk/ads que esa función ya contempla), no una validación exacta: el
  precio real puede bajar legítimamente por menos talles seleccionados
  (calcAdjustedPrice en src/lib/sizeUtils.ts resta hasta $10.000/$4.000/
  $3.000 ARS por talle según formato). En vez de replicar esa fórmula
  entera acá (arriesgando falsos rechazos de compras legítimas con pocos
  talles), el piso es: 15% del precio de catálogo más barato entre los
  formatos cargados para ese producto.

  IMPORTANTE: ARS y USD se calculan como dos pisos SEPARADOS (nunca
  mezclados en un mismo mínimo — mezclarlos haría que el piso en pesos
  quedara en centavos, porque los montos en USD son numéricamente mucho
  más chicos). Se acepta el precio si supera CUALQUIERA de los dos pisos,
  para no bloquear compras legítimas en ninguna de las dos monedas.

  Si el producto no tiene ningún precio cargado en una moneda (todo
  NULL/0), esa moneda simplemente no aporta piso — no bloquea nada por eso.
  Si NINGUNA de las dos monedas tiene precio cargado, no se puede validar
  y no se bloquea nada.

  No reemplaza la revisión del admin: sigue siendo buena práctica cruzar el
  total contra el catálogo antes de aprobar un pago manual. Este piso es
  una red de seguridad automática, no el único control.

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

  -- Rechazar solo si NO alcanza ninguno de los dos pisos vigentes (el que no
  -- tenga precios cargados no cuenta en contra).
  IF (piso_ars IS NULL OR NEW.price < piso_ars) AND (piso_usd IS NULL OR NEW.price < piso_usd) THEN
    RAISE EXCEPTION
      'El precio del item ($%) está muy por debajo del mínimo esperado para este producto (mínimo ARS: %, mínimo USD: %). Si es una compra legítima con talles reducidos, contactar al administrador.',
      NEW.price, COALESCE(piso_ars, 0), COALESCE(piso_usd, 0);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validar_piso_precio_order_item_trigger ON order_items;
CREATE TRIGGER validar_piso_precio_order_item_trigger
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_piso_precio_order_item();
