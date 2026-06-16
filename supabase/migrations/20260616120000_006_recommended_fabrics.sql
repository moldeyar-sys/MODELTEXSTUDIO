/*
  006_recommended_fabrics
  Agrega la columna de telas recomendadas a los productos.
  Es un arreglo de texto (cada tela un item), igual que sizes/formats.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS recommended_fabrics text[] DEFAULT '{}';
