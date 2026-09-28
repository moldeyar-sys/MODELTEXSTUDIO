import { useMemo, useState } from 'react';
import { Check, Copy, Download, Search } from 'lucide-react';
import type { NewsletterSubscriber, Profile } from '../../lib/types';

/**
 * Todos los emails del sitio en una sola lista: las cuentas creadas
 * (profiles, pestaña Clientes) y los que solo dejaron el email en "Avisame"
 * de /moldes-gratis (newsletter_subscribers, pestaña Novedades). Son dos
 * tablas distintas porque son dos formas distintas de anotarse; acá se unen
 * por email, sin duplicados.
 */
interface Contacto {
  email: string;
  nombre: string;
  whatsapp: string;
  pais: string;
  cuenta: boolean;
  novedades: boolean;
  admin: boolean;
  prueba: boolean;
  desde: string | null;
}

type Filtro = 'todos' | 'cuenta' | 'solo-email';

// Cuentas creadas durante pruebas del sitio, no son clientes reales.
const ES_PRUEBA = /^audit_sec_|^test-verificacion|@modeltex\.com\.ar$/i;

function masAntigua(a: string | null, b: string | null) {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
}

function fecha(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
}

export function AllContactsPanel({ customers, subscribers }: { customers: Profile[]; subscribers: NewsletterSubscriber[] }) {
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [copiado, setCopiado] = useState(false);

  const contactos = useMemo(() => {
    const porEmail = new Map<string, Contacto>();
    for (const c of customers) {
      const email = (c.email || '').trim().toLowerCase();
      if (!email) continue;
      porEmail.set(email, {
        email,
        nombre: c.full_name || '',
        whatsapp: c.whatsapp || '',
        pais: c.country || '',
        cuenta: true,
        novedades: false,
        admin: c.role === 'admin',
        prueba: c.role !== 'admin' && ES_PRUEBA.test(email),
        desde: c.created_at || null,
      });
    }
    for (const s of subscribers) {
      const email = (s.email || '').trim().toLowerCase();
      if (!email) continue;
      const existente = porEmail.get(email);
      if (existente) {
        existente.novedades = true;
        existente.desde = masAntigua(existente.desde, s.created_at || null);
      } else {
        porEmail.set(email, {
          email, nombre: '', whatsapp: '', pais: '',
          cuenta: false, novedades: true, admin: false,
          prueba: ES_PRUEBA.test(email),
          desde: s.created_at || null,
        });
      }
    }
    return [...porEmail.values()].sort((a, b) => (b.desde || '').localeCompare(a.desde || ''));
  }, [customers, subscribers]);

  const reales = contactos.filter(c => !c.prueba);
  const conCuenta = reales.filter(c => c.cuenta).length;
  const soloEmail = reales.filter(c => !c.cuenta).length;

  const q = busqueda.trim().toLowerCase();
  const visibles = reales.filter(c =>
    (filtro === 'todos' || (filtro === 'cuenta' ? c.cuenta : !c.cuenta)) &&
    (!q || c.email.includes(q) || c.nombre.toLowerCase().includes(q) || c.whatsapp.includes(q)),
  );
  const pruebas = contactos.filter(c => c.prueba);

  const copiar = async () => {
    await navigator.clipboard.writeText(visibles.map(c => c.email).join(', '));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const descargar = () => {
    const celda = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const filas = [
      ['Email', 'Nombre', 'WhatsApp', 'País', 'Tiene cuenta', 'Anotado en novedades', 'Desde'],
      ...visibles.map(c => [c.email, c.nombre, c.whatsapp, c.pais, c.cuenta ? 'Sí' : 'No', c.novedades ? 'Sí' : 'No', fecha(c.desde)]),
    ];
    // BOM para que Excel abra bien los acentos.
    const csv = '﻿' + filas.map(f => f.map(celda).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `contactos-modeltex-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const Estado = ({ c }: { c: Contacto }) => (
    <div className="flex flex-wrap gap-1.5">
      {c.cuenta
        ? <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">Tiene cuenta</span>
        : <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700">Solo dejó el email</span>}
      {c.cuenta && c.novedades && <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-50 text-primary-700">+ Novedades</span>}
      {c.admin && <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-100 text-primary-700">admin</span>}
    </div>
  );

  const botonFiltro = (id: Filtro, label: string) => (
    <button
      onClick={() => setFiltro(id)}
      className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${filtro === id ? 'bg-primary-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900 text-lg">Todos los contactos ({reales.length})</h2>
        <p className="text-sm text-gray-500">
          Todas las personas que dejaron su email en el sitio, en una sola lista: <b>{conCuenta}</b> crearon cuenta y <b>{soloEmail}</b> solo dejaron el email en "Avisame" de Moldes Gratis.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {botonFiltro('todos', `Todos (${reales.length})`)}
          {botonFiltro('cuenta', `Con cuenta (${conCuenta})`)}
          {botonFiltro('solo-email', `Solo email (${soloEmail})`)}
        </div>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar email, nombre o WhatsApp" className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={copiar} disabled={!visibles.length} className="inline-flex items-center gap-2 text-sm font-medium px-3.5 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 disabled:opacity-50">
            {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiado ? 'Copiado' : `Copiar ${visibles.length} emails`}
          </button>
          <button onClick={descargar} disabled={!visibles.length} className="inline-flex items-center gap-2 text-sm font-medium px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Mobile: tarjetas */}
      <div className="sm:hidden space-y-2">
        {visibles.map(c => (
          <div key={c.email} className="card p-3">
            <p className="text-sm font-medium text-gray-900 truncate">{c.email}</p>
            {c.nombre && <p className="text-xs text-gray-500 truncate">{c.nombre}</p>}
            <div className="mt-2"><Estado c={c} /></div>
            <p className="text-xs text-gray-400 mt-1.5">
              Desde {fecha(c.desde)}{c.whatsapp ? ` · ${c.whatsapp}` : ''}{c.pais ? ` · ${c.pais}` : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop / tablet: tabla */}
      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Desde</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">WhatsApp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">País</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibles.map(c => (
                <tr key={c.email} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{c.email}</p>
                    {c.nombre && <p className="text-xs text-gray-400">{c.nombre}</p>}
                  </td>
                  <td className="px-4 py-3"><Estado c={c} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{fecha(c.desde)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{c.whatsapp || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{c.pais || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!visibles.length && <p className="text-gray-500 text-center py-8 text-sm">No hay contactos que coincidan.</p>}

      {pruebas.length > 0 && (
        <p className="text-xs text-gray-400">
          No se cuentan {pruebas.length} emails de prueba del sitio ({pruebas.map(p => p.email).join(', ')}).
        </p>
      )}
    </div>
  );
}
