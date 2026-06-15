/*
  SEED - Productos de ejemplo para Moldey
  Idempotente: ON CONFLICT (slug) DO NOTHING (se puede correr varias veces).
  Formatos usan los valores canonicos de FORMATS para que el filtro funcione.
*/
INSERT INTO public.products
  (name, slug, short_description, long_description, price, sale_price, category, garment_type, sizes, formats, main_image_url, gallery, is_active, is_featured)
VALUES
  (
    'Remera basica unisex', 'remera-basica-unisex',
    'Molde de remera unisex de corte recto, ideal para sublimacion y estampado.',
    'Molde profesional de remera basica unisex con cuello redondo y manga corta. Incluye todos los talles graduados y margenes de costura marcados. Perfecto para emprendimientos de indumentaria, sublimacion y produccion en serie.',
    3500, NULL, 'dama', 'Remera',
    ARRAY['XS','S','M','L','XL','XXL'],
    ARRAY['PDF A4','PDF Plotter','DXF','CDR'],
    'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800','https://images.pexels.com/photos/3735641/pexels-photo-3735641.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true
  ),
  (
    'Buzo canguro con capucha', 'buzo-canguro-capucha',
    'Molde de buzo canguro con bolsillo frontal y capucha forrada.',
    'Molde completo de buzo canguro unisex con capucha de dos paneles, bolsillo canguro y punos acanalados. Graduado en todos los talles. Ideal para temporada invierno y produccion de marcas streetwear.',
    5800, 4900, 'invierno', 'Buzo',
    ARRAY['S','M','L','XL','XXL'],
    ARRAY['PDF A4','PDF Plotter','PLT','DXF'],
    'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true
  ),
  (
    'Pantalon jogger deportivo', 'pantalon-jogger-deportivo',
    'Molde de jogger con punos, bolsillos laterales y cintura elastizada.',
    'Molde de pantalon jogger deportivo con tiro medio, bolsillos laterales, cordon y punos acanalados. Incluye guia de armado y todos los talles. Pensado para ropa deportiva y de descanso.',
    4800, NULL, 'deportivo', 'Pantalon',
    ARRAY['S','M','L','XL'],
    ARRAY['PDF A4','PDF Plotter','DXF','CDR'],
    'https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/5710082/pexels-photo-5710082.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, false
  ),
  (
    'Vestido de verano evase', 'vestido-verano-evase',
    'Molde de vestido evase sin mangas, fresco y femenino.',
    'Molde de vestido evase de verano con escote redondo, sin mangas y largo a la rodilla. Graduado en todos los talles femeninos. Ideal para telas livianas como lino, rayon y gasa.',
    5200, NULL, 'verano', 'Vestido',
    ARRAY['XS','S','M','L','XL'],
    ARRAY['PDF A4','PDF Plotter','CDR'],
    'https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true
  ),
  (
    'Conjunto escolar nino', 'conjunto-escolar-nino',
    'Molde de conjunto escolar: chomba y pantalon para nivel inicial y primario.',
    'Molde de conjunto escolar compuesto por chomba de pique y pantalon de gabardina. Graduado en talles infantiles. Pensado para uniformes y produccion escolar.',
    4200, NULL, 'escolar', 'Conjunto',
    ARRAY['4','6','8','10','12','14'],
    ARRAY['PDF A4','PDF Plotter','DXF'],
    'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, false
  ),
  (
    'Body de bebe manga larga', 'body-bebe-manga-larga',
    'Molde de body para bebe con broches y manga larga.',
    'Molde de body de bebe en algodon con manga larga, cuello americano y cierre de broches en la entrepierna. Graduado por meses de edad. Ideal para ropa de primera infancia.',
    2900, NULL, 'nina', 'Body',
    ARRAY['0-3m','3-6m','6-9m','9-12m','12-18m'],
    ARRAY['PDF A4','Sublimación','DXF'],
    'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, false
  ),
  (
    'Campera puffer inflable', 'campera-puffer-inflable',
    'Molde de campera puffer acolchada con capucha desmontable.',
    'Molde de campera puffer con canales para acolchado, cierre frontal, capucha desmontable y bolsillos. Graduado en todos los talles. Pensado para abrigos de invierno de alta gama.',
    7500, 6300, 'invierno', 'Campera',
    ARRAY['S','M','L','XL','XXL'],
    ARRAY['PDF Plotter','PLT','DXF','CDR'],
    'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true
  ),
  (
    'Pack 5 remeras basicas', 'pack-5-remeras-basicas',
    'Pack de 5 moldes de remera: cuello redondo, V, oversize, crop y manga larga.',
    'Pack ahorro con 5 moldes de remera en distintos calces: clasica cuello redondo, escote en V, oversize, crop top y manga larga. Todos graduados en todos los talles. La mejor relacion costo-beneficio para arrancar tu marca.',
    9900, 7900, 'packs', 'Pack',
    ARRAY['XS','S','M','L','XL','XXL'],
    ARRAY['PDF A4','PDF Plotter','DXF','CDR'],
    'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true
  ),
  (
    'Musculosa deportiva dry-fit', 'musculosa-deportiva-dryfit',
    'Molde de musculosa deportiva de calce ajustado para entrenamiento.',
    'Molde de musculosa deportiva con sisa amplia y calce ajustado, pensada para telas tecnicas dry-fit. Graduada en todos los talles. Ideal para indumentaria fitness y running.',
    3200, NULL, 'deportivo', 'Musculosa',
    ARRAY['S','M','L','XL'],
    ARRAY['PDF A4','Sublimación','DXF'],
    'https://images.pexels.com/photos/6069552/pexels-photo-6069552.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/6069552/pexels-photo-6069552.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, false
  ),
  (
    'Camisa de hombre clasica', 'camisa-hombre-clasica',
    'Molde de camisa de hombre con cuello, puno y canesu.',
    'Molde de camisa de hombre de corte clasico con cuello camisero, puno con boton, canesu trasero y tabla de botones. Graduado en todos los talles. Ideal para indumentaria formal y casual.',
    5600, NULL, 'hombre', 'Camisa',
    ARRAY['S','M','L','XL','XXL'],
    ARRAY['PDF A4','PDF Plotter','PLT','DXF','CDR'],
    'https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=800',
    ARRAY['https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, false
  )
ON CONFLICT (slug) DO NOTHING;
