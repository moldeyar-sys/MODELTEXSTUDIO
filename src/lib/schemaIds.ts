// Convencion UNICA de identificadores para structured data (JSON-LD), usada
// tanto por middleware.ts (lo que reciben los bots antes de que corra React)
// como por cada pagina .tsx (lo que React vuelve a escribir al hidratar).
//
// Por que existe: useStructuredData (src/lib/seo.ts) solo evita duplicar un
// script si el `id` coincide EXACTO con uno que ya esta en <head>. Antes,
// cada lado inventaba sus propios ids por pagina ('moldes-pdf-faq' en
// middleware vs 'moldes-pdf-schema' en React agrupando otra cosa), asi que
// para un bot que ejecuta JavaScript (Googlebot lo hace) terminaban
// coexistiendo dos <script> del mismo tipo de schema, o uno de los dos
// desaparecia porque React lo pisaba con un id distinto sin limpiar el viejo.
//
// Regla: UN id por TIPO de schema (no por pagina), y cada tipo va en su
// propio <script>, nunca agrupado dentro del array de otro. Asi, sea cual
// sea la pagina, "el FAQPage de esta pagina" siempre vive en el mismo id
// tanto si lo escribio el middleware como si lo reescribio React.
export const SCHEMA_IDS = {
  breadcrumb: 'schema-breadcrumb',
  faq: 'schema-faq',
  collectionPage: 'schema-collection',
  itemList: 'schema-itemlist',
  article: 'schema-article',
  course: 'schema-course',
  definedTerm: 'schema-definedterm',
  product: 'schema-product',
  aggregateRating: 'schema-product', // va anidado DENTRO del Product, no es un script propio
  contactPage: 'schema-contactpage',
  howTo: 'schema-howto',
} as const;

export type SchemaIdKey = keyof typeof SCHEMA_IDS;
