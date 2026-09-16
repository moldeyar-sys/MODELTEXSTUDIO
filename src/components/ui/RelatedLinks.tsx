// Bloque de enlaces internos editoriales al pie de una pagina publica.
//
// El contenido NO vive aca: sale de src/lib/internalLinks.ts, el mismo modulo
// que usa middleware.ts para armar el HTML inicial. Asi la version con y sin
// JavaScript enlazan exactamente a lo mismo.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIA_LINKS, relatedFor } from '../../lib/internalLinks';

export function RelatedLinks({ path }: { path: string }) {
  const block = relatedFor(path);
  if (!block) return null;

  return (
    <section className="card p-6 sm:p-8 mt-6">
      <h2 className="font-display text-2xl font-bold text-primary-900">{block.title}</h2>

      <div className="grid sm:grid-cols-2 gap-3 mt-5">
        {block.links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-primary-200 hover:bg-primary-50/40 transition-colors"
          >
            <span className="flex items-center gap-2 font-semibold text-primary-800 group-hover:text-primary-900">
              {l.label} <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="block text-sm text-gray-500 mt-1.5">{l.hint}</span>
          </Link>
        ))}
      </div>

      {block.categorias && (
        <>
          <h3 className="font-semibold text-primary-900 mt-8">Moldes por categoría</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {CATEGORIA_LINKS.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 hover:border-primary-200 hover:text-primary-800 transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {block.guias && block.guias.length > 0 && (
        <>
          <h3 className="font-semibold text-primary-900 mt-8">Guías relacionadas</h3>
          <ul className="mt-3 space-y-2">
            {block.guias.map((g) => (
              <li key={g.slug}>
                <Link to={`/guias/${g.slug}`} className="text-primary-700 hover:text-primary-900 hover:underline text-sm sm:text-base">
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
