import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Lock,
  MessageCircle,
  Printer,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { useSeo } from '../lib/seo';

export type TrustPageVariant = 'como-funciona' | 'ayuda-impresion' | 'politica-descargas' | 'terminos' | 'privacidad';

interface TrustPageProps {
  variant: TrustPageVariant;
}

type PageData = {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof HelpCircle;
  seoTitle: string;
  seoDescription: string;
  path: string;
  sections: Array<{
    title: string;
    text?: string;
    items?: string[];
    icon?: typeof CheckCircle2;
  }>;
  note?: string;
};

const pages: Record<TrustPageVariant, PageData> = {
  'como-funciona': {
    eyebrow: 'Guía de compra',
    title: 'Cómo comprar y descargar tus moldes',
    description: 'Un recorrido claro para saber qué elegís, cómo pagás y dónde encontrás tus archivos después de la compra.',
    icon: ShoppingCart,
    seoTitle: 'Cómo comprar moldes digitales',
    seoDescription: 'Guía para comprar moldes digitales en Modeltex: elegir formato, talles, pagar, descargar e imprimir.',
    path: '/como-funciona',
    sections: [
      {
        title: '1. Elegí el molde',
        icon: FileText,
        text: 'Entrá al catálogo, buscá por categoría o temporada y abrí la ficha del producto para revisar imágenes, talles, formatos y telas recomendadas.',
        items: ['Podés filtrar por Dama, Hombre, Niños, Bebés o Unisex.', 'Cada ficha muestra los formatos disponibles y las opciones de compra.'],
      },
      {
        title: '2. Seleccioná formato y talles',
        icon: CheckCircle2,
        text: 'Antes de agregar al carrito, elegí el formato que necesitás: PDF A4, PDF Plotter, cartón u otras opciones disponibles según el producto.',
        items: ['El precio puede cambiar según la cantidad de talles seleccionados.', 'Si necesitás otro formato, consultanos antes de pagar.'],
      },
      {
        title: '3. Pagá de forma segura',
        icon: ShieldCheck,
        text: 'Confirmá el pedido y elegí el método de pago disponible para tu país. Algunas formas de pago habilitan la descarga al instante y otras requieren confirmación manual.',
        items: ['Mercado Pago puede redirigirte al pago online.', 'Transferencia, PayPal o cripto pueden requerir comprobante.'],
      },
      {
        title: '4. Descargá desde tu cuenta',
        icon: Download,
        text: 'Cuando el pago está confirmado, los archivos quedan disponibles en tu cuenta de Modeltex para descargarlos.',
        items: ['Ingresá con el mismo email con el que compraste.', 'Si no ves la descarga, escribinos por WhatsApp con el número de pedido.'],
      },
    ],
  },
  'ayuda-impresion': {
    eyebrow: 'Ayuda técnica',
    title: 'Ayuda para imprimir y usar tus moldes',
    description: 'Recomendaciones prácticas para imprimir en A4, enviar a plotter o trabajar archivos editables sin perder escala.',
    icon: Printer,
    seoTitle: 'Ayuda para imprimir moldes digitales',
    seoDescription: 'Cómo imprimir moldes digitales en A4 o plotter y usar formatos DXF, CDR y PLT en producción textil.',
    path: '/ayuda-impresion',
    sections: [
      {
        title: 'PDF A4',
        icon: Printer,
        text: 'Imprimí siempre en tamaño real, escala 100%, sin ajustar al área imprimible. Antes de unir todas las hojas, revisá el cuadro de control si el archivo lo incluye.',
        items: ['No uses “ajustar a página”.', 'Uní las hojas siguiendo marcas o continuidad de líneas.', 'Probá primero una hoja si tu impresora cambia márgenes.'],
      },
      {
        title: 'PDF Plotter',
        icon: FileText,
        text: 'Para plotter, confirmá el ancho de rollo con tu gráfica o equipo antes de imprimir. Si tenés dudas, mandanos el producto y el ancho disponible.',
        items: ['Revisá si necesitás 90 cm, 120 cm o 150 cm.', 'Pedí impresión a escala 1:1.', 'No permitas que la gráfica “escale para ajustar”.'],
      },
      {
        title: 'DXF, CDR y PLT',
        icon: Scale,
        text: 'Son formatos pensados para edición, ploteo o maquinaria. Verificá compatibilidad con tu programa antes de producir grandes cantidades.',
        items: ['DXF suele ser compatible con software CAD.', 'CDR se trabaja en CorelDRAW.', 'PLT se usa para ploteo vectorial.'],
      },
      {
        title: 'Si algo no coincide',
        icon: MessageCircle,
        text: 'Guardá captura, nombre del molde y formato usado. Con eso podemos ayudarte más rápido por WhatsApp.',
        items: ['Indicá impresora, programa y tamaño de papel.', 'No cortes tela hasta verificar escala y piezas principales.'],
      },
    ],
  },
  'politica-descargas': {
    eyebrow: 'Compra digital',
    title: 'Política de descargas digitales y reembolsos',
    description: 'Condiciones claras para productos digitales, entregas manuales, comprobantes y pedidos de ayuda.',
    icon: RefreshCw,
    seoTitle: 'Política de descargas digitales y reembolsos',
    seoDescription: 'Condiciones de descarga, entrega digital y reembolsos para compras de moldes digitales en Modeltex.',
    path: '/politica-descargas',
    sections: [
      {
        title: 'Producto digital',
        icon: Download,
        text: 'Los moldes digitales se entregan como archivos descargables desde la cuenta del cliente. No implican envío físico salvo que el formato comprado indique explícitamente “cartón”.',
        items: ['Revisá formato y talles antes de pagar.', 'La descarga queda asociada a tu cuenta.', 'El soporte se brinda por los canales publicados.'],
      },
      {
        title: 'Confirmación de pago',
        icon: ShieldCheck,
        text: 'Algunos métodos de pago se confirman automáticamente. Otros, como transferencia o pagos manuales, pueden demorar hasta 24 horas hábiles.',
        items: ['Enviá comprobante si el sistema lo solicita.', 'Usá el mismo email de compra para consultar.', 'Conservá el número de pedido.'],
      },
      {
        title: 'Reembolsos y cambios',
        icon: RefreshCw,
        text: 'Por tratarse de productos digitales, una vez habilitada o descargada la compra no se realizan reembolsos automáticos. Si hubo un error técnico verificable, revisamos el caso para ayudarte.',
        items: ['Podemos corregir accesos o reenviar archivos si corresponde.', 'No se reemplaza una compra por elegir mal talle/formato sin consulta previa.', 'Para formatos especiales, consultá antes de abonar.'],
      },
      {
        title: 'Soporte post-compra',
        icon: MessageCircle,
        text: 'Si no podés descargar, imprimir o abrir un archivo, escribinos con nombre del producto, formato comprado y captura del problema.',
        items: ['Atendemos por WhatsApp o email.', 'La respuesta puede variar según horario de atención.', 'No borres el email de confirmación.'],
      },
    ],
    note: 'Estos textos son una base operativa para el sitio. Si necesitás cobertura legal específica para tu empresa, conviene revisarlos con un profesional.',
  },
  terminos: {
    eyebrow: 'Condiciones de uso',
    title: 'Términos y condiciones',
    description: 'Reglas básicas para comprar, usar archivos, consultar soporte y navegar el sitio de Modeltex.',
    icon: FileText,
    seoTitle: 'Términos y condiciones',
    seoDescription: 'Términos y condiciones de uso del sitio Modeltex y de compra de moldes digitales.',
    path: '/terminos',
    sections: [
      {
        title: 'Uso del sitio',
        icon: FileText,
        text: 'Al navegar o comprar en Modeltex aceptás usar el sitio de forma responsable y brindar datos reales para procesar tu pedido.',
        items: ['No intentes acceder a cuentas ajenas.', 'No compartas datos falsos de pago.', 'Mantené segura tu contraseña.'],
      },
      {
        title: 'Compra de moldes',
        icon: ShoppingCart,
        text: 'Cada producto informa, según disponibilidad, formatos, talles, precio y modalidad de entrega. El cliente debe revisar esos datos antes de confirmar la compra.',
        items: ['Los precios pueden cambiar sin aviso previo.', 'La disponibilidad depende del catálogo vigente.', 'Los pedidos a medida tienen condiciones propias.'],
      },
      {
        title: 'Uso de archivos',
        icon: Lock,
        text: 'Los archivos comprados se entregan para uso productivo del cliente. No está permitido revender, publicar o distribuir los archivos digitales como producto propio.',
        items: ['Podés producir prendas usando el molde comprado.', 'No compartas enlaces de descarga públicamente.', 'No vendas el archivo original ni copias del archivo.'],
      },
      {
        title: 'Soporte y cambios',
        icon: MessageCircle,
        text: 'Modeltex brinda soporte razonable para acceso, descarga e interpretación general de los archivos. Las modificaciones especiales pueden tener costo adicional.',
        items: ['Consultas técnicas deben incluir producto y formato.', 'Los tiempos de respuesta dependen del horario de atención.', 'Pedidos personalizados se presupuestan aparte.'],
      },
    ],
    note: 'Estos términos pueden actualizarse para reflejar cambios del servicio, métodos de pago o catálogo.',
  },
  privacidad: {
    eyebrow: 'Datos personales',
    title: 'Política de privacidad',
    description: 'Qué datos pedimos, para qué los usamos y cómo se relacionan con compras, cuentas y soporte.',
    icon: Lock,
    seoTitle: 'Política de privacidad',
    seoDescription: 'Política de privacidad de Modeltex: uso de datos personales, cuenta, compras y comunicaciones de soporte.',
    path: '/privacidad',
    sections: [
      {
        title: 'Datos que podemos solicitar',
        icon: Lock,
        text: 'Para crear cuenta, comprar o pedir soporte podemos solicitar nombre, email, WhatsApp, país, ciudad y datos relacionados con pedidos.',
        items: ['No solicitamos contraseñas por WhatsApp.', 'Los datos de pago se procesan por proveedores externos cuando corresponde.', 'Guardamos información necesaria para entregar compras y soporte.'],
      },
      {
        title: 'Uso de la información',
        icon: ShieldCheck,
        text: 'Usamos los datos para gestionar cuentas, procesar pedidos, habilitar descargas, responder consultas y mejorar la experiencia del sitio.',
        items: ['Podemos contactarte por el pedido realizado.', 'Podemos registrar mensajes de contacto para seguimiento.', 'No vendemos tus datos personales como base comercial.'],
      },
      {
        title: 'Proveedores y servicios',
        icon: FileText,
        text: 'El sitio puede usar servicios externos para base de datos, hosting, pagos, email, analítica o atención. Cada proveedor opera bajo sus propias medidas de seguridad.',
        items: ['Supabase puede almacenar datos de cuenta y pedidos.', 'Vercel puede alojar el sitio y funciones.', 'Mercado Pago, PayPal u otros procesan pagos según disponibilidad.'],
      },
      {
        title: 'Consultas sobre tus datos',
        icon: MessageCircle,
        text: 'Si querés consultar, corregir o pedir revisión de tus datos asociados a una compra, escribinos desde el mismo email o WhatsApp usado en tu cuenta.',
        items: ['Podemos pedir verificación de identidad.', 'Algunos datos de compra deben conservarse por registro operativo.', 'Nunca publiques tus datos sensibles en comentarios abiertos.'],
      },
    ],
    note: 'Esta política es una base informativa para clientes. Para requisitos legales específicos por jurisdicción, conviene revisión profesional.',
  },
};

