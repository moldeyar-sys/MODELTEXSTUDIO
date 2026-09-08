import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  /** Si falta, se renderiza como texto (es la página actual). */
  to?: string;
}

/**
 * Migas de pan visuales, discretas. Representan la MISMA jerarquía que el
 * BreadcrumbList JSON-LD de la página (ver src/lib/schemaIds.ts) — si acá se
 * agrega o saca un nivel, el schema de esa página tiene que quedar igual.
 */
export function Breadcrumbs({
  items,
  className = '',
  variant = 'light',
}: {
  items: BreadcrumbItem[];
  className?: string;
  /** 'light' para fondos claros (por defecto), 'dark' para heroes con fondo oscuro. */
  variant?: 'light' | 'dark';
}) {
  if (items.length < 2) return null;
  const isDark = variant === 'dark';
  const base = isDark ? 'text-white/70' : 'text-gray-500';
  const chevron = isDark ? 'text-white/30' : 'text-gray-300';
  const linkHover = isDark ? 'hover:text-white' : 'hover:text-primary-700';
  const current = isDark ? 'text-white font-medium' : 'text-gray-700 font-medium';
  return (
    <nav aria-label="Miga de pan" className={`text-xs sm:text-sm ${base} ${className}`}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${chevron}`} aria-hidden="true" />}
            <li className="flex items-center">
              {item.to ? (
                <Link to={item.to} className={`transition-colors ${linkHover}`}>
                  {item.label}
                </Link>
              ) : (
                <span className={`truncate max-w-[220px] ${current}`} aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
