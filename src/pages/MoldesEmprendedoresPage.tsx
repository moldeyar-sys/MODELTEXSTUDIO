import { Download, FileText, Printer, ShoppingBag } from 'lucide-react';
import { SeoLandingTemplate } from './SeoLandingTemplate';

export default function MoldesEmprendedoresPage() {
  return (
    <SeoLandingTemplate
      path="/moldes-para-emprendedores"
      title="Moldes para emprendedores de indumentaria"
      description="Moldes para emprendedores que quieren lanzar o crecer una marca de ropa. Modeltex ofrece moldes PDF y molderia digital con talles listos para producir."
      heroTitle="Moldes para emprendedores que quieren producir mas rapido"
      heroText="Si una persona busca moldes para emprender en indumentaria, esta landing le habla directo: moldes PDF, talles completos, descarga inmediata y formatos utiles para probar, vender y escalar."
      primaryCta={{ label: 'Ver catalogo para emprender', href: '/catalogo' }}
      secondaryCta={{ label: 'Ver moldes gratis', href: '/moldes-gratis' }}
      benefitsTitle="Por que sirve una landing por tipo de cliente"
      benefitsIntro="No todos llegan buscando lo mismo. Muchos no ponen una prenda puntual: ponen 'moldes para emprendedores'. Esta pagina te abre esa puerta."
      benefits={[
        'Habla el idioma del cliente que esta empezando o creciendo.',
        'Conecta moldes con necesidad comercial, no solo tecnica.',
        'Refuerza confianza con descarga inmediata y formatos claros.',
        'Empuja tanto catalogo pago como moldes gratis de entrada.',
      ]}
      sections={[
        {
          title: 'Moldes para lanzar una marca',
          text: 'Si necesitas avanzar mas rapido con muestras y primeras ventas, los moldes PDF reducen tiempo y dependencia externa.',
          href: '/catalogo',
          cta: 'Ver moldes del catalogo',
          icon: ShoppingBag,
        },
        {
          title: 'Probar antes con moldes gratis',
          text: 'Muchos emprendedores primero quieren validar calidad. Los moldes gratis ayudan a generar confianza y empezar.',
          href: '/moldes-gratis',
          cta: 'Ver moldes gratis',
          icon: Download,
        },
        {
          title: 'Empezar con A4 y luego escalar',
          text: 'Puedes iniciar con A4 para muestras y pasar a formatos mas profesionales a medida que crece tu produccion.',
          href: '/moldes-pdf-a4',
          cta: 'Ir a moldes PDF A4',
          icon: Printer,
        },
      ]}
      schemaName="Moldes para emprendedores"
    />
  );
}
