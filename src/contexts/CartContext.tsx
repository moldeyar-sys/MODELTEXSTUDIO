import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Product } from '../lib/types';
import { trackAddToCart } from '../lib/analytics';

interface AddOptions {
  format?: string;
  unitPrice?: number;
  sizes?: string[];
  /** Moneda real de unitPrice ('ARS' por defecto si no se especifica). */
  currency?: 'ARS' | 'USD';
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, opts?: AddOptions) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateSizes: (key: string, sizes: string[], unitPrice: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'modeltex_cart';

/** Clave única por producto + formato (mismo producto en 2 formatos = 2 líneas). */
export function cartItemKey(i: { product: Product; format?: string }): string {
  return `${i.product.id}|${i.format ?? ''}`;
}

/** Precio unitario efectivo de un ítem (formato elegido o precio base). */
export function cartUnitPrice(i: CartItem): number {
  return i.unitPrice ?? (i.product.sale_price ?? i.product.price);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, opts?: AddOptions) => {
    const format = opts?.format;
    const unitPrice = opts?.unitPrice;
    const sizes = opts?.sizes;
    const currency = opts?.currency ?? 'ARS';
    const key = `${product.id}|${format ?? ''}`;
    trackAddToCart({ id: product.id, name: product.name, category: product.category, price: unitPrice ?? product.sale_price ?? product.price, format });
    setItems(prev => {
      // Un carrito no puede mezclar ARS y USD: el total se calcula sumando
      // unitPrice de todos los ítems sin distinguir moneda, así que mezclar
      // daba una suma sin sentido (pesos + dólares como si fueran lo mismo).
      // Esto solo puede pasar si cambia el país detectado a mitad de sesión
      // (VPN, o /api/geo que tarda): se vacía el carrito viejo antes de
      // agregar el nuevo ítem, en vez de sumarlo a una moneda distinta.
      const base = prev.length && prev[0].currency && prev[0].currency !== currency ? [] : prev;
      const existing = base.find(i => cartItemKey(i) === key);
      if (existing) {
        // Al re-agregar el mismo producto+formato, actualiza talles y suma cantidad
        return base.map(i => (cartItemKey(i) === key ? { ...i, quantity: i.quantity + 1, sizes } : i));
      }
      return [...base, { product, quantity: 1, format, unitPrice, sizes, currency }];
    });
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => cartItemKey(i) !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(key);
      return;
    }
    setItems(prev => prev.map(i => (cartItemKey(i) === key ? { ...i, quantity } : i)));
  };

  const updateSizes = (key: string, sizes: string[], unitPrice: number) => {
    setItems(prev => prev.map(i =>
      cartItemKey(i) === key ? { ...i, sizes, unitPrice } : i
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + cartUnitPrice(i) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, updateSizes, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
