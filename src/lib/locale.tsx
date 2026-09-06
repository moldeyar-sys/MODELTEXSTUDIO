import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'es' | 'en';
export type Currency = 'ARS' | 'USD';

const LANG_KEY = 'modeltex_lang';
const CURRENCY_KEY = 'modeltex_currency';
const CURRENCY_CHOSEN_KEY = 'modeltex_currency_chosen'; // '1' si el usuario eligió a mano
const FALLBACK_ARS_PER_USD = 1450; // tasa de respaldo si falla la API

// Diccionario solo para inglés. Si falta la clave (o el idioma es 'es'),
// se usa el texto en español que se pasa como fallback en t(key, es).
const EN: Record<string, string> = {
  'nav.home': 'Home',
  'nav.catalog': 'Catalog',
  'nav.custom': 'Custom design',
  'nav.iaTextil': 'Textile AI',
  'nav.freeMolds': 'Free Patterns',
  'nav.contact': 'Contact',
  'nav.signin': 'Sign in',
  'nav.register': 'Create account',
  'nav.myaccount': 'My account',
  'nav.profile': 'My profile',
  'nav.orders': 'My orders',
  'nav.downloads': 'My downloads',
  'nav.admin': 'Admin panel',
  'nav.logout': 'Log out',

  'common.addToCart': 'Add to cart',
  'common.added': 'Added',
  'common.add': 'Add',
  'common.buy': 'Buy',
  'common.consult': 'Ask us',
  'common.close': 'Close',
  'common.viewCatalog': 'View catalog',
  'common.offer': 'SALE',
  'common.noImage': 'No image',

  // Categorías (se usan como t(`cat.${value}`, label))
  'cat.dama': 'Women',
  'cat.hombre': 'Men',
  'cat.nina': 'Girls',
  'cat.nino': 'Boys',
  'cat.bebes': 'Babies',
  'cat.adultos-unisex': 'Adults unisex',
  'cat.ninos-unisex': 'Kids unisex',

  'cart.emptyTitle': 'Your cart is empty',
  'cart.emptySubtitle': 'Browse our catalog and find the patterns you need',
  'cart.keepShopping': 'Keep shopping',
  'cart.title': 'Shopping cart',
  'cart.summary': 'Order summary',
  'cart.total': 'Total',
  'cart.checkout': 'Go to checkout',
  'cart.clear': 'Empty cart',

  'footer.tagline': 'Professional digital sewing patterns ready to print and produce. Digital store for manufacturers, entrepreneurs and designers.',
  'footer.location': 'Argentina - Digital delivery worldwide',
  'footer.categories': 'Categories',
  'footer.formats': 'Available formats',
  'footer.fullCatalog': 'Full catalog',
  'footer.packs': 'Pattern packs',
  'footer.rights': 'All rights reserved.',

  'home.hero.badge': '18+ years in the textile industry',
  'home.hero.title': 'Professional textile patternmaking for apparel manufacturers',
  'home.hero.subtitle': 'Digital and cardboard patterns, custom patternmaking and computerized marker making. Industrial precision, full grading and fast delivery so you produce without delays.',
  'home.featured.title': 'Featured products',
  'home.featured.subtitle': 'Discover our most popular patterns and bestsellers',
  'home.featured.viewAll': 'View full catalog',
  'home.featured.empty': 'No featured products right now',
  'home.testimonials.title': 'What our customers say',
  'home.testimonials.subtitle': 'Entrepreneurs, workshops, designers and apparel factories worldwide already produce with Modeltex',
  'home.cta.title': 'Ready to get started?',
  'home.visual.title': 'Professional digital patternmaking',
  'home.visual.subtitle': 'Graded industrial patterns, ready to produce',
  'home.visual.cta': 'Instant download after payment',
  'trust.title': 'Shop with confidence',
  'trust.subtitle': 'Digital patterns for entrepreneurs, workshops and apparel manufacturers worldwide',
  'trust.instant.title': 'Instant download',
  'trust.instant.desc': 'As soon as payment is confirmed, you access your files from your account.',
  'trust.pro.title': 'Professional files',
  'trust.pro.desc': 'Patterns graded in every size, ready to print and produce.',
  'trust.support.title': 'After-sale support',
  'trust.support.desc': 'We help you over WhatsApp with printing and using the patterns.',
  'trust.secure.title': 'Secure checkout',
  'trust.secure.desc': 'Your data and payment protected. Shop with peace of mind.',
  'trust.worldwide': 'Digital delivery worldwide',
  'trust.formats': 'PDF A4, Plotter, DXF/AAMA, PDS (Optitex), MRK, ADS (Audaces), CDR and PLT',
  'trust.access': 'Permanent access from your account',
  'catalog.empty.filtered.title': 'No patterns match those filters',
  'catalog.empty.filtered.desc': 'Try another category or format, or browse the full catalog.',
  'catalog.empty.filtered.cta': 'View full catalog',
  'catalog.empty.none.title': 'New patterns coming soon',
  'catalog.empty.none.desc': 'We are expanding the catalog. Need a specific pattern? Request it and we make it for you.',
  'catalog.empty.none.cta': 'Request a custom pattern',
  'product.whatsapp': 'Ask on WhatsApp',

  // ── Catálogo ──
  'catalog.title': 'Sample-approved sewing patterns',
  'catalog.loading': 'Loading catalog...',
  'catalog.readyOne': 'pattern ready to produce',
  'catalog.readyMany': 'patterns ready to produce',
  'catalog.clear': 'Clear filters',
  'catalog.searchPlaceholder': 'Search pattern, garment, use or format',
  'catalog.searchBtn': 'Search',
  'catalog.understanding': 'Detected:',
  'catalog.understandingFallback': 'searching by name, description and format.',
  'catalog.correcting': 'Correcting search to:',
  'catalog.liveSuggestions': 'Live suggestions',
  'catalog.suggestedHint': 'Suggested search',
  'catalog.smartPrefix': 'Smart search:',
  'catalog.smartBody': 'prioritizing',
  'catalog.filters': 'Filters',
  'catalog.filterBy': 'Filter by',
  'catalog.filterHint': 'Narrow the catalog by category, format or priority.',
  'catalog.category': 'Category',
  'catalog.allCategories': 'All categories',
  'catalog.format': 'Format',
  'catalog.allFormats': 'All formats',
  'catalog.sortBy': 'Sort by',
  'catalog.sort.reciente': 'Mixed',
  'catalog.sort.precio_asc': 'Price: low to high',
  'catalog.sort.precio_desc': 'Price: high to low',
  'catalog.sort.nombre': 'Name A-Z',
  'catalog.season.todas': 'All',
  'catalog.season.verano': 'Summer',
  'catalog.season.invierno': 'Winter',
  'catalog.season.todo-el-anio': 'All year',
  'catalog.all': 'All',
  'catalog.allProducts': 'All products',
  'catalog.showing': 'Showing',
  'catalog.results': 'results',
  'catalog.in': 'in',
  'catalog.for': 'for',
  'catalog.currentSort': 'Sorted by:',
  'catalog.chipCategory': 'Category:',
  'catalog.chipSeason': 'Season:',
  'catalog.chipFormat': 'Format:',
  'catalog.chipSearch': 'Search:',

  // ── Tarjeta de producto ──
  'card.instant': 'Instant download',
  'card.size': 'size',
  'card.sizes': 'sizes',
  'card.formats': 'formats',
  'card.chooseFormat': 'Choose a format',
  'card.code': 'Code',

  // ── Carrito ──
  'cart.tapToToggle': 'tap to add or remove',
  'cart.minOne': 'Minimum 1 size',
  'cart.removeSize': 'Remove size',
  'cart.addSize': 'Add size',

  // ── Opciones de formato (ficha / modal de compra) ──
  'fmt.delivery': 'Instant download after payment',
  'fmt.orderSizes': 'Sizes in this order',
  'fmt.selectOne': 'Select at least 1',
  'fmt.sizeHint': 'Blue = included · tap to add or remove · price adjusts automatically',
  'fmt.sizeWarn': '⚠ Select at least one size to add to cart.',
  'fmt.selectSizeTitle': 'Select at least one size',
  'fmt.carton': 'Cardboard patterns',
  'fmt.argOnly': 'Argentina only',
  'fmt.pdfA4': 'PDF-A4 patterns',
  'fmt.global': 'Worldwide',
  'fmt.ploter': 'Plotter PDF patterns',
  'fmt.chooseWidth': 'Choose the width',
  'fmt.ploterWord': 'Plotter',
  'fmt.industrial': 'Industrial formats (CAD)',
  'fmt.industrialHint': 'Native files for factories and pattern-making departments. Full graded size set included.',
  'fmt.fullSet': 'Full graded size set',
  'fmt.dxf.detail': 'Universal CAD standard (Gerber, Lectra, Optitex, Audaces)',
  'fmt.pds.detail': 'Native Optitex file, ready for your system',
  'fmt.mrk.detail': 'Computerized marker (Optitex) ready for cutting',
  'fmt.ads.detail': 'Native Audaces file',
  'fmt.other': 'Need another format?',
  'fmt.otherHint': 'Ask us on WhatsApp or Telegram',

  // ── Guía de talles ──
  'guide.trigger': 'Size guide',
  'guide.title': 'Modeltex size guide',
  'guide.subtitle': 'Anatomical body measurements in centimeters',
  'guide.tab.dama': '👗 Women',
  'guide.tab.hombre': '👔 Men',
  'guide.tab.ninos': '👦 Kids',
  'guide.tab.bebes': '👶 Babies',
  'guide.size': 'Size',
  'guide.age': 'Age',
  'guide.bust': 'Bust (cm)',
  'guide.chest': 'Chest (cm)',
  'guide.waist': 'Waist (cm)',
  'guide.hip': 'Hip (cm)',
  'guide.note': 'All measurements are anatomical (body) in centimeters · Modeltex Textile Patternmaking',

  // ── Ficha de producto ──
  'pd.back': 'Back to catalog',
  'pd.notFound': 'Product not found',
  'pd.approved': 'Sample-approved pattern',
  'pd.instant': 'Instant download',
  'pd.instantDesc': 'As soon as payment is confirmed, you access it from your account.',
  'pd.code': 'Code',
  'pd.category': 'Category',
  'pd.sizes': 'Sizes',
  'pd.formats': 'Formats',
  'pd.included': 'included',
  'pd.available': 'available',
  'pd.askUs': 'Ask us',
  'pd.secure': 'Secure purchase',
  'pd.secureDesc': 'Protected payment and access from your account.',
  'pd.support': 'After-sale support',
  'pd.supportDesc': 'We help you with printing, sizes and using the file.',
  'pd.chooseTitle': 'Choose format and sizes',
  'pd.chooseHint': 'The price adjusts automatically to the selected sizes.',
  'pd.digitalNote': 'Digital product. Check the chosen format before completing your purchase. If you need a special adaptation, ask us before paying.',
  'pd.defaultDesc': 'Professional pattern ready for textile production.',
  'pd.includesTitle': 'What this pattern includes',
  'pd.inc.1': 'Professional pattern ready to print or send to production.',
  'pd.inc.2': 'Selectable sizes within the available range of the product.',
  'pd.inc.3': 'Digital files from your Modeltex account.',
  'pd.inc.4': 'Options for A4, plotter and industrial CAD formats when available.',
  'pd.inc.5': 'Recommended fabrics reference for better production results.',
  'pd.inc.6': 'WhatsApp assistance if you need help with download or printing.',
  'pd.beforePrint': 'Before printing',
  'pd.beforePrintText': 'For PDF A4, print at 100% real size and check the scale before joining sheets. For plotter, confirm the roll width with your print shop or equipment.',
  'pd.doubts': 'Questions?',
  'pd.doubtsText': 'Use WhatsApp or Telegram and send us the pattern name so we can help you faster.',
  'pd.sizesIncluded': 'Included sizes',
  'pd.sizesConsult': 'Ask about available sizes.',
  'pd.formatsAvailable': 'Available formats',
  'pd.formatsConsult': 'Ask about available formats.',
  'pd.fabrics': 'Recommended fabrics',
  'pd.fabricsConsult': 'Ask us which fabric works best for this pattern.',
  'pd.compat': 'File compatibility',
  'pd.related': 'Related products',
  'fmtdesc.a4': 'Print on A4 sheets, join and produce without a plotter.',
  'fmtdesc.plotter': 'Print on a roll or send straight to a print shop.',
  'fmtdesc.dxf': 'DXF/AAMA industry standard, compatible with CAD systems (Gerber, Lectra, Optitex, Audaces) and textile machinery.',
  'fmtdesc.pds': 'Native Optitex file for pattern-making departments.',
  'fmtdesc.mrk': 'Computerized marker (Optitex) ready for fabric cutting.',
  'fmtdesc.ads': 'Native Audaces file for pattern-making departments.',
  'fmtdesc.cdr': 'Editable in CorelDRAW to adapt pieces and details.',
  'fmtdesc.plt': 'Vector format prepared for professional plotting.',
  'fmtdesc.sublim': 'Designed for prints and sublimated production.',
  'fmtdesc.default': 'Professional format for textile production.',

  // ── Checkout ──
  'co.backToCart': 'Back to cart',
  'co.title': 'Checkout',
  'co.clientData': 'Customer details',
  'co.verifyProfile': 'Check your details in your profile before paying',
  'co.yourEmail': 'Your email',
  'co.emailInvalid': 'Enter a valid email.',
  'co.guestHint': 'You are buying without an account — we will email you the download link once the payment is confirmed.',
  'co.haveAccount': 'Already have an account?',
  'co.signIn': 'Sign in',
  'co.paymentMethod': 'Payment method',
  'co.products': 'Products',
  'co.qty': 'Quantity:',
  'co.summary': 'Summary',
  'co.confirm': 'Confirm order',
  'co.processing': 'Processing...',
  'co.terms': 'By confirming, you accept the Modeltex purchase terms',
  'co.received': 'Order received',
  'co.created': 'Order created',
  'co.manualMsg': 'Your order was created correctly. We confirm your payment manually; this can take up to 24 hours.',
  'co.autoMsg': 'Your order was created correctly. You will be redirected to the payment.',
  'co.amount': 'Exact amount to pay',
  'co.copyAmount': 'Copy amount',
  'co.copied': 'Copied!',
  'co.viewOrders': 'View my purchases',
  'co.viewOrder': 'View my order',
  'co.keepShopping': 'Keep shopping',
  'co.emptyCart': 'Your cart is empty',
  'co.usdNote': '⚠️ The amount in Argentine pesos is a reference. Pay the USD equivalent.',
  'co.sendProof': 'After paying, send us the receipt via WhatsApp so we can confirm your purchase and enable the download.',
  'co.payWith': 'Pay with',
  'co.openLink': 'Pay with PayPal',
  'co.openMp': 'Open Mercado Pago',
  'co.accountEmail': 'Account email:',
  'co.saveLink': 'Save this link to download your order',
  'co.guestNotice': 'Since you bought without an account, we will notify you by email at',
  'co.guestNotice2': 'as soon as we confirm the payment, with a link to view and download your files. You can also come back anytime to',
  'co.guestNotice3': 'with your order number',
  'co.guestNotice4': 'and your email.',
  'co.transferData': 'Bank transfer details',
  'co.holder': 'Account holder:',
  'co.bank': 'Bank:',
  'co.transferProof': 'Once you complete the transfer, send us the receipt via WhatsApp to speed up confirmation.',
  'co.cryptoTitle': 'Pay with cryptocurrency',
  'co.walletCopied': 'Wallet copied',
  'co.copyWallet': 'Copy wallet',
  'co.cryptoNote': '⚠️ The amount in Argentine pesos is a reference. Convert it to the USDT equivalent before sending.',
  'co.network': 'Network:',
  'co.cryptoProof': 'Once you complete the payment, send us the transaction hash via WhatsApp to confirm.',
  'co.scanQr': 'Scan the code with the PayPal app or your camera to pay.',
  'co.mpNote': '⚠️ When opening the Mercado Pago link, enter exactly',
  'co.mpNote2': 'as the amount to pay.',
  'co.usdNoteGeneric': '⚠️ The amount in Argentine pesos is a reference. Pay the USD equivalent.',
  'co.paymentPending': 'This payment method is not configured yet. Ask us on WhatsApp.',
  'co.emailPlaceholder': 'you@email.com',
  'co.guestHint2': 'You are buying without an account — we will email you and send you the download link once we confirm the payment.',
  'co.alreadyAccount': 'Already have an account?',
  'co.methodDesc.paypal': 'QR de PayPal',
  'co.mpDescLabel': 'link de Mercado Pago',
  'co.confirmShowsHow': 'When you confirm we will show you how to pay',
  'co.downloadEnabled': 'Download is enabled once we confirm your payment.',
  'co.stripeSoon': 'This gateway will be available soon. For now you can pay with Mercado Pago, bank transfer or PayPal.',
  'co.orderItemsTitle': 'Products',
  'co.summaryTitle': 'Summary',
  'co.total': 'Total',

  // ── Métodos de pago ──
  'pay.mercadopago.desc': 'Pay securely with Mercado Pago (Latin America)',
  'pay.paypal.desc': 'Pay with PayPal from any country',
  'pay.stripe.label': 'Credit/debit card',
  'pay.stripe.desc': 'Pay by card through Stripe',
  'pay.transfer.label': 'Bank transfer (Argentina)',
  'pay.transfer.desc': 'Transfer to our bank alias and confirm your payment',
  'pay.binance.desc': 'Pay with cryptocurrency through Binance',
  'pay.payoneer.desc': 'International payment via Payoneer (USD)',
  'pay.wise.desc': 'International payment via Wise (USD/EUR)',

  // ── Home: hero, beneficios, cómo funciona, formatos, FAQ ──
  'home.hero.fullGrading': 'Full size grading',
  'home.hero.whatsappSupport': 'WhatsApp support',
  'home.freeMolds.desc': 'Download real patterns and try the quality before you buy',
  'home.benefit.1.title': 'Instant download',
  'home.benefit.1.desc': 'As soon as you pay, get your files instantly',
  'home.benefit.2.title': 'Professional formats',
  'home.benefit.2.desc': 'PDF A4, Plotter, DXF/AAMA, PDS, MRK, ADS and more',
  'home.benefit.3.title': 'All sizes included',
  'home.benefit.3.desc': 'One purchase, multiple sizes',
  'home.benefit.4.title': 'International shipping',
  'home.benefit.4.desc': 'Files reach anywhere in the world via digital download',
  'home.howItWorks.title': 'How does it work?',
  'home.howItWorks.subtitle': '5 simple steps to get your digital patterns',
  'home.step.1': 'Create your account',
  'home.step.2': 'Choose a pattern or pack',
  'home.step.3': 'Add to cart',
  'home.step.4': 'Pay',
  'home.step.5': 'Download your files',
  'home.formats.title': 'Available formats',
  'home.formats.subtitle': 'We work with the best formats so you can use our patterns in your preferred tools',
  'home.fmt.a4': 'Ready to print at home',
  'home.fmt.plotter': 'For roll-fed printers',
  'home.fmt.dxf': 'Universal CAD standard (Gerber, Lectra, Optitex, Audaces)',
  'home.fmt.pds': 'Native Optitex file',
  'home.fmt.mrk': 'Computerized marker ready for cutting',
  'home.fmt.ads': 'Native Audaces file',
  'home.faq.title': 'Frequently asked questions',
  'home.faq.subtitle': 'We answer your questions about our digital patterns',
  'home.faq.q1': 'Are the patterns digital?',
  'home.faq.a1': 'Yes, they are digital files you download after purchase. You will not receive anything physical, only files you can use on your computer.',
  'home.faq.q2': 'Can I print on A4?',
  'home.faq.a2': 'Yes, all our patterns include a PDF A4 version ready to print at home with any printer.',
  'home.faq.q3': 'Can I print on a plotter?',
  'home.faq.a3': 'Yes, many patterns include a plotter version (PDF and PLT). Check the product description to see if this format is included.',
  'home.faq.q4': 'When do I receive the file?',
  'home.faq.a4': 'Immediately after payment is confirmed. You will receive an email with download links and access to your customer panel.',
  'home.faq.q5': 'What happens if I pay by bank transfer?',
  'home.faq.a5': 'We confirm the payment manually and, as soon as it is credited, we activate your download automatically.',
  'home.faq.q6': 'Do you make custom patterns?',
  'home.faq.a6': 'Yes, you can request a custom design. Visit our "Custom design" section to learn more and get a personalized quote.',
  'home.faq.q7': 'Do you sell to other countries?',
  'home.faq.a7': 'Yes, digital files reach anywhere in the world via download, including the industrial formats for factories. We have no geographic shipping limitations.',
  'home.faq.q8': 'Can I request modifications?',
  'home.faq.a8': 'Yes, contact us on WhatsApp to ask about modifications. We will review your request and send you a quote.',

  // ── Reseñas ──
  'reviews.title': 'Reviews',
  'reviews.missingTable': 'The reviews table needs to be created in Supabase (SQL).',
  'reviews.sendError': "We couldn't submit your review. Please try again.",
  'reviews.confirmDelete': 'Delete this review?',
  'reviews.alreadyReviewed': 'You already left your review. Thanks! 🙌',
  'reviews.yourRating': 'Your rating:',
  'reviews.placeholder': 'Tell us about your experience with this pattern...',
  'reviews.sending': 'Sending...',
  'reviews.submit': 'Post review',
  'reviews.toReview': 'to leave your review.',
  'reviews.loading': 'Loading reviews...',
  'reviews.empty': 'No reviews yet. Be the first!',
  'reviews.customer': 'Customer',
  'reviews.delete': 'Delete',

  // ── Páginas de ayuda / términos (TrustPage) ──
  'tp.needHelp': 'Need help?',
  'tp.needHelpText': 'Send us the pattern name, the format you chose and your question. With that we can answer faster.',
  'tp.contactCta': 'Contact Modeltex',

  'tp.cf.eyebrow': 'Buying guide',
  'tp.cf.title': 'How to buy and download your patterns',
  'tp.cf.desc': 'A clear walkthrough of what to choose, how to pay and where to find your files after purchase.',
  'tp.cf.seoTitle': 'How to buy digital sewing patterns',
  'tp.cf.seoDesc': 'Guide to buying digital patterns at Modeltex: choosing format, sizes, paying, downloading and printing.',
  'tp.cf.s1.title': '1. Choose the pattern',
  'tp.cf.s1.text': 'Go to the catalog, search by category or season and open the product page to check images, sizes, formats and recommended fabrics.',
  'tp.cf.s1.i1': 'You can filter by Women, Men, Kids, Babies or Unisex.',
  'tp.cf.s1.i2': 'Each product page shows the available formats and buying options.',
  'tp.cf.s2.title': '2. Choose format and sizes',
  'tp.cf.s2.text': 'Before adding to cart, choose the format you need: PDF A4, PDF Plotter, cardboard, DXF/AAMA, PDS, MRK, ADS or other options available for the product.',
  'tp.cf.s2.i1': 'The price may change depending on how many sizes you select.',
  'tp.cf.s2.i2': 'If you need another format, ask us before paying.',
  'tp.cf.s3.title': '3. Pay securely',
  'tp.cf.s3.text': 'Confirm the order and choose the payment method available for your country. Some payment methods enable instant download, others require manual confirmation.',
  'tp.cf.s3.i1': 'Mercado Pago may redirect you to online payment.',
  'tp.cf.s3.i2': 'Bank transfer, PayPal, Payoneer, Wise or crypto may require a receipt.',
  'tp.cf.s4.title': '4. Download from your account',
  'tp.cf.s4.text': 'Once payment is confirmed, the files become available in your Modeltex account for download.',
  'tp.cf.s4.i1': 'Sign in with the same email you used to buy.',
  'tp.cf.s4.i2': "If you don't see the download, write to us on WhatsApp with your order number.",

  'tp.ap.eyebrow': 'Technical help',
  'tp.ap.title': 'Help printing and using your patterns',
  'tp.ap.desc': 'Practical recommendations for printing on A4, sending to a plotter, or working with industrial files without losing scale.',
  'tp.ap.seoTitle': 'Help printing digital sewing patterns',
  'tp.ap.seoDesc': 'How to print digital patterns on A4 or plotter and use DXF/AAMA, PDS, MRK and ADS formats in textile production.',
  'tp.ap.s1.title': 'PDF A4',
  'tp.ap.s1.text': 'Always print at real size, 100% scale, without fitting to the printable area. Before joining all the sheets, check the control box if the file includes one.',
  'tp.ap.s1.i1': 'Do not use "fit to page".',
  'tp.ap.s1.i2': 'Join the sheets following the marks or line continuity.',
  'tp.ap.s1.i3': 'Print one test sheet first if your printer changes margins.',
  'tp.ap.s2.title': 'PDF Plotter',
  'tp.ap.s2.text': 'For plotter, confirm the roll width with your print shop or equipment before printing. If unsure, send us the product and the available width.',
  'tp.ap.s2.i1': 'Check whether you need 90 cm, 120 cm or 150 cm.',
  'tp.ap.s2.i2': 'Ask for printing at 1:1 scale.',
  'tp.ap.s2.i3': 'Do not let the print shop "scale to fit".',
  'tp.ap.s3.title': 'DXF/AAMA, PDS, MRK and ADS',
  'tp.ap.s3.text': 'These are industrial formats built for CAD systems, marker making and factory machinery. Check compatibility with your software before producing large quantities.',
  'tp.ap.s3.i1': 'DXF/AAMA is the universal standard (Gerber, Lectra, Optitex, Audaces).',
  'tp.ap.s3.i2': 'PDS is the native Optitex format; MRK is the computerized marker ready for cutting.',
  'tp.ap.s3.i3': 'ADS is the native Audaces format.',
  'tp.ap.s4.title': "If something doesn't match",
  'tp.ap.s4.text': "Save a screenshot, the pattern name and the format you used. That helps us assist you faster on WhatsApp.",
  'tp.ap.s4.i1': 'Tell us your printer, software and paper size.',
  'tp.ap.s4.i2': 'Do not cut fabric until you verify scale and main pieces.',

  'tp.pd.eyebrow': 'Digital purchase',
  'tp.pd.title': 'Digital download and refund policy',
  'tp.pd.desc': 'Clear conditions for digital products, manual deliveries, receipts and support requests.',
  'tp.pd.seoTitle': 'Digital download and refund policy',
  'tp.pd.seoDesc': 'Download, digital delivery and refund conditions for digital pattern purchases at Modeltex.',
  'tp.pd.s1.title': 'Digital product',
  'tp.pd.s1.text': 'Digital patterns are delivered as downloadable files from the customer\'s account. They do not involve physical shipping unless the purchased format explicitly says "cardboard".',
  'tp.pd.s1.i1': 'Check format and sizes before paying.',
  'tp.pd.s1.i2': 'The download is linked to your account.',
  'tp.pd.s1.i3': 'Support is provided through the published channels.',
  'tp.pd.s2.title': 'Payment confirmation',
  'tp.pd.s2.text': 'Some payment methods are confirmed automatically. Others, such as bank transfer or manual payments, may take up to 24 business hours.',
  'tp.pd.s2.i1': 'Send a receipt if the system requests it.',
  'tp.pd.s2.i2': 'Use the same purchase email to ask about your order.',
  'tp.pd.s2.i3': 'Keep your order number.',
  'tp.pd.s3.title': 'Refunds and exchanges',
  'tp.pd.s3.text': 'Since these are digital products, once a purchase is enabled or downloaded there are no automatic refunds. If there was a verifiable technical error, we review the case to help you.',
  'tp.pd.s3.i1': 'We can fix access or resend files if applicable.',
  'tp.pd.s3.i2': 'A purchase is not replaced for choosing the wrong size/format without checking first.',
  'tp.pd.s3.i3': 'For special formats, ask us before paying.',
  'tp.pd.s4.title': 'After-sale support',
  'tp.pd.s4.text': "If you can't download, print or open a file, write to us with the product name, purchased format and a screenshot of the issue.",
  'tp.pd.s4.i1': 'We help via WhatsApp or email.',
  'tp.pd.s4.i2': 'Response time may vary depending on business hours.',
  'tp.pd.s4.i3': 'Do not delete the confirmation email.',
  'tp.pd.note': 'These texts are an operational baseline for the site. If you need specific legal coverage for your business, it is worth reviewing them with a professional.',

  'tp.tc.eyebrow': 'Terms of use',
  'tp.tc.title': 'Terms and conditions',
  'tp.tc.desc': 'Basic rules for buying, using files, contacting support and browsing the Modeltex site.',
  'tp.tc.seoTitle': 'Terms and conditions',
  'tp.tc.seoDesc': 'Terms and conditions for using the Modeltex site and purchasing digital patterns.',
  'tp.tc.s1.title': 'Use of the site',
  'tp.tc.s1.text': 'By browsing or buying at Modeltex you agree to use the site responsibly and provide real data to process your order.',
  'tp.tc.s1.i1': "Do not attempt to access other people's accounts.",
  'tp.tc.s1.i2': 'Do not share false payment details.',
  'tp.tc.s1.i3': 'Keep your password secure.',
  'tp.tc.s2.title': 'Buying patterns',
  'tp.tc.s2.text': 'Each product states, when available, formats, sizes, price and delivery method. The customer must review this data before confirming the purchase.',
  'tp.tc.s2.i1': 'Prices may change without prior notice.',
  'tp.tc.s2.i2': 'Availability depends on the current catalog.',
  'tp.tc.s2.i3': 'Custom orders have their own conditions.',
  'tp.tc.s3.title': 'Use of files',
  'tp.tc.s3.text': 'Purchased files are delivered for the customer\'s productive use. Reselling, publishing or distributing the digital files as your own product is not allowed.',
  'tp.tc.s3.i1': 'You can produce garments using the purchased pattern.',
  'tp.tc.s3.i2': 'Do not share download links publicly.',
  'tp.tc.s3.i3': 'Do not sell the original file or copies of it.',
  'tp.tc.s4.title': 'Support and changes',
  'tp.tc.s4.text': 'Modeltex provides reasonable support for access, download and general interpretation of the files. Special modifications may have an additional cost.',
  'tp.tc.s4.i1': 'Technical questions should include the product and format.',
  'tp.tc.s4.i2': 'Response times depend on business hours.',
  'tp.tc.s4.i3': 'Custom orders are quoted separately.',
  'tp.tc.note': 'These terms may be updated to reflect changes to the service, payment methods or catalog.',

  'tp.pv.eyebrow': 'Personal data',
  'tp.pv.title': 'Privacy policy',
  'tp.pv.desc': 'What data we ask for, what we use it for, and how it relates to purchases, accounts and support.',
  'tp.pv.seoTitle': 'Privacy policy',
  'tp.pv.seoDesc': "Modeltex's privacy policy: use of personal data, account, purchases and support communications.",
  'tp.pv.s1.title': 'Data we may request',
  'tp.pv.s1.text': 'To create an account, buy or request support we may ask for name, email, WhatsApp, country, city and order-related data.',
  'tp.pv.s1.i1': 'We never ask for passwords over WhatsApp.',
  'tp.pv.s1.i2': 'Payment data is processed by external providers when applicable.',
  'tp.pv.s1.i3': 'We keep the information needed to deliver purchases and support.',
  'tp.pv.s2.title': 'Use of information',
  'tp.pv.s2.text': 'We use the data to manage accounts, process orders, enable downloads, answer questions and improve the site experience.',
  'tp.pv.s2.i1': 'We may contact you about your order.',
  'tp.pv.s2.i2': 'We may log contact messages for follow-up.',
  'tp.pv.s2.i3': 'We do not sell your personal data as a business model.',
  'tp.pv.s3.title': 'Providers and services',
  'tp.pv.s3.text': 'The site may use external services for database, hosting, payments, email, analytics or support. Each provider operates under its own security measures.',
  'tp.pv.s3.i1': 'Supabase may store account and order data.',
  'tp.pv.s3.i2': 'Vercel may host the site and its functions.',
  'tp.pv.s3.i3': 'Mercado Pago, PayPal, Payoneer, Wise or others process payments depending on availability.',
  'tp.pv.s4.title': 'Questions about your data',
  'tp.pv.s4.text': 'If you want to review, correct or request a review of your data linked to a purchase, write to us from the same email or WhatsApp used on your account.',
  'tp.pv.s4.i1': 'We may ask for identity verification.',
  'tp.pv.s4.i2': 'Some purchase data must be kept for operational records.',
  'tp.pv.s4.i3': 'Never post your sensitive data in public comments.',
  'tp.pv.note': 'This policy is an informational baseline for customers. For jurisdiction-specific legal requirements, professional review is recommended.',

  // ── Footer ──
  'footer.help': 'Help & trust',
  'footer.howItWorks': 'How it works',
  'footer.printHelp': 'Printing help',
  'footer.downloads': 'Downloads & refunds',
  'footer.terms': 'Terms',
  'footer.privacy': 'Privacy',
};

