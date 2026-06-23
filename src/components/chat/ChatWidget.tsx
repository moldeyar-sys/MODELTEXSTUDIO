import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

const GREETING =
  '¡Hola! 👋 Soy el asistente de Modeltex. Puedo ayudarte con moldes, talles, formatos, telas, precios y formas de pago. ¿Qué estás buscando?';

const SUGGESTIONS = [
  '¿Qué moldes tenés disponibles?',
  '¿Qué formatos y talles incluyen?',
  '¿Cómo pago y descargo?',
  'Quiero un molde a medida',
];

// Convierte URLs del texto en enlaces clicables (seguro: solo http/https).
function renderWithLinks(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-700 underline break-all"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        data?.reply ||
        'Uy, no pude responder ahora. Escribinos por WhatsApp: https://wa.me/5491166531086';
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            'No tengo conexión en este momento. Escribinos por WhatsApp: https://wa.me/5491166531086',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Boton flotante (arriba del de WhatsApp) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-[10rem] right-6 z-50 w-14 h-14 bg-primary-800 hover:bg-primary-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center active:scale-95"
          aria-label="Abrir asistente virtual"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Panel del chat */}
      {open && (
        <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-24 z-50 sm:w-[380px] max-w-[calc(100vw-1.5rem)]">
          <div className="flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden h-[70vh] sm:h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary-800 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">Asistente Modeltex</p>
                  <p className="text-[11px] text-white/70 leading-tight">Respuestas al instante</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="p-1 hover:bg-white/15 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-petroleum-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary-800 text-white rounded-br-sm'
                        : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {renderWithLinks(m.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {/* Sugerencias (solo al inicio) */}
              {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs text-primary-700 bg-white border border-primary-200 rounded-full px-3 py-1.5 hover:bg-primary-50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 p-2.5 border-t border-gray-100 bg-white"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu consulta..."
                className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-primary-800 hover:bg-primary-900 text-white rounded-xl disabled:opacity-40 transition-colors flex-shrink-0"
                aria-label="Enviar"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
