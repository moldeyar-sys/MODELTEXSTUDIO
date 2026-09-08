import { FileText, Printer, Ruler } from 'lucide-react';
import { SeoLandingTemplate } from './SeoLandingTemplate';

export default function MoldesPdfA4Page() {
  return (
    <SeoLandingTemplate
      path="/moldes-pdf-a4"
      title="Moldes PDF A4 para imprimir"
      description="Moldes PDF A4 para imprimir en casa o en tu taller. Modeltex ofrece moldes de ropa listos para hojas A4, con talles completos y descarga inmediata."
      heroTitle="Moldes PDF A4 para imprimir en hojas comunes"
      heroText="Moldes de ropa en PDF A4: se imprimen en cualquier impresora casera, se pegan siguiendo la numeración de las hojas y quedan a escala real, con la curva de talles completa incluida."
      primaryCta={{ label: 'Ver catálogo PDF A4', href: '/catalogo?formato=PDF%20A4' }}
      secondaryCta={{ label: 'Ver moldes PDF', href: '/moldes-pdf' }}
      benefitsTitle="Qué incluye un molde PDF A4"
      benefitsIntro="Es el formato más simple para pasar de la pantalla a la tela: no hace falta plotter ni gráfica, solo una impresora común y las hojas numeradas."
      benefits={[
        'Se imprime en cualquier impresora casera, sin equipo especial.',
        'Piezas numeradas para pegar en el orden correcto.',
        'Curva de talles completa incluida en el archivo.',
        'Descarga inmediata desde tu cuenta después de comprar.',
      ]}
      sections={[
        {
          title: 'Moldes para imprimir en casa',
          text: 'Ideal para probar un modelo nuevo, validar el calce o producir un lote chico sin depender de una gráfica.',
          href: '/catalogo?formato=PDF%20A4',
          cta: 'Ver productos A4',
          icon: Printer,
        },
        {
          title: 'Moldes PDF de ropa listos para producir',
          text: 'Cada molde incluye talles, formatos y telas recomendadas reales, pensado para producción, no solo para patronaje de práctica.',
          href: '/catalogo',
          cta: 'Explorar catálogo',
          icon: FileText,
        },
        {
          title: 'Si después necesitás plotter',
          text: 'Cuando el volumen crece y pegar hojas empieza a atrasar, se puede pasar al mismo molde en formato plotter.',
          href: '/moldes-para-plotter',
          cta: 'Ver opción plotter',
          icon: Ruler,
        },
      ]}
      schemaName="Moldes PDF A4"
      faqs={[
        {
          q: '¿Qué necesito para imprimir un molde PDF A4?',
          a: 'Solo una impresora casera u de oficina común, configurada al 100% de escala (nunca "ajustar a la página"), y hojas A4 u oficio. No hace falta ningún equipo especial.',
        },
        {
          q: '¿Cómo se arma el molde después de imprimirlo?',
          a: 'Cada hoja sale numerada: se pegan en orden siguiendo esa numeración hasta formar la pieza completa a tamaño real. Cada archivo trae además un cuadrado de control para verificar con una regla que la impresión no perdió escala.',
        },
        {
          q: '¿El PDF A4 incluye todos los talles?',
          a: 'Sí, la curva de talles completa viene incluida en el archivo (XS a 4XL en adultos, 2 a 18 en niños); en la ficha del producto se elige qué talles imprimir.',
        },
        {
          q: '¿Cuándo conviene pasar de A4 a plotter?',
          a: 'Cuando pegar hojas empieza a atrasar la producción o se necesita cortar en cantidad: el mismo molde existe en formato plotter, en una sola lámina de ancho real, sin uniones.',
        },
      ]}
    />
  );
}
