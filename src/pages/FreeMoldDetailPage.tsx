import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Check, Download, FileDown, Gift, Layers, Loader2, Lock, MessageCircle, Ruler, Scissors, Send, Shirt, UserPlus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSeo, useStructuredData } from '../lib/seo';
import { SCHEMA_IDS } from '../lib/schemaIds';
import { CATEGORIES } from '../lib/types';
import type { FreeMold } from '../lib/types';
import { buildFreeMoldWhatsApp, fetchActiveFreeMolds, incrementFreeMoldDownload } from '../lib/freeMolds';
import { assignFreeMoldSlugs, compareSizes, freeMoldName, freeMoldPath, groupFiles, type FreeFileSection, type NormalizedFreeFile } from '../lib/freeMoldFormats';
import { downloadFile, downloadZip, formatBytes } from '../lib/freeDownloads';
import { subscribeToNewsletter } from '../lib/newsletter';
import { trackFreeDownload } from '../lib/analytics';
import { ReviewsSection } from '../components/ui/ReviewsSection';

const SITE = 'https://modeltex.com.ar';

interface Loaded {
  mold: FreeMold;
  slug: string;
  others: { mold: FreeMold; slug: string }[];
}

export default function FreeMoldDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<Loaded | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'notfound'>('loading');
  const [zipBusy, setZipBusy] = useState<string | null>(null);
  const [zipProgress, setZipProgress] = useState('');
  const [zipError, setZipError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchActiveFreeMolds().then((molds) => {
      if (cancelled) return;
      const slugs = assignFreeMoldSlugs(molds);
      const mold = molds.find((m) => slugs.get(m.id) === slug || m.id === slug);
      if (!mold) {
        setStatus('notfound');
        return;
      }
      const others = molds.filter((m) => m.id !== mold.id).slice(0, 4).map((m) => ({ mold: m, slug: slugs.get(m.id) as string }));
      const canonical = slugs.get(mold.id) as string;
      setData({ mold, slug: canonical, others });
      setStatus('ok');
      // Links por id (tarjetas del Lab): la dirección que queda es la del slug.
      if (slug !== canonical) navigate(freeMoldPath(canonical), { replace: true });
    });
    return () => { cancelled = true; };
  }, [slug, navigate]);

  const mold = data?.mold;
  const name = mold ? freeMoldName(mold.title) : '';
  const sections = useMemo(() => groupFiles(mold?.files || []), [mold]);
  const allFiles = sections.flatMap((s) => s.files);
  const canDownload = (f: NormalizedFreeFile) => !!user || !!f.free;
  const lockedCount = allFiles.filter((f) => !canDownload(f)).length;
  const categoryLabel = CATEGORIES.find((c) => c.value === mold?.category)?.label || '';
  const pagePath = data ? freeMoldPath(data.slug) : `/moldes-gratis/${slug}`;

  const description = mold
    ? (mold.description?.trim() ||
      `Molde gratis de ${name}${mold.product_type ? ` (${mold.product_type.toLowerCase()})` : ''} para descargar en ${sections.map((s) => s.format.short).join(', ') || 'PDF'}. Probá la calidad de la moldería Modeltex.`).slice(0, 300)
    : '';

  useSeo({
    title: mold ? `${name} — molde gratis para descargar` : 'Molde gratis',
    description,
    image: mold?.image_url || undefined,
    path: pagePath,
    noindex: status === 'notfound',
  });

  const breadcrumbSchema = useMemo(
    () =>
      mold
        ? {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
              { '@type': 'ListItem', position: 2, name: 'Moldes gratis', item: `${SITE}/moldes-gratis` },
              { '@type': 'ListItem', position: 3, name, item: `${SITE}${pagePath}` },
            ],
          }
        : null,
    [mold, name, pagePath],
  );
  const productSchema = useMemo(
    () =>
      mold
        ? {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${name} — molde gratis`,
            description,
            image: mold.image_url || undefined,
            sku: mold.code || data?.slug,
            brand: { '@type': 'Brand', name: 'Modeltex' },
            url: `${SITE}${pagePath}`,
            offers: { '@type': 'Offer', price: 0, priceCurrency: 'ARS', availability: 'https://schema.org/InStock', url: `${SITE}${pagePath}` },
          }
        : null,
    [mold, name, description, pagePath, data?.slug],
  );
  useStructuredData(breadcrumbSchema, SCHEMA_IDS.breadcrumb);
  useStructuredData(productSchema, SCHEMA_IDS.product);

  const track = (label: string) => {
    if (!mold) return;
    incrementFreeMoldDownload(mold.id, label, !!user, user?.id ?? null);
    trackFreeDownload({ id: mold.id, name: mold.title });
  };

  const handleFile = (f: NormalizedFreeFile) => {
    track(f.display);
    downloadFile(f.url, f.name);
  };

  const handleZip = async (key: string, zipLabel: string, files: NormalizedFreeFile[], bySection: FreeFileSection[] | null) => {
    if (!mold || !data) return;
    setZipBusy(key);
    setZipError('');
    setZipProgress(`0 de ${files.length}`);
    try {
      const entries = files.map((f) => {
        const folder = bySection ? `${bySection.find((s) => s.files.includes(f))?.format.folder}/` : '';
        return { path: `${folder}${f.name}`, url: f.url };
      });
      await downloadZip(`${data.slug}${zipLabel ? `-${zipLabel}` : ''}.zip`, entries, (d, t) => setZipProgress(`${d} de ${t}`));
      track(zipLabel ? `ZIP ${zipLabel}` : 'ZIP completo');
    } catch {
      setZipError('No se pudo armar el ZIP. Probá de nuevo o bajá los archivos de a uno.');
    }
    setZipBusy(null);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petroleum-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    );
  }

  if (status === 'notfound' || !mold || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-petroleum-50 px-4">
        <div className="text-center bg-white border border-gray-100 rounded-2xl px-8 py-10 shadow-sm">
          <p className="text-gray-500 text-lg mb-4">Este molde gratis no está disponible.</p>
          <Link to="/moldes-gratis" className="btn-primary">Ver todos los moldes gratis</Link>
        </div>
      </div>
    );
  }

  const registerLink = (
    <Link
      to="/registro"
      state={{ next: location.pathname }}
      className="inline-flex items-center justify-center gap-2 w-full py-3 bg-petroleum-600 text-white text-sm font-semibold rounded-xl hover:bg-petroleum-700 transition-colors"
    >
      <UserPlus className="w-4 h-4" /> Crear cuenta gratis para descargar todo
    </Link>
  );

  const summary = [
    {
      icon: Ruler,
      label: 'Talles',
      value: mold.sizes?.length
        ? mold.sizes.join(', ')
        : [...new Set(allFiles.map((f) => f.size).filter(Boolean))].sort(compareSizes).join(', ') || '—',
    },
    { icon: Layers, label: 'Formatos', value: sections.length ? sections.map((s) => s.format.short).join(', ') : 'Próximamente' },
    { icon: Shirt, label: 'Tela recomendada', value: mold.fabric_recommendation || '' },
    { icon: Scissors, label: 'Código', value: mold.code || '' },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen bg-petroleum-50">
      <div className="container-custom py-5 md:py-8">
        <Link to="/moldes-gratis" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Moldes gratis
        </Link>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)] gap-8 lg:gap-12 items-start">
          {/* Imagen: la prenda entera, sin recortar */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-white relative">
              {mold.image_url ? (
                <img src={mold.image_url} alt={`${name} — molde gratis`} fetchPriority="high" decoding="async" className="w-full h-full object-contain p-3 sm:p-5" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><FileDown className="w-16 h-16" /></div>
              )}
              <span className="absolute top-4 left-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-sm">GRATIS</span>
            </div>
          </div>

          {/* Info + descarga completa */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {categoryLabel && <span className="text-sm font-medium text-petroleum-700 bg-petroleum-100 px-3 py-1 rounded-lg">{categoryLabel}</span>}
                {mold.product_type && <span className="text-sm font-medium text-gray-600 bg-white border border-gray-100 px-3 py-1 rounded-lg">{mold.product_type}</span>}
                <span className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-lg">Descarga gratis</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-primary-900 mb-3 leading-tight">{name}</h1>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {summary.map((item) => (
                <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className="text-sm font-bold text-primary-900 leading-snug break-words">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              {allFiles.length > 0 ? (
                <>
                  <h2 className="font-display text-xl font-bold text-primary-900">Descargá el molde</h2>
                  <p className="text-sm text-gray-500">
                    {allFiles.length} archivos en {sections.length} {sections.length === 1 ? 'formato' : 'formatos'}. Bajá solo lo que necesitás desde cada sección, o todo junto en un ZIP ordenado por carpetas.
                  </p>
                  {lockedCount === 0 ? (
                    <button
                      onClick={() => handleZip('all', '', allFiles, sections)}
                      disabled={!!zipBusy}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {zipBusy === 'all' ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparando ZIP ({zipProgress})</> : <><Download className="w-4 h-4" /> Descargar todo ({allFiles.length} archivos, ZIP)</>}
                    </button>
                  ) : (
                    <>
                      {registerLink}
                      <p className="text-xs text-gray-500 text-center">
                        Sin cuenta podés bajar {allFiles.length - lockedCount} de {allFiles.length} archivos (los marcados en azul).
                      </p>
                    </>
                  )}
                  {zipError && <p className="text-sm text-red-600">{zipError}</p>}
                </>
              ) : (
                <ComingSoon />
              )}
              <a
                href={buildFreeMoldWhatsApp(mold)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-green-700 border border-green-200 rounded-xl hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Secciones por formato */}
        {sections.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-1">Elegí qué descargar</h2>
            <p className="text-sm text-gray-500 mb-5">Cada formato por separado. Los archivos con candado se habilitan al crear tu cuenta gratis.</p>
            <div className="space-y-5">
              {sections.map((s) => {
                const locked = s.files.some((f) => !canDownload(f));
                return (
                  <div key={s.format.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg">{s.format.label}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{s.format.description}</p>
                      </div>
                      {s.files.length > 1 && (
                        locked ? (
                          <Link to="/registro" state={{ next: location.pathname }} className="inline-flex items-center justify-center gap-2 text-sm font-medium px-3.5 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex-shrink-0">
                            <Lock className="w-4 h-4" /> Crear cuenta para bajar los {s.files.length}
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleZip(s.format.id, s.format.id, s.files, null)}
                            disabled={!!zipBusy}
                            className="inline-flex items-center justify-center gap-2 text-sm font-medium px-3.5 py-2 bg-primary-50 text-primary-800 rounded-lg hover:bg-primary-100 disabled:opacity-60 flex-shrink-0"
                          >
                            {zipBusy === s.format.id ? <><Loader2 className="w-4 h-4 animate-spin" /> {zipProgress}</> : <><Download className="w-4 h-4" /> Bajar los {s.files.length} (ZIP)</>}
                          </button>
                        )
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                      {s.files.map((f) =>
                        canDownload(f) ? (
                          <button
                            key={f.url}
                            onClick={() => handleFile(f)}
                            title={f.name}
                            className="flex items-center justify-between gap-2 px-3 py-2.5 bg-primary-800 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors text-left"
                          >
                            <span className="min-w-0">
                              <span className="block truncate">{f.display}</span>
                              <span className="block text-[11px] font-normal text-primary-100">{[f.ext.toUpperCase(), formatBytes(f.bytes)].filter(Boolean).join(' · ')}</span>
                            </span>
                            <Download className="w-4 h-4 flex-shrink-0" />
                          </button>
                        ) : (
                          <Link
                            key={f.url}
                            to="/registro"
                            state={{ next: location.pathname }}
                            title="Creá tu cuenta gratis para descargar este archivo"
                            className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <span className="min-w-0">
                              <span className="block truncate">{f.display}</span>
                              <span className="block text-[11px] text-gray-400">Con cuenta gratis</span>
                            </span>
                            <Lock className="w-4 h-4 flex-shrink-0" />
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-10 grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold text-primary-900 mb-3">¿Te gustó la calidad?</h2>
            <ul className="space-y-2 text-sm text-gray-600 mb-5">
              {['Más de 2.000 moldes con curva de talles completa', 'PDF A4, plotter y formatos CAD (DXF, PDS, MRK, ADS)', 'Moldes aprobados con muestra confeccionada'].map((t) => (
                <li key={t} className="flex items-start gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />{t}</li>
              ))}
            </ul>
            <Link to="/catalogo" className="btn-primary inline-flex">Ver el catálogo completo</Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <ReviewsSection targetType="free_mold" targetId={mold.id} compact />
          </div>
        </section>

        {data.others.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-4">Más moldes gratis</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {data.others.map(({ mold: m, slug: s }) => (
                <Link key={m.id} to={freeMoldPath(s)} className="card overflow-hidden group">
                  <div className="aspect-square bg-white">
                    {m.image_url && <img src={m.image_url} alt={freeMoldName(m.title)} loading="lazy" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm truncate">{freeMoldName(m.title)}</p>
                    <p className="text-xs text-green-700 font-medium mt-0.5">Descarga gratis</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/** Molde publicado sin archivos todavía: ofrece el aviso por mail. */
function ComingSoon() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('busy');
    const r = await subscribeToNewsletter(email, 'molde-gratis');
    if (r.ok) setState('ok');
    else { setState('error'); setMsg(r.error || 'No se pudo guardar tu email.'); }
  };
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-primary-900 flex items-center gap-2"><Gift className="w-5 h-5 text-green-600" /> Archivos en preparación</h2>
      <p className="text-sm text-gray-500 mt-1 mb-3">Estamos terminando de cargar los archivos de este molde. Dejanos tu email y te avisamos apenas estén.</p>
      {state === 'ok' ? (
        <p className="text-sm text-green-700 font-medium flex items-center gap-1.5"><Check className="w-4 h-4" /> Listo, te avisamos por mail.</p>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="input-field flex-1 min-w-0" />
          <button type="submit" disabled={state === 'busy'} className="btn-primary inline-flex items-center gap-1.5 px-4 disabled:opacity-60">
            <Send className="w-4 h-4" /> Avisame
          </button>
        </form>
      )}
      {state === 'error' && <p className="text-sm text-red-600 mt-2">{msg}</p>}
    </div>
  );
}
