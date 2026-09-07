import type { Guia } from '../guiasTypes.js';

export const guia: Guia = {
  slug: 'exportar-y-convertir-dxf-entre-optitex-y-audaces',
  title: 'Cómo exportar y convertir DXF entre Optitex y Audaces',
  seoTitle: 'Exportar y convertir DXF entre Optitex y Audaces',
  description:
    'Cómo exportar un molde a DXF/AAMA desde Optitex o desde Audaces Moldes, qué revisar al importarlo del otro lado y cómo evitar errores de escala y de capas.',
  intro:
    'Para pasar un molde de Optitex a Audaces (o al revés) el puente es el formato DXF/AAMA: no hay una conversión directa entre los dos programas, sino una exportación a un estándar intermedio y una importación del otro lado. El resultado depende de elegir la unidad correcta al exportar, de que las capas de piquetes y sentido de hilo se mapeen bien al importar, y de confirmar con una medida real contra la ficha técnica que la escala no se corrió.',
  sections: [
    {
      h2: 'DXF/AAMA como puente entre Optitex y Audaces',
      paragraphs: [
        'Optitex y Audaces tienen cada uno su formato nativo (PDS en Optitex, ADS en Audaces Moldes) y ninguno lee el del otro directamente. El camino para pasar un molde de uno a otro es exportarlo a DXF/AAMA, el estándar de intercambio de moldería (norma ASTM D6673, heredera de la AAMA-292), e importarlo del lado que lo recibe.',
        'El DXF/AAMA guarda cada tipo de información en una capa numerada: contorno, piquetes, sentido de hilo, líneas internas, textos. Esas capas son justamente lo que se puede perder o mapear mal en el viaje entre programas, así que convertir un molde es exportar, importar y después revisar que cada capa llegó donde tiene que llegar.',
      ],
    },
    {
      h2: 'Exportar desde Optitex: Archivo > Exportar > DXF/AAMA',
      paragraphs: [
        'En Optitex PDS la exportación está en Archivo > Exportar > DXF/AAMA (en algunas versiones, Exportar > DXF). El cuadro pide elegir la unidad de salida, centímetros, milímetros o pulgadas, y esa elección tiene que coincidir con la unidad en la que va a trabajar Audaces: el DXF guarda los números en la unidad que indiques, no en una unidad universal.',
        'Antes de exportar conviene confirmar en las propiedades de la pieza que el sentido de hilo y los piquetes estén cargados como tales, no solo dibujados a ojo. Si el molde tiene curva de talles completa, hay que marcar la exportación de todos los talles o generar el archivo .rul de reglas de escalado junto con el DXF; si no, del otro lado entra un solo talle.',
      ],
    },
    {
      h2: 'Exportar desde Audaces Moldes hacia DXF/AAMA',
      paragraphs: [
        'En Audaces Moldes la exportación está en el menú Archivo, con la opción de exportar a DXF o el asistente de exportación AAMA según la versión. Audaces trabaja en centímetros por defecto, así que si el destino va a leer el archivo en pulgadas hay que indicarlo ahí mismo, no corregirlo después escalando la pieza a mano.',
        'Audaces permite elegir qué capas exportar: contorno, piquetes, sentido de hilo, textos, línea de costura. Conviene dejar tildadas todas las que el programa de destino vaya a necesitar; si vas a seguir editando en Optitex, exportar la línea de costura aparte del contorno evita tener que reconstruirla después.',
      ],
    },
    {
      h2: 'Qué revisar al importar del otro lado',
      paragraphs: [
        'Al abrir el DXF con Archivo > Importar > DXF en el programa de destino, lo primero es confirmar en el cuadro de importación la unidad del archivo de origen, no la de tu configuración por defecto. Si Optitex exportó en pulgadas y Audaces importa asumiendo centímetros, la pieza entra 2,54 veces más grande; al revés, entra 2,54 veces más chica.',
        'Segundo, revisá el mapeo de capas: que los piquetes entraron con tipo y profundidad y no como líneas sueltas, y que el sentido de hilo entró como línea con dirección. Si ves rayitas sueltas donde debería haber una muesca, convertilas con la herramienta de piquetes antes de seguir trabajando la pieza.',
      ],
      bullets: [
        'Unidad del archivo (cm, mm o pulgadas): confirmarla en el cuadro de importación, no asumirla.',
        'Piquetes: con tipo y profundidad, no como líneas sueltas.',
        'Sentido de hilo: como línea con dirección definida.',
        'Curva de talles completa (o archivo .rul) si el molde tiene varios talles.',
        'Margen de costura: confirmar si el contorno ya lo incluye antes de sumar otro.',
      ],
    },
    {
      h2: 'Confirmar que la escala no se corrió: medir contra la ficha técnica',
      paragraphs: [
        'La verificación real es con la herramienta de medir, no a simple vista. Tomá dos o tres medidas conocidas de la pieza en el talle base (ancho de pecho, largo total, largo de manga) y compará contra la ficha técnica del molde. Si coinciden, la escala pasó bien; si hay una diferencia proporcional fija, el problema fue la unidad.',
        'Ejemplo con números redondos: si la ficha marca 52 cm de ancho de pecho y al medir la pieza importada da 20,47 cm, el archivo se leyó en pulgadas en vez de centímetros (52 ÷ 2,54 = 20,47). Si da 5,2 cm, se leyó en milímetros. Volver a importar con la unidad correcta soluciona los dos casos; escalar la pieza a mano después no sirve, porque el error se arrastra desigual en los detalles internos.',
      ],
    },
    {
      h2: 'Problemas típicos de la conversión DXF entre Optitex y Audaces',
      paragraphs: [
        'Además del error de unidad, hay otros problemas que aparecen seguido en esta conversión y no tienen que ver con la escala.',
      ],
      bullets: [
        'Pérdida de texto y anotaciones: nombres de pieza, notas de tela e indicaciones de corte no siempre viajan igual, porque cada programa maneja las capas de texto a su manera. Conviene renombrar las piezas a mano en el destino en vez de confiar en que el texto llegó legible.',
        'Curvas convertidas en polígonos: si el DXF se exportó con tolerancia de curva alta o pocos puntos por curva, una sisa o un escote que era una curva suave entra como una seguidilla de segmentos rectos cortitos. Se nota haciendo zoom sobre una curva cerrada.',
        'Piquetes que llegan como trazos sueltos, cuando quien exportó los cargó en la capa de líneas internas en vez de la capa de piquetes.',
      ],
    },
    {
      h2: 'Cómo pedir un DXF de mejor calidad a quien exporta',
      paragraphs: [
        'Si un molde llega con curvas convertidas en polígonos, la solución no es suavizarlas del lado que las recibe, porque ahí ya se perdió precisión, sino pedirle a quien exportó que regenere el archivo subiendo la resolución de las curvas: cuanto más baja la tolerancia (o más alto el número de puntos por curva), más fiel queda la curva original.',
        'Conviene pedir puntualmente: la unidad exacta usada al exportar, todas las capas necesarias tildadas (piquetes, sentido de hilo, textos, línea de costura), la curva de talles completa o el .rul, y la tolerancia de curva más fina que permita el programa de origen. Un DXF pedido así ahorra la mitad de las correcciones después de importar.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Cómo exportar o convertir archivos DXF entre Optitex y Audaces?',
      a: 'Desde Optitex se exporta con Archivo > Exportar > DXF/AAMA, eligiendo la unidad correcta y marcando la exportación de todos los talles o el archivo .rul. Desde Audaces Moldes se exporta con la función de exportación a DXF o AAMA del menú Archivo, tildando las capas de piquetes, sentido de hilo y textos. Del lado que recibe hay que confirmar la unidad al importar, revisar el mapeo de capas y medir una pieza contra la ficha técnica antes de cortar.',
    },
    {
      q: '¿Qué unidad tengo que elegir al exportar un DXF desde Optitex o Audaces?',
      a: 'La que use el programa que va a recibir el archivo, confirmada explícitamente en el cuadro de exportación en vez de dejar la que viene por defecto. Si hay dudas, lo más seguro es exportar en centímetros y volver a confirmarla en el cuadro de importación del otro lado.',
    },
    {
      q: '¿Por qué las piezas quedan 2,54 veces más grandes o más chicas después de convertir el DXF?',
      a: 'Porque hubo una confusión entre pulgadas y centímetros: 1 pulgada equivale exactamente a 2,54 cm, y ese factor es la firma típica de un error de unidad. Volvé a importar indicando la unidad correcta; escalar la pieza después no arregla el problema porque piquetes y márgenes no se corrigen parejo.',
    },
    {
      q: '¿Por qué mis curvas se ven como polígonos después de exportar a DXF?',
      a: 'Porque el DXF se generó con bajo nivel de detalle: una tolerancia de curva alta hace que el programa guarde una curva suave como segmentos rectos cortos. Para evitarlo hay que pedirle a quien exporta que baje la tolerancia en el cuadro de exportación de DXF, no corregirlo después en el programa que recibe el archivo.',
    },
    {
      q: '¿Se pierden el texto y las anotaciones al convertir un molde de Optitex a Audaces?',
      a: 'Es uno de los problemas más comunes de esta conversión: nombres de pieza, notas de tela e indicaciones de corte no siempre viajan legibles, porque cada programa maneja las capas de texto a su manera. Conviene revisar y renombrar las piezas a mano después de importar.',
    },
    {
      q: '¿Cómo confirmo que la escala de un molde importado es correcta?',
      a: 'Con la herramienta de medir: tomá dos o tres medidas conocidas en el talle base, como ancho de pecho y largo total, y compará contra la ficha técnica del molde. Si hay una diferencia proporcional fija, como 2,54 o 10 veces, el problema fue la unidad elegida al exportar o al importar.',
    },
  ],
  related: [
    { label: 'Cómo abrir un DXF en Optitex, Audaces, Gerber y Lectra', to: '/guias/abrir-moldes-dxf-en-optitex-audaces-gerber-lectra' },
    { label: 'Conversión de pulgadas a centímetros para moldería', to: '/guias/conversion-de-pulgadas-a-centimetros-para-molderia' },
    { label: 'Qué formato de molde conviene para tu taller', to: '/guias/formatos-de-molderia-digital' },
    { label: 'Moldería a pedido con tu tabla de medidas', to: '/diseno-a-pedido' },
    { label: 'Contacto', to: '/contacto' },
  ],
  updated: '2026-09-08',
  keywords: [
    'exportar DXF Optitex Audaces',
    'convertir DXF entre Optitex y Audaces',
    'cómo exportar DXF desde Optitex',
    'exportar a DXF AAMA desde Audaces Moldes',
    'curvas convertidas en polígonos DXF',
    'unidades DXF pulgadas centímetros',
    'piquetes DXF AAMA',
  ],
};
