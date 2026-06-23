import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem, Product } from '../lib/types';

interface AddOptions {
  format?: string;
  unitPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, opts?: AddOptions) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
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
    const key = `${product.id}|${format ?? ''}`;
    setItems(prev => {
      const existing = prev.find(i => cartItemKey(i) === key);
      if (existing) {
        return prev.map(i => (cartItemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1, format, unitPrice }];
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

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + cartUnitPrice(i) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
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
