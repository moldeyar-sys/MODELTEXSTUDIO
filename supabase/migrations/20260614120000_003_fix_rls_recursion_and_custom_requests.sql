/*
  # Fix RLS infinite recursion on profiles + allow anonymous custom requests

  ## Problem 1 — Infinite recursion (CRITICAL)
  Several admin policies checked the admin role with:
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  When that subquery runs against `profiles`, Postgres re-evaluates the
  `profiles` SELECT policies (which include the admin check above), causing
  error 42P17 "infinite recursion detected in policy for relation profiles".
  This broke profile loading on login and made the whole admin panel unusable.

  ## Fix
  - Introduce a SECURITY DEFINER helper `public.is_admin()`. Because it runs
    with the privileges of its owner (the table owner), the SELECT inside it
    bypasses RLS and therefore never re-triggers the `profiles` policies → no
    recursion. This is the recommended Supabase pattern.
  - Replace every admin policy that subqueried `profiles` so it calls
    `public.is_admin()` instead. Behaviour is identical, just non-recursive
    and faster/deterministic.

  ## Problem 2 — Public "Diseño a pedido" form fails for guests
  `custom_requests` only had an INSERT policy for `authenticated` users with
  `user_id = auth.uid()`, but the form route is public. Anonymous visitors
  could never submit.

  ## Fix
  - Allow `anon` to INSERT only with `user_id IS NULL` (guest request).
  - Allow `authenticated` to INSERT only with `user_id = auth.uid()`.
  - Reading stays restricted: guests cannot read, users read only their own,
    admins read all (unchanged).

  ## Security notes
  - No reduction in security: each user still reads only their own rows;
    admins keep full access; active products remain publicly readable.
  - `is_admin()` is granted EXECUTE to anon/authenticated but only ever
    returns true for an authenticated user whose profile role is 'admin'.
*/

-- ==================== ADMIN HELPER (SECURITY DEFINER, no recursion) ====================
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

-- ==================== PROFILES ====================
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ==================== PRODUCTS ====================
DROP POLICY IF EXISTS "Admins can read inactive products" ON products;
CREATE POLICY "Admins can read inactive products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = false AND public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==================== ORDERS ====================
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==================== ORDER ITEMS ====================
DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;
CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ==================== PRODUCT FILES ====================
DROP POLICY IF EXISTS "Admins can read product files" ON product_files;
CREATE POLICY "Admins can read product files"
  ON product_files FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert product files" ON product_files;
CREATE POLICY "Admins can insert product files"
  ON product_files FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update product files" ON product_files;
CREATE POLICY "Admins can update product files"
  ON product_files FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product files" ON product_files;
CREATE POLICY "Admins can delete product files"
  ON product_files FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ==================== DOWNLOADS ====================
DROP POLICY IF EXISTS "Admins can read all downloads" ON downloads;
CREATE POLICY "Admins can read all downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ==================== CUSTOM REQUESTS ====================
-- Replace the authenticated-only INSERT policy with two explicit policies
-- so anonymous visitors can submit the public "Diseño a pedido" form.
DROP POLICY IF EXISTS "Users can insert custom requests" ON custom_requests;

CREATE POLICY "Guests can insert custom requests"
  ON custom_requests FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can insert own custom requests"
  ON custom_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Reading policies recreated to drop the recursive profiles subquery.
DROP POLICY IF EXISTS "Admins can read all custom requests" ON custom_requests;
CREATE POLICY "Admins can read all custom requests"
  ON custom_requests FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update custom requests" ON custom_requests;
CREATE POLICY "Admins can update custom requests"
  ON custom_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
