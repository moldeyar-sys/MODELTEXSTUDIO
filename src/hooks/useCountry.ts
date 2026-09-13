import { useState, useEffect } from 'react';

type CountryInfo = {
  country: string;   // código ISO ej: 'AR', 'CL', 'BR'
  isArgentina: boolean;
  loading: boolean;
};

// ipapi.co (servicio externo, de terceros) empezó a devolver 429 "sign up
// for a paid plan" — dejó de funcionar del todo, así que TODO visitante caía
// siempre al default 'AR' sin importar su país real (mostrando precios en
// pesos a compradores de otros países). /api/geo ya existe en este mismo
// proyecto (usa la geolocalización propia de Vercel, gratis, sin límite ni
// problema de CORS porque es del mismo origen) — no hacía falta un servicio
// externo para esto.
const cache: { country?: string; inFlight?: Promise<string> } = {};

function fetchCountry(): Promise<string> {
  if (cache.country) return Promise.resolve(cache.country);
  // Si varios componentes montan a la vez (ej. muchas ProductCard en el
  // catálogo), comparten UN solo pedido en vez de disparar uno cada uno.
  if (!cache.inFlight) {
    cache.inFlight = fetch('/api/geo')
      .then(r => r.json())
      .then(data => (data?.country || 'AR') as string)
      .catch(() => 'AR')
      .then(code => {
        cache.country = code;
        return code;
      });
  }
  return cache.inFlight;
}

export function useCountry(): CountryInfo {
  const [country, setCountry] = useState<string>(cache.country || '');
  const [loading, setLoading] = useState(!cache.country);

  useEffect(() => {
    if (cache.country) return;
    fetchCountry().then(setCountry).finally(() => setLoading(false));
  }, []);

  return {
    country,
    isArgentina: !country || country === 'AR',
    loading,
  };
}
