export type CustomerType = 'emprendedor' | 'fabricante' | 'disenador' | 'taller' | 'otro';
export type UserRole = 'user' | 'admin';
export type PaymentMethod = 'mercadopago' | 'paypal' | 'stripe' | 'transfer' | 'binance';
export type PaymentStatus = 'pendiente' | 'pagado' | 'rechazado' | 'cancelado';
export type OrderStatus = 'pendiente' | 'entregado' | 'cancelado';
export type CustomRequestStatus = 'pendiente' | 'contactando' | 'en_proceso' | 'completado';
export type ProductCategory = 'dama' | 'hombre' | 'nina' | 'nino' | 'adultos-unisex' | 'ninos-unisex' | 'bebes';
export type FileType = 'pdf_a4' | 'pdf_plotter' | 'plt' | 'dxf' | 'cdr' | 'sublimacion' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  whatsapp: string;
  country: string;
  city: string;
  customer_type: CustomerType;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  price: number;
  sale_price: number | null;
  category: ProductCategory;
  garment_type: string;
  sizes: string[];
  formats: string[];
  recommended_fabrics: string[];
  // Formatos comerciales (opcionales: resilientes si la columna aún no existe)
  codigo?: string;
  precio_carton?: number | null;
  precio_pdf_a4?: number | null;
  precio_pdf_ploter?: number | null;
  disponible_carton?: boolean;
  disponible_pdf_a4?: boolean;
  mostrar_consulta_otro_formato?: boolean;
  main_image_url: string;
  gallery: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface ProductFile {
  id: string;
  product_id: string;
  file_name: string;
  file_url: string;
  file_type: FileType;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  price: number;
  quantity: number;
  product?: Product;
}

export interface Download {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export interface CustomRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  garment_type: string;
  sizes_needed: string;
  format_required: string;
  comments: string;
  status: CustomRequestStatus;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Formato comercial elegido (ej: "Moldes en Cartón"). Si falta, se usa el precio base. */
  format?: string;
  /** Precio unitario del formato elegido. Si falta, cae al precio del producto. */
  unitPrice?: number;
}

export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'dama', label: 'Dama' },
  { value: 'hombre', label: 'Hombre' },
  { value: 'nina', label: 'Niña' },
  { value: 'nino', label: 'Niño' },
  { value: 'adultos-unisex', label: 'Adultos unisex' },
  { value: 'ninos-unisex', label: 'Niños unisex' },
  { value: 'bebes', label: 'Bebés' },
];

export const FORMATS = ['PDF A4', 'PDF Plotter', 'PLT', 'DXF', 'CDR', 'Sublimación'];

// Grupos de talles listos para cargar de una con un clic (en el panel admin).
export const SIZE_GROUPS: { label: string; sizes: string[] }[] = [
  { label: 'Bebés (1 a 9)', sizes: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  { label: 'Niños / Niñas (2 a 18)', sizes: ['2', '4', '6', '8', '10', '12', '14', '16', '18'] },
  { label: 'Adultos (XS a 4XL)', sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] },
  { label: 'S a 2XL', sizes: ['S', 'M', 'L', 'XL', '2XL'] },
  { label: '4 a 16', sizes: ['4', '6', '8', '10', '12', '14', '16'] },
];

// Telas recomendadas sugeridas (se pueden agregar manualmente otras).
export const FABRICS = [
  'Algodón', 'Frisa', 'Rústico', 'Morley', 'Modal', 'Lycra', 'Jersey',
  'Piqué', 'Gabardina', 'Jean / Denim', 'Polar', 'Lanilla', 'Bengalina',
  'Microfibra deportiva', 'Sublimable', 'Toalla', 'Polerón',
];

// ==================== MOLDES GRATIS ====================
// Archivo descargable gratuito (vive en el bucket PUBLICO 'free-files').
export interface FreeMoldFile {
  label: string; // formato visible: "PDF A4", "Plotter", "DXF"...
  name: string;  // nombre del archivo
  url: string;   // URL publica de descarga
}

export interface FreeMold {
  id: string;
  title: string;
  code: string;
  category: string;
  product_type: string;
  fabric_recommendation: string;
  sizes: string[];
  formats: string[];
  tags: string[];
  season: string;
  image_url: string;
  files: FreeMoldFile[];
  description: string;
  is_active: boolean;
  sort_order: number;
  download_count: number;
  created_at: string;
}

export const FREE_MOLD_TAGS = [
  'Gratis', 'Aprobado', 'Para probar', 'PDF A4', 'Plotter', 'Digital',
  'Principiante', 'Producción', 'Verano', 'Invierno', 'Todo el año',
];

// ==================== CONTACTO ====================
export interface ContactMessage {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: 'emprendedor', label: 'Emprendedor' },
  { value: 'fabricante', label: 'Fabricante' },
  { value: 'disenador', label: 'Diseñador' },
  { value: 'taller', label: 'Taller textil' },
  { value: 'otro', label: 'Otro' },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'mercadopago', label: 'Mercado Pago', description: 'Pagá con Mercado Pago de forma segura' },
  { value: 'paypal', label: 'PayPal', description: 'Pagá con PayPal desde cualquier país' },
  { value: 'stripe', label: 'Tarjeta de crédito/débito', description: 'Pagá con tarjeta a través de Stripe' },
  { value: 'transfer', label: 'Transferencia bancaria', description: 'Transferí al alias MOLDEY.DIGITAL y confirmá tu pago' },
  { value: 'binance', label: 'Binance / Criptomonedas', description: 'Pagá con criptomonedas a través de Binance' },
];
