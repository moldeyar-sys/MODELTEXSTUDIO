import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Mail, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchActiveFreeMolds } from '../../lib/freeMolds';
import { freeMoldName } from '../../lib/freeMoldFormats';
import type { FreeMold } from '../../lib/types';

/**
 * Envío MANUAL del mail de moldes gratis (api/utils.ts, action=send-free-molds).
 * Nada sale solo: el admin elige los moldes, el público, se manda una prueba
 * y recién con "Enviar" sale a la lista. Cada envío queda en newsletter_sends.
 */
type Audience = 'subscribers' | 'users' | 'customers' | 'all';

const AUDIENCE_LABELS: Record<Audience, { title: string; hint: string }> = {
  subscribers: { title: 'Solo los que pidieron avisos', hint: 'Lista de novedades: botón "Avisame" o casilla al registrarse. Es el público seguro.' },
  users: { title: 'Usuarios registrados', hint: 'Todas las cuentas del sitio, hayan pedido avisos o no.' },
  customers: { title: 'Clientes que compraron', hint: 'Pedidos pagados, con cuenta o como invitado.' },
  all: { title: 'Todos', hint: 'Las tres listas juntas, sin repetir emails.' },
};

interface Status {
  counts: Record<Audience, number>;
  lastSends: Array<{ id: string; created_at: string; audience: string; mold_titles: string[]; recipients: number; sent: number; error: string | null; test: boolean }>;
  resendConfigured: boolean;
  from: string;
}

async function callApi(method: 'GET' | 'POST', body?: unknown) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesión vencida: volvé a iniciar sesión.');
  const res = await fetch('/api/utils?action=send-free-molds', {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
  return json;
}

export function NewsletterSendPanel() {
  const [molds, setMolds] = useState<FreeMold[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [audience, setAudience] = useState<Audience>('subscribers');
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<'test' | 'send' | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, st] = await Promise.all([fetchActiveFreeMolds(), callApi('GET') as Promise<Status>]);
      setMolds(list);
      setStatus(st);
      // Preselecciona los moldes publicados después del último envío real.
      const lastReal = st.lastSends.find((s) => !s.test && !s.error);
      if (lastReal) {
        const since = new Date(lastReal.created_at).getTime();
        setSelected(new Set(list.filter((m) => new Date(m.created_at).getTime() > since).map((m) => m.id)));
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'No se pudo cargar el estado.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const recipients = status?.counts[audience] ?? 0;
  const selectedTitles = molds.filter((m) => selected.has(m.id)).map((m) => freeMoldName(m.title));

  const run = async (test: boolean) => {
    setMsg(null);
    if (!selected.size) { setMsg({ ok: false, text: 'Elegí al menos un molde.' }); return; }
    if (!test) {
      const ok = confirm(
        `¿Mandar el mail con ${selected.size} molde(s) (${selectedTitles.join(', ')}) a ${recipients} destinatario(s)?\n\nPúblico: ${AUDIENCE_LABELS[audience].title}.\n\nEsto no se puede deshacer.`,
      );
      if (!ok) return;
    }
    setBusy(test ? 'test' : 'send');
    try {
      const r = await callApi('POST', { moldIds: [...selected], audience, test });
      setMsg({
        ok: true,
        text: test
          ? `Prueba enviada a ${r.to}. Revisá tu casilla (y spam) antes de mandar a la lista.`
          : `Listo: salieron ${r.sent} de ${r.recipients} mails.`,
      });
      if (!test) await load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Error al enviar.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-primary-700" />
        <h2 className="font-semibold text-gray-900 text-lg">Enviar aviso de moldes gratis</h2>
      </div>
      <p className="text-sm text-gray-500">
        Nada se manda solo. Elegí los moldes, el público, mandate una prueba y recién después apretá "Enviar".
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</div>
      ) : (
        <>
          {status && !status.resendConfigured && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              Falta RESEND_API_KEY en Vercel: no se puede mandar nada todavía.
            </p>
          )}

          <div>
            <p className="text-sm font-medium text-gray-800 mb-2">1. Moldes que van en el mail <span className="text-gray-400 font-normal">({selected.size} elegidos, máximo 12)</span></p>
            {molds.length === 0 ? (
              <p className="text-sm text-gray-500">No hay moldes gratis activos.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {molds.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selected.has(m.id)}
                      disabled={!selected.has(m.id) && selected.size >= 12}
                      onChange={() => toggle(m.id)}
                      className="w-4 h-4"
                    />
                    {m.image_url && <img src={m.image_url} alt="" className="w-9 h-9 rounded object-cover bg-gray-100" />}
                    <span className="text-sm text-gray-800 truncate">{freeMoldName(m.title)}</span>
                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                      {new Date(m.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800 mb-2">2. A quién</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
                <label key={a} className={`flex items-start gap-2 border rounded-xl px-3 py-2 cursor-pointer ${audience === a ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="audience" checked={audience === a} onChange={() => setAudience(a)} className="mt-1" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900">
                      {AUDIENCE_LABELS[a].title} <span className="text-gray-400 font-normal">({status?.counts[a] ?? 0})</span>
                    </span>
                    <span className="block text-xs text-gray-500">{AUDIENCE_LABELS[a].hint}</span>
                  </span>
                </label>
              ))}
            </div>
            {audience !== 'subscribers' && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                Estas personas no pidieron recibir avisos. Cada mail trae el link de baja, y quien se dé de baja no recibe más nada, elijas el público que elijas.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <button
              type="button"
              onClick={() => run(true)}
              disabled={!!busy || !selected.size}
              className="btn-secondary inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {busy === 'test' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              3. Enviarme una prueba
            </button>
            <button
              type="button"
              onClick={() => run(false)}
              disabled={!!busy || !selected.size || !recipients}
              className="btn-primary inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {busy === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              4. Enviar a {recipients} destinatario{recipients === 1 ? '' : 's'}
            </button>
          </div>

          {msg && (
            <p className={`text-sm flex items-start gap-2 ${msg.ok ? 'text-green-700' : 'text-red-700'}`}>
              {msg.ok ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              {msg.text}
            </p>
          )}

          {status && status.lastSends.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Últimos envíos</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {status.lastSends.map((s) => (
                  <li key={s.id} className="flex flex-wrap gap-x-2">
                    <span className="text-gray-400">{new Date(s.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{s.test ? 'Prueba' : AUDIENCE_LABELS[s.audience as Audience]?.title || s.audience}</span>
                    <span>· {s.sent}/{s.recipients} enviados</span>
                    <span className="text-gray-400 truncate">· {(s.mold_titles || []).join(', ')}</span>
                    {s.error && <span className="text-red-600">· {s.error}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {status && <p className="text-[11px] text-gray-400">Remitente: {status.from}</p>}
        </>
      )}
    </div>
  );
}
