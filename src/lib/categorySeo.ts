// Textos SEO por categoria compartidos entre la app (CatalogPage,
// ProductDetailPage) y middleware.ts (lo que ven Google y los bots de IA):
// los dos tienen que decir exactamente lo mismo. Claves = CATEGORIES.value.

/** "molde digital para dama", "moldes unisex para niños"... */
export const CATEGORY_TITLE_SUFFIX: Record<string, string> = {
  dama: 'para dama',
  hombre: 'para hombre',
  nina: 'para niña',
  nino: 'para niño',
  bebes: 'para bebés',
  'adultos-unisex': 'unisex para adultos',
  'ninos-unisex': 'unisex para niños',
};

export const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  dama: {
    title: 'Moldes de ropa para dama',
    description:
      'Más de 1.400 moldes de ropa de dama: vestidos, blusas, tops, shorts, calzas, buzos, camperas, abrigos y blazers. Curva XS a 4XL incluida, en PDF A4, plotter y CAD. Descarga inmediata.',
  },
  hombre: {
    title: 'Moldes de ropa para hombre',
    description:
      'Moldes de ropa de hombre: remeras, chombas, buzos, joggers, shorts, camisas, camperas y pantalones. Talles XS a 4XL incluidos, en PDF A4, plotter y formatos CAD. Descarga inmediata.',
  },
  nina: {
    title: 'Moldes de ropa para niña',
    description:
      'Moldes de ropa de niña: vestidos, tops, faldas, shorts, calzas, buzos y blazers. Talles 2 a 18 incluidos, en PDF A4, plotter y formatos CAD. Descarga inmediata.',
  },
  nino: {
    title: 'Moldes de ropa para niño',
    description:
      'Moldes de ropa de niño: remeras, buzos, joggers, shorts, pijamas y blazers. Talles 2 a 18 incluidos, en PDF A4, plotter y formatos CAD. Descarga inmediata.',
  },
  bebes: {
    title: 'Moldes de ropa para bebés',
    description:
      'Moldes de ropa para bebés: bodies y prendas de bebé con todos los talles incluidos, en PDF A4, plotter y formatos CAD. Descarga inmediata.',
  },
  'adultos-unisex': {
    title: 'Moldes de ropa unisex para adultos',
    description:
      'Moldes unisex para adultos: camperas deportivas, buzos y remeras que sirven para dama y hombre. Todos los talles incluidos, en PDF A4, plotter y CAD.',
  },
  'ninos-unisex': {
    title: 'Moldes de ropa unisex para niños',
    description:
      'Moldes unisex infantiles: buzos, remeras, camperas, shorts escolares y blazers para niña y niño. Todos los talles incluidos, en PDF A4, plotter y CAD.',
  },
};
