import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Mail, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * Estado del aviso automático de moldes gratis nuevos (api/utils.ts,
 * action=announce-free-molds). El envío real lo hace solo el cron diario de
 * Vercel; desde acá se ve qué va a salir y se puede mandar una prueba al
 * propio admin.
 */
interface Status {
  subscribers: number;
  pending: string[];
  nextSendUtc: string;
  resendConfigured: boolean;
  from: string;
}

async function callAnnounce(mode: 'status' | 'test') {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`/api/utils?action=announce-free-molds&mode=${mode}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, body };
}

function explain(error: string) {
  if (/verify a domain|own email address|domain is not verified|not verified/i.test(error)) {
    return 'Resend todavía no tiene verificado el dominio modeltex.com.ar, así que no deja mandar mails a tus clientes. Hay que verificarlo en resend.com → Domains.';
  }
  return error;
}

export function NewsletterAutoPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const { ok, body } = await callAnnounce('status');
      if (ok) setStatus(body as Status);
      else setLoadError(body.error || 'No se pudo consultar el estado de los avisos.');
    } catch {
      setLoadError('No se pudo consultar el estado de los avisos.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const sendTest = async () => {
    setBusy(true);
    setTestResult(null);
    try {
      const { ok, body } = await callAnnounce('test');
      setTestResult(ok
        ? { ok: true, text: `Listo: te mandamos el mail de prueba a ${body.to}. Revisá también la carpeta de spam.` }
        : { ok: false, text: explain(body.error || 'No se pudo mandar la prueba.') });
    } catch {
      setTestResult({ ok: false, text: 'No se pudo mandar la prueba.' });
    }
    setBusy(false);
  };

  const nextSend = status
    ? new Date(status.nextSendUtc).toLocaleString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    : '';

  return (
    <div className="card p-5 border-2 border-green-100">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Mail className="w-4 h-4 text-green-600" /> Avisos automáticos de moldes gratis</h3>
          <p className="text-sm text-gray-600 mt-1">
            Todos los días a las <b>18:00</b> (hora de Argentina) sale un mail a {status ? <b>los {status.subscribers} anotados</b> : 'los anotados'} en
            esta lista con los moldes gratis que publicaste ese día. Si publicás varios el mismo día, les llega un solo mail con todos.
            Si no publicaste nada, no se manda nada.
          </p>
          {status && (
            <p className="text-sm text-gray-600 mt-2">
              {status.pending.length
                ? <>Próximo envío (<span className="capitalize">{nextSend}</span>): <b>{status.pending.join(', ')}</b>.</>
                : 'Todavía no hay moldes nuevos para el próximo envío.'}
            </p>
          )}
          {status && !status.resendConfigured && (
            <p className="text-sm text-red-600 mt-2 flex items-start gap-1.5"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Falta la clave de Resend (RESEND_API_KEY) en Vercel: sin eso no sale ningún mail.</p>
          )}
          {loadError && <p className="text-sm text-red-600 mt-2">{loadError}</p>}
        </div>
        <button onClick={sendTest} disabled={busy} className="inline-flex items-center justify-center gap-2 text-sm font-medium px-3.5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 flex-shrink-0">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Enviarme un mail de prueba
        </button>
      </div>
      {testResult && (
        <p className={`text-sm mt-3 flex items-start gap-1.5 ${testResult.ok ? 'text-green-700' : 'text-red-600'}`}>
          {testResult.ok ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {testResult.text}
        </p>
      )}
    </div>
  );
}
