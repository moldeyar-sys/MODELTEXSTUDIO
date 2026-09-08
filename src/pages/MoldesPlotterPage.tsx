import { Download, Printer, Ruler } from 'lucide-react';
import { SeoLandingTemplate } from './SeoLandingTemplate';

export default function MoldesPlotterPage() {
  return (
    <SeoLandingTemplate
      path="/moldes-para-plotter"
      title="Moldes para plotter y producción textil"
      description="Moldes para plotter en PDF listos para imprimir en rollo. Modeltex ofrece molderia digital profesional para talleres, gráficas y producción textil."
      heroTitle="Moldes para plotter, listos para imprimir en ancho real"
      heroText="Moldes de ropa en PDF plotter: se imprimen en una sola lámina de 90, 120 o 150 cm de ancho (según el molde) en cualquier servicio de ploteo, sin cortar ni pegar hojas."
      primaryCta={{ label: 'Ver catálogo plotter', href: '/catalogo?formato=PDF%20Plotter' }}
      secondaryCta={{ label: 'Ver moldes PDF A4', href: '/moldes-pdf-a4' }}
      benefitsTitle="Por qué usar plotter en un taller"
      benefitsIntro="Es el formato que evita pegar hojas y sostiene mejor un ritmo de producción: cada pieza sale entera, en tamaño real, lista para tender sobre la tela."
      benefits={[
        'Pensado para talleres, gráficas y producción continua.',
        'Piezas grandes sin cortar ni unir hojas A4.',
        'Se pide directo al catálogo filtrado por plotter.',
        'Mismo molde disponible en DXF/AAMA si trabajás en CAD.',
      ]}
      sections={[
        {
          title: 'PDF plotter para producción',
          text: 'Se imprime en una sola lámina de ancho real, ahorrando el tiempo de cortar y pegar hojas A4.',
          href: '/catalogo?formato=PDF%20Plotter',
          cta: 'Ver moldes plotter',
          icon: Ruler,
        },
        {
          title: 'Si necesitás una opción más simple',
          text: 'Para probar un modelo o producir en poca cantidad, el mismo molde en PDF A4 alcanza y no depende de un servicio de ploteo.',
          href: '/moldes-pdf-a4',
          cta: 'Ir a PDF A4',
          icon: Printer,
        },
        {
          title: 'Todo el catálogo en PDF',
          text: 'Más de 2.000 moldes con talles y formatos profesionales, con descarga inmediata después de la compra.',
          href: '/moldes-pdf',
          cta: 'Ver base de moldes PDF',
          icon: Download,
        },
      ]}
      schemaName="Moldes para plotter"
      faqs={[
        {
          q: '¿En qué anchos vienen los moldes para plotter?',
          a: 'En 90, 120 o 150 cm según el molde — el ancho real que soporta la mayoría de las gráficas de ploteo textil. La ficha de cada producto indica el ancho exacto.',
        },
        {
          q: '¿Dónde imprimo un molde PDF plotter?',
          a: 'En cualquier gráfica o servicio de ploteo textil: se lleva el archivo y se imprime al 100% de escala, en una sola lámina, sin necesidad de pegar hojas.',
        },
        {
          q: '¿El plotter incluye la curva de talles completa?',
          a: 'Sí, igual que el resto de los formatos: XS a 4XL en adultos y 2 a 18 en niños, ya escalados y aprobados con una muestra confeccionada.',
        },
        {
          q: '¿Puedo pedir el mismo molde en DXF/AAMA en vez de PDF?',
          a: 'Sí, si cortás con un sistema CAD (Optitex, Audaces, Gerber, Lectra) el molde también está disponible en DXF/AAMA con la curva completa incluida.',
        },
      ]}
    />
  );
}
