/*
  040_limite_chat_por_ip — FIX DE SEGURIDAD MEDIA (auditoria sept. 2026)

  El limite de 10 preguntas gratis (sin cuenta) se contaba SOLO por
  session_id, un valor que genera y manda el propio navegador — borrar el
  localStorage o abrir una ventana de incognito genera un session_id nuevo
  y resetea el contador a cero. Se suma un segundo conteo por IP+dia como
  señal mas dificil de rotar (no perfecta: varias personas detras del mismo
  NAT/oficina comparten IP, pero corta el caso comun de "recargo y sigo
  preguntando gratis para siempre").
*/

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS ip_address text;

CREATE OR REPLACE FUNCTION public.count_ip_messages_today(p_ip text)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT count(*)::integer FROM chat_messages
  WHERE ip_address = p_ip
    AND role = 'user'
    AND user_id IS NULL
    AND created_at > now() - interval '24 hours';
$$;
GRANT EXECUTE ON FUNCTION public.count_ip_messages_today(text) TO anon, authenticated;