interface LocaleContextType {
  lang: Lang;
  currency: Currency;
  setLang: (l: Lang) => void;
  setCurrency: (c: Currency) => void;
  t: (key: string, es: string) => string;
  formatPrice: (ars: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang) || 'es');
  const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem(CURRENCY_KEY) as Currency) || 'ARS');
  const [rate, setRate] = useState<number>(FALLBACK_ARS_PER_USD);

  // Tasa de cambio en vivo (con fallback). Solo se usa para mostrar en USD.
  useEffect(() => {
    let cancelled = false;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        const ars = d?.rates?.ARS;
        if (!cancelled && typeof ars === 'number' && ars > 0) setRate(ars);
      })
      .catch(() => { /* se mantiene el fallback */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  // Auto-detección de moneda por país (solo si el usuario NO eligió a mano):
  // Argentina -> ARS, resto del mundo -> USD. Usa /api/geo (geolocalización de Vercel).
  useEffect(() => {
    if (localStorage.getItem(CURRENCY_CHOSEN_KEY) === '1') return;
    let cancelled = false;
    fetch('/api/geo')
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const country = (d?.country || '').toUpperCase();
        if (!country) return; // sin dato -> dejamos el default
        setCurrencyState(country === 'AR' ? 'ARS' : 'USD');
      })
      .catch(() => { /* si falla, queda el default */ });
    return () => { cancelled = true; };
  }, []);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  // Cuando el usuario elige a mano, lo recordamos y respetamos su elección.
  const setCurrency = useCallback((c: Currency) => {
    localStorage.setItem(CURRENCY_CHOSEN_KEY, '1');
    setCurrencyState(c);
  }, []);

  const t = useCallback((key: string, es: string) => {
    if (lang === 'en' && EN[key]) return EN[key];
    return es;
  }, [lang]);

  const formatPrice = useCallback((ars: number) => {
    if (currency === 'USD') {
      const usd = ars / rate;
      return 'US$ ' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '$' + Math.round(ars).toLocaleString('es-AR');
  }, [currency, rate]);

  return (
    <LocaleContext.Provider value={{ lang, currency, setLang, setCurrency, t, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
