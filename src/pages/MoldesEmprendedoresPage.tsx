import { Download, Printer, ShoppingBag } from 'lucide-react';
import { SeoLandingTemplate } from './SeoLandingTemplate';

export default function MoldesEmprendedoresPage() {
  return (
    <SeoLandingTemplate
      path="/moldes-para-emprendedores"
      title="Moldes para emprendedores de indumentaria"
      description="Moldes para emprendedores que quieren lanzar o crecer una marca de ropa. Modeltex ofrece moldes PDF y molderia digital con talles listos para producir."
      heroTitle="Moldes de ropa para lanzar o crecer tu marca"
      heroText="Moldes digitales ya probados con muestra confeccionada, con la curva de talles completa incluida: la base para producir tu primera tanda sin desarrollar moldería desde cero."
      primaryCta={{ label: 'Ver catálogo', href: '/catalogo' }}
      secondaryCta={{ label: 'Probar un molde gratis', href: '/moldes-gratis' }}
      benefitsTitle="Qué necesita un emprendimiento para empezar a producir"
      benefitsIntro="Moldes aprobados con muestra real, talles completos y formatos que se adaptan a cómo cortás hoy, sea a mano o en un taller externo."
      benefits={[
        'Cada molde se aprueba con una prenda confeccionada antes de publicarse.',
        'Curva de talles completa incluida, sin desarrollarla por tu cuenta.',
        'PDF A4 para imprimir en casa o plotter si ya trabajás con un taller.',
        'Descarga inmediata: podés arrancar la misma tarde de la compra.',
      ]}
      sections={[
        {
          title: 'Moldes para tu primera tanda',
          text: 'Más de 2.000 moldes con muestra aprobada, para no depender de desarrollar cada modelo desde cero.',
          href: '/catalogo',
          cta: 'Ver catálogo completo',
          icon: ShoppingBag,
        },
        {
          title: 'Probar la calidad antes de comprar',
          text: 'La sección de moldes gratis tiene el mismo nivel de terminación que el catálogo pago, para validar antes de tu primera compra.',
          href: '/moldes-gratis',
          cta: 'Ver moldes gratis',
          icon: Download,
        },
        {
          title: 'Empezar con PDF A4 y escalar después',
          text: 'Para las primeras tandas alcanza con imprimir en casa; cuando el volumen crece, el mismo molde está disponible en plotter.',
          href: '/moldes-pdf-a4',
          cta: 'Ver moldes PDF A4',
          icon: Printer,
        },
      ]}
      schemaName="Moldes para emprendedores"
    />
  );
}
