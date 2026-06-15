export type CustomerType = 'emprendedor' | 'fabricante' | 'disenador' | 'taller' | 'otro';
export type UserRole = 'user' | 'admin';
export type PaymentMethod = 'mercadopago' | 'paypal' | 'stripe' | 'transfer' | 'binance';
export type PaymentStatus = 'pendiente' | 'pagado' | 'rechazado' | 'cancelado';
export type OrderStatus = 'pendiente' | 'entregado' | 'cancelado';
export type CustomRequestStatus = 'pendiente' | 'contactando' | 'en_proceso' | 'completado';
export type ProductCategory = 'hombre' | 'dama' | 'nino' | 'nina' | 'escolar' | 'deportivo' | 'invierno' | 'verano' | 'sublimacion' | 'packs' | 'diseno-pedido';
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
}

export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'hombre', label: 'Hombre' },
  { value: 'dama', label: 'Dama' },
  { value: 'nino', label: 'Niño' },
  { value: 'nina', label: 'Niña' },
  { value: 'escolar', label: 'Escolar' },
  { value: 'deportivo', label: 'Deportivo' },
  { value: 'invierno', label: 'Invierno' },
  { value: 'verano', label: 'Verano' },
  { value: 'sublimacion', label: 'Sublimación' },
  { value: 'packs', label: 'Packs' },
  { value: 'diseno-pedido', label: 'Diseño a pedido' },
];

export const FORMATS = ['PDF A4', 'PDF Plotter', 'PLT', 'DXF', 'CDR', 'Sublimación'];

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
