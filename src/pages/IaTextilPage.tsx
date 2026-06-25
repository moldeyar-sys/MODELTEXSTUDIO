import { FloatingPatterns } from '../components/ui/FloatingPatterns';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShoppingBag, PenTool, MessageCircle } from 'lucide-react';
import { useSeo } from '../lib/seo';
import { WHATSAPP_NUMBER } from '../lib/whatsapp';
import { IA_TEXTIL_CARDS, type IaTextilCard } from '../lib/iaTextil';
import { IaTextilModal } from '../components/ia/IaTextilModal';

const WHATSAPP_TEXT = encodeURIComponent('Hola Modeltex, quiero asesoría textil con IA.');

export default function IaTextilPage() {
  const [activeCard, setActiveCard] = useState<IaTextilCard | null>(null);

  useSeo({
    title: 'IA Textil — Asesor inteligente para producir y vender',
    description:
      'Usá la IA de Modeltex para saber qué fabricar, qué molde elegir, qué hacer con tu tela y cómo armar una colección vendible. Asesoría textil al instante.',
    path: '/ia-textil',
  });

  return (
    <div className="relative min-h-screen bg-petroleum-50 overflow-hidden">
      <FloatingPatterns variant="dark" />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-800 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(203,110,231,0.35), transparent 45%)' }}
        />
        <div className="container-custom relative py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-accent-300" /> IA Textil
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-bold mt-5 max-w-3xl text-balance">
            IA Textil de Modeltex
          </h1>
          <p className="text-lg md:text-xl text-white/90 mt-5 max-w-2xl font-medium">
            No compres moldes al azar. Usá la IA de Modeltex para saber qué fabricar, qué molde elegir y cómo armar una colección vendible.
          </p>
          <p className="text-white/70 mt-4 max-w-2xl">
            Nuestro asesor IA te ayuda a elegir prendas, moldes, telas, tendencias y estrategias de producción según tu objetivo.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setActiveCard(IA_TEXTIL_CARDS[0])}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" /> Empezar asesoría
            </button>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
            >
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de cards */}
      <section className="relative overflow-hidden container-custom py-12 md:py-16">
        <FloatingPatterns variant="dark" />
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-900">
            ¿Con qué te ayudo hoy?
          </h2>
          <p className="text-gray-500 mt-2">
            Elegí una opción. Cada una abre un asistente con preguntas listas para empezar — sin vueltas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {IA_TEXTIL_CARDS.map(card => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => setActiveCard(card)}
                className="card group text-left p-6 flex flex-col h-full hover:-translate-y-0.5 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-700 to-petroleum-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-primary-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{card.text}</p>
                <span className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary-700 group-hover:text-primary-900 transition-colors">
                  {card.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden container-custom pb-16 md:pb-20">
        <FloatingPatterns variant="dark" />
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 to-petroleum-800 text-white px-6 py-12 md:px-12 md:py-14 text-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(203,110,231,0.4), transparent 45%)' }}
          />
          <h2 className="relative font-display text-2xl md:text-3xl font-bold max-w-2xl mx-auto text-balance">
            ¿Querés que Modeltex te ayude a convertir una idea en un molde listo para producir?
          </h2>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-900 font-semibold rounded-xl hover:bg-white/90 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5" /> Ver catálogo de moldes
            </Link>
            <Link
              to="/diseno-a-pedido"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl hover:bg-accent-600 transition-all active:scale-[0.98]"
            >
              <PenTool className="w-5 h-5" /> Pedir diseño a medida
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
            >
              <MessageCircle className="w-5 h-5" /> Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Modal de la card activa */}
      {activeCard && <IaTextilModal card={activeCard} onClose={() => setActiveCard(null)} />}
    </div>
  );
}
