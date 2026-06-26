import { useState } from 'react';
import { X, Ruler } from 'lucide-react';

// ── Tablas de medidas MODELTEX (medidas anatómicas en cm) ─────────────────────

const DAMA = [
  { talle: 'XS',  uk: '4-6',   num: '36-38', busto: '88',     cintura: '68',     cadera: '92'     },
  { talle: 'S',   uk: '8',     num: '40',    busto: '92',     cintura: '72',     cadera: '96'     },
  { talle: 'M',   uk: '10',    num: '42-44', busto: '96',     cintura: '76',     cadera: '100'    },
  { talle: 'L',   uk: '12',    num: '46',    busto: '100-104',cintura: '80-84',  cadera: '104-108'},
  { talle: 'XL',  uk: '14',    num: '48-50', busto: '108-112',cintura: '88-92',  cadera: '112-116'},
  { talle: '2XL', uk: '16',    num: '52',    busto: '116',    cintura: '96',     cadera: '120'    },
  { talle: '3XL', uk: '18',    num: '54-56', busto: '120-124',cintura: '100-104',cadera: '124-128'},
  { talle: '4XL', uk: '20',    num: '58',    busto: '128',    cintura: '108',    cadera: '132'    },
];

const HOMBRE = [
  { talle: 'XS',  uk: '4-6',   num: '36-38', pecho: '90',     cintura: '72',     cadera: '92'     },
  { talle: 'S',   uk: '8',     num: '40',    pecho: '94',     cintura: '76',     cadera: '96'     },
  { talle: 'M',   uk: '10',    num: '42-44', pecho: '98',     cintura: '80',     cadera: '100'    },
  { talle: 'L',   uk: '12',    num: '46',    pecho: '102-106',cintura: '84-88',  cadera: '104-108'},
  { talle: 'XL',  uk: '14',    num: '48-50', pecho: '110-114',cintura: '92-96',  cadera: '112-116'},
  { talle: '2XL', uk: '16',    num: '52',    pecho: '118',    cintura: '100',    cadera: '120'    },
  { talle: '3XL', uk: '18',    num: '54-56', pecho: '122-126',cintura: '104-108',cadera: '124-128'},
  { talle: '4XL', uk: '20',    num: '58',    pecho: '130',    cintura: '112',    cadera: '132'    },
];

const NINOS = [
  { talle: '2',  busto: '58', cintura: '54', cadera: '60' },
  { talle: '4',  busto: '62', cintura: '58', cadera: '64' },
  { talle: '6',  busto: '66', cintura: '60', cadera: '68' },
  { talle: '8',  busto: '70', cintura: '62', cadera: '72' },
  { talle: '10', busto: '74', cintura: '64', cadera: '76' },
  { talle: '12', busto: '78', cintura: '66', cadera: '80' },
  { talle: '14', busto: '82', cintura: '68', cadera: '84' },
  { talle: '16', busto: '86', cintura: '70', cadera: '88' },
  { talle: '18', busto: '90', cintura: '72', cadera: '92' },
];

const BEBES = [
  { meses: '00 meses', talle: '0', busto: '40', cintura: '39', cadera: '43' },
  { meses: '0 meses',  talle: '1', busto: '43', cintura: '41', cadera: '46' },
  { meses: '3 meses',  talle: '2', busto: '45', cintura: '43', cadera: '48' },
  { meses: '6 meses',  talle: '3', busto: '47', cintura: '45', cadera: '50' },
  { meses: '9 meses',  talle: '4', busto: '48', cintura: '47', cadera: '52' },
  { meses: '12 meses', talle: '5', busto: '51', cintura: '48', cadera: '54' },
  { meses: '18 meses', talle: '6', busto: '53', cintura: '50', cadera: '56' },
  { meses: '24 meses', talle: '7', busto: '54', cintura: '52', cadera: '58' },
  { meses: '36 meses', talle: '8', busto: '56', cintura: '53', cadera: '59' },
];

type Tab = 'dama' | 'hombre' | 'ninos' | 'bebes';

