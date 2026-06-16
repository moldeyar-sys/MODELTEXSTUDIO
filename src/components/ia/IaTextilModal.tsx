import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, Loader2, Sparkles, ShoppingBag, PenTool, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../lib/whatsapp';
import type { IaTextilCard } from '../../lib/iaTextil';

type Msg = { role: 'user' | 'assistant'; content: string };

const WHATSAPP_TEXT = encodeURIComponent('Hola Modeltex, quiero asesoría textil para producir.');

// Convierte URLs en enlaces clicables (seguro: solo http/https).
function renderWithLinks(text: string) {
  return text.split(/(https?:\/\/[^\s)]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-700 underline break-all">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface Props {
  card: IaTextilCard;
  onClose: () => void;
}

export function IaTextilModal({ card, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = card.icon;

  // Cerrar con Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    // Se envia la pregunta con un encabezado de contexto para orientar a la IA.
    const framed = `[Asesoría: ${card.title}] ${content}`;
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const payload = [...messages, { role: 'user' as const, content: framed }];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        data?.reply ||
        `Por ahora no puedo responder. Escribinos por WhatsApp: https://wa.me/${WHATSAPP_NUMBER}`;
      setMessages([...next, { role: 'assistant', content: reply }]);
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
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={card.title}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 bg-primary-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{card.title}</h3>
              <p className="text-[12px] text-white/75 leading-tight mt-0.5">{card.intro}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 hover:bg-white/15 rounded-lg flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-petroleum-50">
          {/* Preguntas sugeridas */}
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" /> Preguntas para empezar
          </p>
          <div className="flex flex-col gap-2">
            {card.questions.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                className="text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 hover:border-primary-300 hover:bg-primary-50/40 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Conversación */}
          {messages.length > 0 && (
            <div className="space-y-3 pt-2">
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 p-2.5 border-t border-gray-100"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
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

        {/* CTAs */}
        <div className="grid grid-cols-3 gap-2 px-3 pb-3 pt-1">
          <Link
            to="/catalogo"
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-[11px] font-medium text-primary-800 bg-primary-50 rounded-xl py-2 hover:bg-primary-100 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Catálogo
          </Link>
          <Link
            to="/diseno-a-pedido"
            onClick={onClose}
            className="flex flex-col items-center gap-1 text-[11px] font-medium text-accent-700 bg-accent-50 rounded-xl py-2 hover:bg-accent-100 transition-colors"
          >
            <PenTool className="w-4 h-4" /> Diseño a pedido
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 rounded-xl py-2 hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
