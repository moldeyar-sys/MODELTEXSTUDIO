import {
  Compass, TrendingUp, Scissors, Layers, Sparkles, Calculator, Rocket, Wand2,
  type LucideIcon,
} from 'lucide-react';

// Datos de las tarjetas de la seccion "IA Textil".
// Cada card abre un modal con preguntas sugeridas + mini-chat (usa /api/chat).
export interface IaTextilCard {
  id: string;
  icon: LucideIcon;
  title: string;
  text: string;
  cta: string;
  /** Frase corta que encabeza la experiencia dentro del modal. */
  intro: string;
  /** Preguntas sugeridas (clic = consulta directa a la IA). */
  questions: string[];
}

export const IA_TEXTIL_CARDS: IaTextilCard[] = [
  {
    id: 'que-fabricar',
    icon: Compass,
    title: 'No sé qué fabricar',
    text: 'Respondé algunas preguntas y la IA te ayuda a elegir prendas con potencial de venta.',
    cta: 'Empezar asesoría',
    intro: 'Contame tu situación y te oriento sobre qué prenda conviene producir.',
    questions: [
      'Tengo poco presupuesto, ¿qué prenda me conviene producir?',
      'Quiero vender por Instagram, ¿qué modelos me recomendás?',
      'Quiero fabricar ropa de mujer para verano, ¿por dónde empiezo?',
    ],
  },
  {
    id: 'tendencias-verano-2026',
    icon: TrendingUp,
    title: 'Tendencias verano 2026',
    text: 'Ideas de prendas, moldes y colecciones para producir esta temporada.',
    cta: 'Ver tendencias',
    intro: 'Te paso ideas de prendas y colecciones con buena salida para esta temporada.',
    questions: [
      '¿Qué modelos pueden venderse mejor este verano?',
      '¿Qué prendas simples puedo fabricar para temporada alta?',
      '¿Qué colección básica me conviene armar?',
    ],
  },
  {
    id: 'molde-ideal',
    icon: Scissors,
    title: 'Elegí tu molde ideal',
    text: 'Te recomendamos moldes según tu rubro, público, nivel de producción y objetivo.',
    cta: 'Encontrar molde',
    intro: 'Decime tu rubro y objetivo y te recomiendo moldes de nuestro catálogo.',
    questions: [
      'Quiero un molde fácil para empezar.',
      'Quiero fabricar por mayor.',
      'Necesito moldes para dama, cómodos y vendibles.',
    ],
  },
  {
    id: 'tengo-tela',
    icon: Layers,
    title: 'Tengo una tela, ¿qué puedo fabricar?',
    text: 'Decinos qué tela tenés y la IA te sugiere prendas posibles para producir.',
    cta: 'Consultar por tela',
    intro: 'Decime qué tela tenés y te sugiero prendas que le quedan bien.',
    questions: [
      'Tengo morley, ¿qué puedo fabricar?',
      'Tengo frisa, ¿qué prendas convienen?',
      'Tengo jean elastizado, ¿qué modelos puedo hacer?',
    ],
  },
  {
    id: 'armar-coleccion',
    icon: Sparkles,
    title: 'Armar colección con IA',
    text: 'Creá una mini colección de prendas coherente, vendible y lista para producir.',
    cta: 'Crear colección',
    intro: 'Te armo una mini colección coherente y pensada para producir y vender.',
    questions: [
      'Armame una colección de 5 prendas para mujer.',
      'Quiero una colección urbana de verano.',
      'Quiero una colección infantil simple para producir.',
    ],
  },
  {
    id: 'calculadora-textil',
    icon: Calculator,
    title: 'Calculadora textil IA',
    text: 'Estimá costos, consumo de tela, margen y precio sugerido de venta.',
    cta: 'Calcular',
    intro: 'Pasame los datos de tu prenda y estimamos costo, margen y precio de venta.',
    questions: [
      'Quiero calcular costo aproximado por prenda.',
      'Quiero calcular precio de venta.',
      'Quiero calcular margen de ganancia.',
    ],
  },
  {
    id: 'emprendedores',
    icon: Rocket,
    title: 'Ideas para emprendedores textiles',
    text: 'Consejos para empezar a fabricar con poco presupuesto y vender mejor.',
    cta: 'Ver ideas',
    intro: 'Te doy ideas concretas para arrancar con poca inversión y vender mejor.',
    questions: [
      'Quiero empezar con poca inversión.',
      'Quiero vender moldes o prendas por Instagram.',
      '¿Qué prendas convienen para empezar sin mucho riesgo?',
    ],
  },
  {
    id: 'diseno-a-pedido-ia',
    icon: Wand2,
    title: 'Diseño a pedido con IA',
    text: 'Usá la IA para ordenar tu idea antes de pedir un diseño personalizado.',
    cta: 'Preparar pedido',
    intro: 'Ordenemos tu idea juntos para que el pedido de diseño salga claro y fabricable.',
    questions: [
      'Quiero ordenar mi idea antes de pedir un molde.',
      'Necesito transformar una idea en una prenda fabricable.',
      'Quiero pedir un diseño personalizado a Modeltex.',
    ],
  },
];
