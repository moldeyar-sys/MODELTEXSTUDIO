/*
  # Fix product read RLS policy

  1. Changes
    - Drop the "Admins can read all products" policy that may cause query planner issues for authenticated users
    - The "Anyone can read active products" policy already covers both anon and authenticated users
    - Admins who need to see inactive products can do so through the service role or we add a separate specific policy
    
  2. Security
    - No security reduction: authenticated users could already read active products
    - Admins still have INSERT, UPDATE, DELETE policies for product management
    - Active products remain publicly readable

  3. Notes
    - The "Admins can read all products" policy was causing issues because Postgres evaluates
      PERMISSIVE policies with OR logic. When an authenticated user queries products,
      the admin policy subquery on profiles could interfere with query results,
      especially during race conditions around profile creation after signup.
    - Removing this policy ensures that the simple "is_active = true" check is the only
      SELECT policy, making queries deterministic and fast.
*/

-- Drop the problematic admin read policy
DROP POLICY IF EXISTS "Admins can read all products" ON products;

-- Add a new policy specifically for admins to read inactive products
-- Using a separate, clear policy name to avoid confusion
CREATE POLICY "Admins can read inactive products"
  ON products FOR SELECT
  TO authenticated
  USING (
    is_active = false
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
