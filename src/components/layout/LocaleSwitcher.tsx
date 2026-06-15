import { useLocale, type Lang, type Currency } from '../../lib/locale';

export function LocaleSwitcher({ className = '' }: { className?: string }) {
  const { lang, currency, setLang, setCurrency } = useLocale();

  const pill = (active: boolean) =>
    `px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${
      active ? 'bg-primary-800 text-white' : 'text-gray-500 hover:text-primary-800'
    }`;

  const langs: Lang[] = ['es', 'en'];
  const currencies: Currency[] = ['ARS', 'USD'];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5" role="group" aria-label="Idioma">
        {langs.map(l => (
          <button key={l} onClick={() => setLang(l)} className={pill(lang === l)} aria-pressed={lang === l}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5" role="group" aria-label="Moneda">
        {currencies.map(c => (
          <button key={c} onClick={() => setCurrency(c)} className={pill(currency === c)} aria-pressed={currency === c}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