const relatedLinks: Array<{ to: string; label: string; icon: typeof HelpCircle }> = [
  { to: '/como-funciona', label: 'Cómo funciona', icon: ShoppingCart },
  { to: '/ayuda-impresion', label: 'Ayuda para imprimir', icon: Printer },
  { to: '/politica-descargas', label: 'Descargas y reembolsos', icon: RefreshCw },
  { to: '/terminos', label: 'Términos', icon: FileText },
  { to: '/privacidad', label: 'Privacidad', icon: Lock },
];

export default function TrustPage({ variant }: TrustPageProps) {
  const page = pages[variant];
  const Icon = page.icon;

  useSeo({
    title: page.seoTitle,
    description: page.seoDescription,
    path: page.path,
  });

  return (
    <div className="min-h-screen bg-petroleum-50">
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-petroleum-800 text-white">
        <div className="container-custom py-10 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-sm font-semibold">
            <Icon className="w-4 h-4 text-accent-300" /> {page.eyebrow}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-5 max-w-3xl text-balance">
            {page.title}
          </h1>
          <p className="text-base sm:text-lg text-white/85 mt-4 max-w-2xl leading-relaxed">
            {page.description}
          </p>
        </div>
      </section>

      <div className="container-custom py-8 md:py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
          <main className="space-y-5">
            {page.sections.map(section => {
              const SectionIcon = section.icon || CheckCircle2;
              return (
                <section key={section.title} className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-800 flex items-center justify-center flex-shrink-0">
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-primary-900 leading-tight">
                        {section.title}
                      </h2>
                      {section.text && <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">{section.text}</p>}
                    </div>
                  </div>
                  {section.items && (
                    <ul className="mt-4 grid gap-2">
                      {section.items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-petroleum-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}

            {page.note && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{page.note}</p>
              </div>
            )}
          </main>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="font-semibold text-primary-900 mb-3">Ayuda y confianza</h2>
              <div className="space-y-2">
                {relatedLinks.map(link => {
                  const LinkIcon = link.icon;
                  const active = link.to === page.path;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active ? 'bg-primary-50 text-primary-800' : 'text-gray-600 hover:bg-gray-50 hover:text-primary-800'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <LinkIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-primary-900 rounded-2xl p-5 text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 text-accent-300 mb-3" />
              <h2 className="font-display text-xl font-bold">¿Necesitás ayuda?</h2>
              <p className="text-sm text-primary-100 mt-2 leading-relaxed">
                Mandanos el nombre del molde, formato elegido y tu duda. Con esos datos podemos responder más rápido.
              </p>
              <Link to="/contacto" className="mt-4 btn-accent w-full text-sm">
                Contactar a Modeltex
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}