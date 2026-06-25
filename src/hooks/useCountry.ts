import { useState, useEffect } from 'react';

type CountryInfo = {
  country: string;   // código ISO ej: 'AR', 'CL', 'BR'
  isArgentina: boolean;
  loading: boolean;
};

const cache: { country?: string } = {};

export function useCountry(): CountryInfo {
  const [country, setCountry] = useState<string>(cache.country || '');
  const [loading, setLoading] = useState(!cache.country);

  useEffect(() => {
    if (cache.country) return;
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const code = data?.country_code || 'AR';
        cache.country = code;
        setCountry(code);
      })
      .catch(() => {
        cache.country = 'AR';
        setCountry('AR');
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    country,
    isArgentina: !country || country === 'AR',
    loading,
  };
}
