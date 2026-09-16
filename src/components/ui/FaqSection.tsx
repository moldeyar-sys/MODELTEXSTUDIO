// Bloque de preguntas frecuentes de una pagina comercial.
//
// Las preguntas NO viven aca: salen de src/lib/landingFaqs.ts, el mismo modulo
// que usa middleware.ts para el HTML inicial y para el JSON-LD. Antes cada
// pagina tenia dos listas distintas (una en su .tsx y otra en el middleware) y
// ya se habian desincronizado: /moldes-pdf mostraba 8 preguntas al usuario y 7
// al robot. Un FAQPage cuya respuesta el visitante no ve es exactamente lo que
// Google marca como invalido, asi que ahora hay una sola lista por ruta.
//
// Este componente es el UNICO dueno del schema FAQPage de su pagina: si una
// pagina lo usa, no debe emitir otro FAQPage por su cuenta (los dos usarian el
// mismo id SCHEMA_IDS.faq y se pisarian al desmontar).
import { useMemo } from 'react';
import { useStructuredData } from '../../lib/seo';
import { SCHEMA_IDS } from '../../lib/schemaIds';
import { faqsFor } from '../../lib/landingFaqs';

export function FaqSection({
  path,
  title = 'Preguntas frecuentes',
  className = 'card p-6 sm:p-8 mt-6',
}: {
  path: string;
  title?: string;
  className?: string;
}) {
  const faqs = faqsFor(path);

  const schema = useMemo(
    () =>
      faqs.length
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }
        : null,
    [faqs],
  );
  useStructuredData(schema, SCHEMA_IDS.faq);

  if (!faqs.length) return null;

  return (
    <section className={className}>
      <h2 className="font-display text-2xl font-bold text-primary-900">{title}</h2>
      <div className="mt-4 divide-y divide-gray-100">
        {faqs.map((item) => (
          <div key={item.q} className="py-4 first:pt-0 last:pb-0">
            <h3 className="font-semibold text-primary-900">{item.q}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
