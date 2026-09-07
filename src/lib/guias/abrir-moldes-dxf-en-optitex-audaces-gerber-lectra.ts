import type { Guia } from '../guiasTypes';

export const guia: Guia = {
  slug: 'abrir-moldes-dxf-en-optitex-audaces-gerber-lectra',
  title: 'Cómo abrir un molde DXF/AAMA en Optitex, Audaces, Gerber y Lectra',
  seoTitle: 'Abrir moldes DXF/AAMA en Optitex, Audaces, Gerber',
  description:
    'Cómo importar un molde DXF/AAMA en Optitex, Audaces, Gerber AccuMark y Lectra Modaris: unidades, escala, capas, piquetes, márgenes y cómo verificar medidas.',
  intro:
    'Un DXF/AAMA no se abre con Abrir sino con la función de importación de cada programa: Archivo > Importar > DXF en Optitex y en Audaces Moldes, la utilidad de conversión (Data Conversion Utility o Importar/Exportar, según versión) en Gerber AccuMark, y Archivo > Importar en Lectra Modaris. En los cuatro lo que define el resultado es lo mismo: elegir la unidad correcta (centímetros, milímetros o pulgadas), no aplicar ninguna escala, mapear bien las capas de piquetes y sentido de hilo, y medir una pieza contra la ficha técnica antes de cortar.',
  sections: [
    {
      h2: 'Qué trae un archivo DXF/AAMA',
      paragraphs: [
        'DXF/AAMA es el formato de intercambio de moldería definido por la norma ASTM D6673 (heredera de la AAMA-292). Es un DXF común, pero con una convención: cada tipo de información va en una capa numerada. Las más usadas son la 1 para el contorno de la pieza, la 4 para piquetes, la 7 para el sentido de hilo, la 8 para líneas internas, la 13 para perforaciones, la 14 para la línea de costura y la 15 para textos, entre otras.',
        'Los talles pueden venir de dos maneras: todos escalados dentro del mismo DXF (cada talle como un bloque, lo que los programas llaman nido o graded nest) o solo el talle base más un archivo .rul con las reglas de escalado. Si te llega un .rul junto con el DXF, tenés que importarlos juntos o el molde entra en un solo talle.',
        'Lo que un DXF no garantiza es la unidad. El archivo puede estar en pulgadas, milímetros o centímetros según el sistema que lo exportó, y el programa que lo recibe no siempre lo detecta. Por eso lo primero que le pedís al proveedor es la unidad y si el contorno incluye o no el margen de costura.',
      ],
    },
    {
      h2: 'Optitex: Archivo > Importar > DXF',
      paragraphs: [
        'En Optitex PDS (también en las versiones O/Dev) abrís el cuadro de importación desde Archivo > Importar > DXF, o desde Abrir eligiendo el tipo de archivo DXF, que muestra el mismo cuadro. Antes de aceptar, fijá la unidad del archivo de origen (no la de tu configuración), marcá la opción de importar los talles escalados o de leer el archivo .rul si existe, y revisá la tabla de capas AAMA para que la capa 4 entre como piquetes y la 7 como sentido de hilo.',
        'Después de importar, abrí las propiedades de una pieza para confirmar que tiene todos los talles de la curva y que el talle base es el que figura en la ficha. Con la herramienta de medir tomá una medida conocida, por ejemplo el ancho de pecho del delantero en el talle base, y compará con la tabla. Si los contornos entraron abiertos, activá la opción de cerrar contornos en la importación o corregí los puntos duplicados.',
        'Si el molde ya trae el margen de costura en el contorno, no vuelvas a aplicarlo con la herramienta de márgenes. Si preferís trabajar con la línea de costura como contorno, importá la capa 14 como línea principal y regenerá el margen desde ahí.',
      ],
    },
    {
      h2: 'Audaces Moldes: Archivo > Importar > DXF',
      paragraphs: [
        'En Audaces Moldes la ruta es Archivo > Importar y elegir DXF (o el asistente de importación AAMA, según versión). El cuadro pide la unidad de medida y muestra el mapeo de capas: confirmá que el contorno, los piquetes, el sentido de hilo y las líneas internas apunten a las capas correctas. Audaces trabaja en centímetros por defecto, así que si el DXF viene en pulgadas hay que indicarlo ahí; si no, las piezas entran 2,54 veces más chicas.',
        'Una vez importado, revisá la tabla de talles para ver que la curva esté completa y que los nombres coincidan con la ficha. Medí una pieza con la herramienta de medir y verificá que los piquetes tengan tipo y profundidad asignados; si entraron como trazos, convertilos con la herramienta de piquetes.',
        'Para tizar en el módulo de tizada de Audaces (Encaixe o Marker, según versión) las piezas necesitan cantidad, tela y permiso de rotación definidos en propiedades. El DXF no siempre trae esos datos, así que cargalos antes de mandar el modelo a la tizada.',
      ],
    },
    {
      h2: 'Gerber AccuMark y Lectra Modaris',
      paragraphs: [
        'En Gerber AccuMark el DXF no se abre desde PDS: se convierte a piezas de un área de almacenamiento con la utilidad de conversión (Data Conversion Utility o Importar/Exportar, según versión) desde AccuMark Explorer. Antes de convertir, revisá la tabla de entorno de usuario para que la unidad sea métrica si el archivo viene en centímetros, y la tabla de opciones de importación, donde se asignan las capas AAMA y la tabla de reglas de escalado. Los nombres de pieza largos o con caracteres especiales pueden truncarse; renombrá si hace falta.',
        'En Lectra Modaris la importación está en Archivo > Importar (en algunas licencias requiere el módulo de interoperabilidad). Modaris pregunta la unidad del archivo y arma un modelo con las piezas; después revisá en la tabla de talles que la curva entró completa y con el talle base correcto. Las tizadas se hacen luego en Diamino, que toma el modelo con las cantidades por talle.',
        'En los dos sistemas vale la misma verificación que en Optitex y Audaces: medir una pieza conocida en el talle base, comparar el largo de dos costuras que se unen (lateral del delantero contra lateral del trasero, por ejemplo) y confirmar que los piquetes están donde la ficha los marca.',
      ],
    },
    {
      h2: 'Piquetes, aplomos, sentido de hilo y márgenes',
      paragraphs: [
        'Los piquetes (o aplomos) son lo que más se pierde en un intercambio. En el estándar viajan en la capa 4 como marcas con tipo (en V, recto, en T, en U) y profundidad, pero muchos exportadores los mandan como pequeñas líneas en la capa 8. Si al importar ves rayitas sueltas en vez de piquetes, convertilas con la herramienta de piquetes de tu programa y fijá una profundidad de 3 a 5 mm, que es lo habitual (orientativo; en telas que se deshilachan conviene el mínimo).',
        'El sentido de hilo entra por la capa 7 como una línea con dirección. Si falta, definilo antes de tizar: sin sentido de hilo el programa de tizada puede rotar la pieza como quiera y arruinar la caída o el rapport. Con las piezas simétricas pasa algo parecido: algunos DXF traen la mitad con una línea de espejo (capa 6) y el programa tiene que desplegarla; otros traen la pieza completa.',
        'Con el margen de costura hay una sola regla: saber si el contorno lo incluye. Lo más común en un DXF de intercambio es que el contorno sea la línea de corte, con el margen ya sumado, y que la línea de costura vaya aparte en la capa 14 si el proveedor la exporta. Sumar un margen sobre un contorno que ya lo tenía es el error más caro, porque agranda la prenda uno o dos centímetros por costura y nadie lo nota hasta la muestra.',
      ],
    },
    {
      h2: 'Problemas típicos al importar',
      paragraphs: [
        'Casi todos los problemas se reconocen en los primeros diez minutos si medís. Estos son los más frecuentes y su causa.',
      ],
      bullets: [
        'Piezas 10 veces más grandes o más chicas: el archivo estaba en milímetros y se leyó en centímetros, o al revés. Reimportá con la unidad correcta en lugar de escalar.',
        'Piezas 2,54 veces más grandes o más chicas: confusión entre pulgadas y centímetros. Misma solución.',
        'Un solo talle en vez de la curva: el DXF vino con el talle base y las reglas en un .rul que no se importó, o no activaste la opción de importar escalado.',
        'Contornos abiertos o piezas que no se pueden tizar: puntos duplicados o un tramo que no cierra. Usá la opción de cerrar contorno o unir puntos con una tolerancia chica.',
        'Curvas convertidas en muchos tramos rectos: es normal, el DXF no guarda curvas como tales. Si vas a modificar el molde, reducí puntos; si solo vas a cortar, no hace falta.',
        'Textos ilegibles o ausentes: la capa 15 no siempre se respeta. No afecta el corte, pero renombrá las piezas con talle, tela y cantidad.',
        'Pieza espejada o dada vuelta: revisá la línea de espejo y el lado de la tela indicado en la ficha.',
      ],
    },
    {
      h2: 'Cómo verificar que importó bien antes de cortar',
      paragraphs: [
        'La verificación mínima lleva menos que cortar mal una capa. Primero, medí dos o tres medidas conocidas en el talle base contra la tabla de medidas del molde: ancho de pecho, largo total, largo de manga. Segundo, compará el largo de costuras que se unen: lateral delantero contra lateral trasero, cabeza de manga contra sisa (en tejido plano la manga suele llevar 1 a 2 cm de embebido; en jersey, prácticamente nada), cuello contra escote.',
        'Tercero, revisá que la curva progresa de forma consistente: los talles tienen que crecer en pasos parejos entre uno y el siguiente, sin saltos raros en el medio (un error típico de un .rul mal leído). Cuarto, contá piezas y cantidades por pieza y compará con la ficha: que falte una vista o un puño es un error de corte clásico.',
        'Si el molde va a una tirada grande, imprimí el talle base en plotter y hacé una muestra antes de tizar. Los DXF/AAMA de Modeltex se entregan con la curva de talles completa y con el molde ya aprobado con muestra, pero la muestra en tu tela y con tu costurera sigue siendo el control final. Si trabajás en Optitex o Audaces, podés pedir el archivo en PDS o ADS nativo, o directamente la tizada MRK a tu ancho de tela.',
      ],
    },
  ],
  faqs: [
    {
      q: '¿Por qué mi DXF se abre en Optitex con las piezas gigantes o minúsculas?',
      a: 'Es un problema de unidades. El DXF no siempre declara si está en pulgadas, milímetros o centímetros y el programa asume una. Si las piezas quedaron 2,54 veces más grandes o más chicas fue pulgadas contra centímetros; si el factor es 10, milímetros contra centímetros. Volvé a importar indicando la unidad correcta en el cuadro de importación; no escales las piezas después, porque el escalado por talle también quedaría mal.',
    },
    {
      q: '¿El archivo DXF/AAMA incluye todos los talles?',
      a: 'Depende de cómo se exportó. Puede traer todos los talles escalados dentro del mismo archivo (cada talle como un bloque) o solo el talle base con un archivo .rul de reglas de escalado que hay que importar junto con el DXF. Si después de importar ves un solo talle, revisá si te llegó un .rul o si no activaste la opción de importar escalado.',
    },
    {
      q: '¿Cómo sé si el molde DXF ya tiene el margen de costura?',
      a: 'Preguntándolo al proveedor y midiendo. En la mayoría de los DXF de intercambio el contorno es la línea de corte con el margen incluido, y la línea de costura, si viene, va en una capa aparte (la 14 en el estándar AAMA/ASTM). Si las dos líneas están, la distancia entre ambas te muestra el margen (en general 1 cm en costuras y 2 a 3 cm en dobladillos). Nunca agregues margen sin confirmarlo.',
    },
    {
      q: '¿Se pueden abrir moldes DXF en Gerber AccuMark?',
      a: 'Sí. AccuMark importa DXF AAMA/ASTM con su utilidad de conversión (Data Conversion Utility o Importar/Exportar, según versión) desde AccuMark Explorer, que convierte el archivo en piezas y un modelo dentro de un área de almacenamiento. Hay que fijar la unidad en la tabla de entorno de usuario y asignar las capas en las opciones de importación. Después se abren las piezas en PDS como cualquier molde propio.',
    },
    {
      q: '¿Qué hago si los piquetes se importaron como líneas sueltas?',
      a: 'Pasa cuando el exportador puso los piquetes en la capa de líneas internas (8) en vez de la capa de piquetes (4). Seleccioná esas marcas y convertilas con la herramienta de piquetes de tu programa, asignando tipo y profundidad (3 a 5 mm es lo habitual). Vale la pena hacerlo antes de tizar, porque la cortadora automática corta piquetes, no rayitas.',
    },
    {
      q: '¿Cómo verifico que un molde importado está a escala correcta?',
      a: 'Medí en el talle base dos o tres medidas conocidas (ancho de pecho, largo total, largo de manga) y compará con la tabla de medidas del molde. Después compará costuras que se unen, como el lateral del delantero con el del trasero: tienen que medir lo mismo salvo embebidos previstos. Si tenés dudas, imprimí una pieza en plotter al 100 por ciento y medila con cinta; el cuadro de control que traen los moldes en PDF es la prueba más rápida.',
    },
  ],
  related: [
    { label: 'Qué formato de molde conviene para tu taller', to: '/guias/formatos-de-molderia-digital' },
    { label: 'Qué es una tizada MRK y cómo ahorra tela', to: '/guias/tizada-computarizada-mrk' },
    { label: 'Glosario de moldería', to: '/guias/glosario-de-molderia' },
    { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
    { label: 'Contacto', to: '/contacto' },
  ],
  updated: '2026-09-06',
  keywords: [
    'importar DXF en Optitex',
    'abrir DXF AAMA en Audaces',
    'importar DXF Gerber AccuMark',
    'importar DXF Lectra Modaris',
    'molde DXF AAMA',
    'ASTM D6673',
    'capas AAMA piquetes',
    'unidades DXF pulgadas centímetros',
  ],
};
