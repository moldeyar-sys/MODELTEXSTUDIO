import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, UserPlus, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WHATSAPP_NUMBER } from '../../lib/whatsapp';

type Msg = { role: 'user' | 'assistant'; content: string; sources?: { title: string; url: string }[] };

export interface LabChatContext {
  courseSlug: string;
  moduleSlug?: string;
  lessonSlug?: string;
}

interface Props {
  /** Si viene, el tutor prioriza esta clase/curso. Si no, responde de forma general. */
  lab?: LabChatContext;
  /** Texto corto que muestra desde dónde está preguntando el alumno. */
  contextLabel?: string;
  greeting?: string;
  suggestions?: string[];
  className?: string;
}

function getSessionId(): string {
  const KEY = 'modeltex_chat_session';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

function renderWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s)]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-700 underline break-all">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

const DEFAULT_GREETING =
  '¡Hola! 👋 Soy el tutor de MODELTEX LAB. Preguntame lo que necesites sobre moldería o producción textil.';

export function LabChatPanel({ lab, contextLabel, greeting, suggestions, className }: Props) {
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: greeting || DEFAULT_GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading || limitReached) return;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          sessionId: getSessionId(),
          lab,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        data?.reply || `No pude responder ahora. Escribinos por WhatsApp: https://wa.me/${WHATSAPP_NUMBER}`;
      setMessages([...next, { role: 'assistant', content: reply, sources: data?.sources }]);
      if (data?.limitReached) setLimitReached(true);
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: `No tengo conexión ahora. Escribinos por WhatsApp: https://wa.me/${WHATSAPP_NUMBER}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden ${className || ''}`}>
      {contextLabel && (
        <div className="px-4 py-2 bg-primary-50 border-b border-primary-100 text-xs font-medium text-primary-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> {contextLabel}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-petroleum-50 min-h-[320px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary-800 text-white rounded-br-sm'
                  : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
              }`}
            >
              {renderWithLinks(m.content)}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <p className="font-medium mb-1">Basado en:</p>
                  <ul className="space-y-0.5">
                    {m.sources.map((s, si) => (
                      <li key={si}>
                        <Link to={s.url} className="text-primary-700 hover:underline">
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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

        {messages.length === 1 && !loading && suggestions && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
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

      {limitReached ? (
        <div className="p-3 border-t border-gray-100 bg-white">
          <Link
            to="/registro"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Crear cuenta gratis para seguir preguntando
          </Link>
        </div>
      ) : (
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
            placeholder="Escribí tu pregunta..."
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
      )}
    </div>
  );
}