const thCls = 'px-3 py-2 text-left text-[11px] font-semibold text-primary-800 uppercase tracking-wide bg-primary-50';
const tdCls = 'px-3 py-2 text-sm text-gray-700 text-center';
const trCls = 'border-b border-gray-100 hover:bg-gray-50/60 transition-colors';

export function SizeGuide() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('dama');

  return (
    <>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-900 underline underline-offset-2 transition-colors"
      >
        <Ruler className="w-3.5 h-3.5" /> Guía de talles
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary-700" /> Guía de talles Modeltex
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Medidas anatómicas del cuerpo en centímetros</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-5 gap-1 flex-shrink-0 overflow-x-auto">
              {([
                { id: 'dama',   label: '👗 Dama'   },
                { id: 'hombre', label: '👔 Hombre' },
                { id: 'ninos',  label: '👦 Niños'  },
                { id: 'bebes',  label: '👶 Bebés'  },
              ] as { id: Tab; label: string }[]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.id
                      ? 'border-primary-700 text-primary-800'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tabla */}
            <div className="overflow-y-auto flex-1 p-1">
              {tab === 'dama' && (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={thCls}>Talle</th>
                      <th className={thCls}>UK</th>
                      <th className={thCls}>N°</th>
                      <th className={thCls}>Busto (cm)</th>
                      <th className={thCls}>Cintura (cm)</th>
                      <th className={thCls}>Cadera (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAMA.map(r => (
                      <tr key={r.talle} className={trCls}>
                        <td className={`${tdCls} font-bold text-primary-800`}>{r.talle}</td>
                        <td className={tdCls}>{r.uk}</td>
                        <td className={tdCls}>{r.num}</td>
                        <td className={tdCls}>{r.busto}</td>
                        <td className={tdCls}>{r.cintura}</td>
                        <td className={tdCls}>{r.cadera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'hombre' && (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={thCls}>Talle</th>
                      <th className={thCls}>UK</th>
                      <th className={thCls}>N°</th>
                      <th className={thCls}>Pecho (cm)</th>
                      <th className={thCls}>Cintura (cm)</th>
                      <th className={thCls}>Cadera (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HOMBRE.map(r => (
                      <tr key={r.talle} className={trCls}>
                        <td className={`${tdCls} font-bold text-primary-800`}>{r.talle}</td>
                        <td className={tdCls}>{r.uk}</td>
                        <td className={tdCls}>{r.num}</td>
                        <td className={tdCls}>{r.pecho}</td>
                        <td className={tdCls}>{r.cintura}</td>
                        <td className={tdCls}>{r.cadera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'ninos' && (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={thCls}>Talle</th>
                      <th className={thCls}>Busto (cm)</th>
                      <th className={thCls}>Cintura (cm)</th>
                      <th className={thCls}>Cadera (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NINOS.map(r => (
                      <tr key={r.talle} className={trCls}>
                        <td className={`${tdCls} font-bold text-primary-800`}>{r.talle}</td>
                        <td className={tdCls}>{r.busto}</td>
                        <td className={tdCls}>{r.cintura}</td>
                        <td className={tdCls}>{r.cadera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {tab === 'bebes' && (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={thCls}>Edad</th>
                      <th className={thCls}>Talle</th>
                      <th className={thCls}>Busto (cm)</th>
                      <th className={thCls}>Cintura (cm)</th>
                      <th className={thCls}>Cadera (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BEBES.map(r => (
                      <tr key={r.talle} className={trCls}>
                        <td className={`${tdCls} text-gray-500`}>{r.meses}</td>
                        <td className={`${tdCls} font-bold text-primary-800`}>{r.talle}</td>
                        <td className={tdCls}>{r.busto}</td>
                        <td className={tdCls}>{r.cintura}</td>
                        <td className={tdCls}>{r.cadera}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <p className="text-[11px] text-gray-400 text-center">
                Todas las medidas son anatómicas (del cuerpo) en centímetros · Modeltex Moldería Textil
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
