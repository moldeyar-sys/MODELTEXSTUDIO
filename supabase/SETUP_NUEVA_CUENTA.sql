/*
  ============================================================
  MOLDEY GLOBAL - SETUP COMPLETO PARA CUENTA NUEVA DE SUPABASE
  ============================================================
  Ejecutar UNA sola vez en: Dashboard -> SQL Editor -> New query -> Run.
  Este script ya incluye TODAS las correcciones (sin recursion RLS y con
  el formulario de "Diseno a pedido" habilitado para visitantes anonimos).
  Equivale a correr las migraciones 001 + 002 + 003 juntas, en su estado final.
  Es idempotente: se puede volver a ejecutar sin romper nada.
*/

-- ==================== PROFILES ====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL DEFAULT '',
  full_name text DEFAULT '',
  whatsapp text DEFAULT '',
  country text DEFAULT '',
  city text DEFAULT '',
  customer_type text DEFAULT 'otro',
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin helper: SECURITY DEFINER evita la recursion en las policies de profiles.
-- Se crea DESPUES de la tabla profiles porque una funcion LANGUAGE sql valida
-- su cuerpo contra los objetos existentes al momento de crearse.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (public.is_admin());

-- ==================== PRODUCTS ====================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text DEFAULT '',
  long_description text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  sale_price numeric,
  category text DEFAULT 'dama',
  garment_type text DEFAULT '',
  sizes text[] DEFAULT '{}',
  formats text[] DEFAULT '{}',
  main_image_url text DEFAULT '',
  gallery text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active products" ON products;
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can read inactive products" ON products;
CREATE POLICY "Admins can read inactive products"
  ON products FOR SELECT TO authenticated
  USING (is_active = false AND public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE TO authenticated
  USING (public.is_admin());

-- ==================== ORDERS ====================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  total numeric NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'transfer',
  payment_status text DEFAULT 'pendiente',
  order_status text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==================== ORDER ITEMS ====================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity integer DEFAULT 1
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;
CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT TO authenticated
  USING (public.is_admin());

-- ==================== PRODUCT FILES ====================
CREATE TABLE IF NOT EXISTS product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  file_name text NOT NULL DEFAULT '',
  file_url text NOT NULL DEFAULT '',
  file_type text DEFAULT 'pdf_a4',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read files of purchased products" ON product_files;
CREATE POLICY "Users can read files of purchased products"
  ON product_files FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE oi.product_id = product_files.product_id
      AND o.user_id = auth.uid()
      AND o.payment_status = 'pagado'
    )
  );

DROP POLICY IF EXISTS "Admins can read product files" ON product_files;
CREATE POLICY "Admins can read product files"
  ON product_files FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert product files" ON product_files;
CREATE POLICY "Admins can insert product files"
  ON product_files FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update product files" ON product_files;
CREATE POLICY "Admins can update product files"
  ON product_files FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product files" ON product_files;
CREATE POLICY "Admins can delete product files"
  ON product_files FOR DELETE TO authenticated
  USING (public.is_admin());

-- ==================== DOWNLOADS ====================
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  file_url text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own downloads" ON downloads;
CREATE POLICY "Users can read own downloads"
  ON downloads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own downloads" ON downloads;
CREATE POLICY "Users can insert own downloads"
  ON downloads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all downloads" ON downloads;
CREATE POLICY "Admins can read all downloads"
  ON downloads FOR SELECT TO authenticated
  USING (public.is_admin());

-- ==================== CUSTOM REQUESTS ====================
CREATE TABLE IF NOT EXISTS custom_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  whatsapp text DEFAULT '',
  country text DEFAULT '',
  garment_type text DEFAULT '',
  sizes_needed text DEFAULT '',
  format_required text DEFAULT '',
  comments text DEFAULT '',
  status text DEFAULT 'pendiente',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guests can insert custom requests" ON custom_requests;
CREATE POLICY "Guests can insert custom requests"
  ON custom_requests FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own custom requests" ON custom_requests;
CREATE POLICY "Users can insert own custom requests"
  ON custom_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own custom requests" ON custom_requests;
CREATE POLICY "Users can read own custom requests"
  ON custom_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all custom requests" ON custom_requests;
CREATE POLICY "Admins can read all custom requests"
  ON custom_requests FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update custom requests" ON custom_requests;
CREATE POLICY "Admins can update custom requests"
  ON custom_requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_files_product_id ON product_files(product_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON custom_requests(status);

-- ==================== TRIGGER: crea profile automaticamente al registrarse ====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- LISTO. Despues de ejecutar esto:
-- 1. Registrate en la app (o en Authentication -> Users del dashboard).
-- 2. Convertite en admin con (reemplaza el email):
--      UPDATE public.profiles SET role = 'admin' WHERE email = 'tu-email@ejemplo.com';
-- ============================================================
