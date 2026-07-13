import { FileText, Printer, Ruler, Download } from 'lucide-react';
import { SeoLandingTemplate } from './SeoLandingTemplate';

export default function MoldesPdfA4Page() {
  return (
    <SeoLandingTemplate
      path="/moldes-pdf-a4"
      title="Moldes PDF A4 para imprimir"
      description="Moldes PDF A4 para imprimir en casa o en tu taller. Modeltex ofrece moldes de ropa listos para hojas A4, con talles completos y descarga inmediata."
      heroTitle="Moldes PDF A4 para imprimir en hojas comunes"
      heroText="Si buscas moldes PDF A4 para imprimir, esta pagina apunta justo a esa necesidad: moldes listos para hoja A4, faciles de descargar, unir y llevar a produccion."
      primaryCta={{ label: 'Ver catalogo PDF A4', href: '/catalogo?formato=PDF%20A4' }}
      secondaryCta={{ label: 'Ver moldes PDF', href: '/moldes-pdf' }}
      benefitsTitle="Por que una landing para moldes PDF A4"
      benefitsIntro="Hay mucha gente que no busca molderia digital en general. Busca algo muy puntual: moldes listos para imprimir en A4. Esta pagina responde exactamente a eso."
      benefits={[
        'Pensada para quienes imprimen en casa o en una impresora comun.',
        'Moldes listos para unir y validar sin usar plotter.',
        'Ideal para emprendedores que prueban modelos rapido.',
        'Descarga inmediata con acceso desde la cuenta.',
      ]}
      sections={[
        {
          title: 'Moldes para imprimir en casa',
          text: 'Si tu prioridad es imprimir en hojas A4, esta opcion baja barrera de entrada y acelera pruebas de talles y muestras.',
          href: '/catalogo?formato=PDF%20A4',
          cta: 'Ver productos A4',
          icon: Printer,
        },
        {
          title: 'Moldes PDF de ropa listos para producir',
          text: 'Modeltex ofrece moldes PDF A4 de ropa con enfoque real en produccion textil, no solo en patronaje teorico.',
          href: '/catalogo',
          cta: 'Explorar catalogo',
          icon: FileText,
        },
        {
          title: 'Si luego necesitas plotter',
          text: 'Cuando el volumen crece, puedes pasar a PDF plotter manteniendo una logica profesional de trabajo.',
          href: '/moldes-para-plotter',
          cta: 'Ver opcion plotter',
          icon: Ruler,
        },
      ]}
      schemaName="Moldes PDF A4"
    />
  );
}
