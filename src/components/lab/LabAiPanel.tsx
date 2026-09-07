import { useEffect } from 'react';
import { X, Bot } from 'lucide-react';
import { LabChatPanel, type LabChatContext } from './LabChatPanel';

interface Props {
  lab: LabChatContext;
  lessonTitle: string;
  onClose: () => void;
}

/** Panel modal para preguntarle a la IA sin abandonar la clase actual. */
export function LabAiPanel({ lab, lessonTitle, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Preguntar a la IA de MODELTEX LAB"
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 bg-primary-800 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">Tutor de MODELTEX LAB</h3>
              <p className="text-[12px] text-white/75 leading-tight mt-0.5">Sobre: {lessonTitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 hover:bg-white/15 rounded-lg flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <LabChatPanel
          lab={lab}
          contextLabel={`Preguntando sobre: ${lessonTitle}`}
          greeting={`¡Hola! Estoy para ayudarte con "${lessonTitle}". ¿Qué parte querés que te explique de otra manera?`}
          suggestions={['¿Podés explicarlo de otra forma?', '¿Por qué es así?', 'No entendí este paso']}
          className="flex-1 rounded-none border-0"
        />
      </div>
    </div>
  );
}
