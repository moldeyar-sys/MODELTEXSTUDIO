import { Download, FileText, Printer, Ruler } from 'lucide-react';
import { SeoLandingTemplate } from './SeoLandingTemplate';

export default function MoldesPlotterPage() {
  return (
    <SeoLandingTemplate
      path="/moldes-para-plotter"
      title="Moldes para plotter y produccion textil"
      description="Moldes para plotter en PDF listos para imprimir en rollo. Modeltex ofrece molderia digital profesional para talleres, graficas y produccion textil."
      heroTitle="Moldes para plotter listos para imprimir en grande"
      heroText="Si buscas moldes para plotter, aca apuntas a una necesidad mas profesional: imprimir piezas en gran formato, evitar uniones y trabajar mejor en taller o produccion."
      primaryCta={{ label: 'Ver catalogo plotter', href: '/catalogo?formato=PDF%20Plotter' }}
      secondaryCta={{ label: 'Ver moldes PDF A4', href: '/moldes-pdf-a4' }}
      benefitsTitle="Por que esta pagina ayuda a posicionar"
      benefitsIntro="Hay usuarios que no buscan solo moldes. Buscan especificamente moldes para plotter. Esta landing te da una puerta de entrada mucho mas precisa."
      benefits={[
        'Enfocada en talleres, graficas y produccion continua.',
        'Mejor para piezas grandes y flujo profesional.',
        'Conecta directo con el catalogo filtrado por plotter.',
        'Refuerza autoridad en busquedas mas tecnicas.',
      ]}
      sections={[
        {
          title: 'PDF plotter para produccion',
          text: 'Los moldes para plotter evitan cortar y unir hojas A4, mejorando tiempo, orden y consistencia.',
          href: '/catalogo?formato=PDF%20Plotter',
          cta: 'Ver moldes plotter',
          icon: Ruler,
        },
        {
          title: 'Si necesitas una opcion mas simple',
          text: 'Tambien puedes empezar con moldes PDF A4 si estas validando modelos o trabajando con una escala menor.',
          href: '/moldes-pdf-a4',
          cta: 'Ir a PDF A4',
          icon: Printer,
        },
        {
          title: 'Molderia digital con descarga inmediata',
          text: 'El objetivo no es solo imprimir: es producir mas rapido con archivos claros y listos para usar.',
          href: '/moldes-pdf',
          cta: 'Ver base de moldes PDF',
          icon: Download,
        },
      ]}
      schemaName="Moldes para plotter"
    />
  );
}
