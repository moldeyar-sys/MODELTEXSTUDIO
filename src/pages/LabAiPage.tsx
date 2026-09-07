import { Link } from 'react-router-dom';
import { ArrowLeft, Bot } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { LabChatPanel } from '../components/lab/LabChatPanel';

const SUGGESTIONS = [
  '¿Qué es la moldería textil?',
  '¿Cuál es la diferencia entre moldería a medida e industrial?',
  '¿Qué necesito para empezar a fabricar mi primera prenda?',
  '¿Qué es una tizada?',
];

export default function LabAiPage() {
  useSeo({
    title: 'IA Modeltex Lab — Consultá tus dudas de moldería',
    description:
      'Preguntale a la IA de MODELTEX LAB cualquier duda sobre moldería textil, producción o el curso gratis de Modeltex.',
    path: '/lab/ia',
  });

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-gradient-to-br from-primary-900 to-petroleum-900 text-white">
        <div className="container-custom py-10 sm:py-14">
          <Link to="/lab" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" /> Modeltex Lab
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">IA Modeltex Lab</h1>
              <p className="text-white/80 mt-1 text-sm sm:text-base">
                Preguntá cualquier duda sobre moldería, producción textil o el curso gratis de Modeltex.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-8 sm:py-12 max-w-2xl mx-auto">
        <LabChatPanel suggestions={SUGGESTIONS} className="h-[70vh] min-h-[420px]" />
      </div>
    </div>
  );
}
