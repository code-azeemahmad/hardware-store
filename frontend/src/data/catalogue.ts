export interface Subcategory {
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
}

export interface Category {
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  heroImage: string;
  subcategories: Subcategory[];
}

export interface Product {
  slug: string;
  titleEn: string;
  titleUr: string;
  categorySlug: string;
  categoryNameEn: string;
  categoryNameUr: string;
  subcategorySlug: string;
  subcategoryNameEn: string;
  subcategoryNameUr: string;
  brand?: string;
  priceType: 'onRequest' | 'fixed';
  price: number | null;
  currency: 'PKR';
  imageUrl: string;
  gallery: string[];
  descriptionEn: string;
  descriptionUr: string;
  featuresEn: string[];
  featuresUr: string[];
  specs: Record<string, string>;
  specsUr: Record<string, string>;
  inStock: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  sku: string;
  origin?: string;
  tags: string[];
  metaTitleEn?: string;
  metaTitleUr?: string;
  metaDescriptionEn?: string;
  metaDescriptionUr?: string;
}

export interface Brand {
  slug: string;
  name: string;
  category: string;
  country: string;
  descriptionEn: string;
  descriptionUr: string;
  featuredProductsCount: number;
}

export interface BlogPost {
  slug: string;
  titleEn: string;
  titleUr: string;
  excerptEn: string;
  excerptUr: string;
  date: string;
  readTimeEn: string;
  readTimeUr: string;
  categoryEn: string;
  categoryUr: string;
  imageUrl: string;
  contentEn: string[];
  contentUr: string[];
}

export const CATEGORIES: Category[] = [
  {
    slug: 'kitchen',
    nameEn: 'Kitchen',
    nameUr: 'کچن',
    descriptionEn: 'Premium stainless steel kitchen sinks, brass faucets, pull-out pantry units, and built-in cooking appliances.',
    descriptionUr: 'اعلیٰ کوالٹی اسٹین لیس اسٹیل کچن سنک، براس مکسرز، ماڈرن پینٹری یونٹس اور بلٹ اِن کچن اپلائنسز۔',
    heroImage: '/images/shelf.jpg',
    subcategories: [
      {
        slug: 'sinks',
        nameEn: 'Kitchen Sinks',
        nameUr: 'کچن سنک',
        descriptionEn: 'Handmade 304 grade stainless steel single and double bowl kitchen sinks.',
        descriptionUr: 'ہینڈ میڈ 304 گریڈ اسٹین لیس اسٹیل سنگل اور ڈبل باؤل کچن سنک۔'
      },
      {
        slug: 'faucets',
        nameEn: 'Kitchen Faucets',
        nameUr: 'کچن ٹونٹیاں اور مکسرز',
        descriptionEn: 'Flexible pull-out spray faucets, brass sink mixers, and designer kitchen taps.',
        descriptionUr: 'فلیکسیبل پل آؤٹ اسپرے ٹونٹیاں، براس سنک مکسرز اور پائیدار کچن نل۔'
      },
      {
        slug: 'accessories',
        nameEn: 'Kitchen Storage & Accessories',
        nameUr: 'کچن اسٹوریج اور اسیسریز',
        descriptionEn: 'Modular tall pantry units, stainless dish racks, pull-out spice racks, and corner carousels.',
        descriptionUr: 'ماڈیولر ٹال پینٹری یونٹس، اسٹیل ڈش ریکس، مصالحہ جات کے ریکس اور کارنر کیروسل۔'
      },
      {
        slug: 'handles',
        nameEn: 'Kitchen Cabinet Handles',
        nameUr: 'کچن کیبنٹ ہینڈلز',
        descriptionEn: 'Profile handles, concealed J-pulls, and contemporary zinc alloy cabinet pulls.',
        descriptionUr: 'پروفائل ہینڈلز، کنسیلڈ جے پُل اور جدید زنک الائے الماری ہینڈلز۔'
      },
      {
        slug: 'hoods',
        nameEn: 'Kitchen Hoods',
        nameUr: 'کچن ہوڈز',
        descriptionEn: 'Heavy duty suction range hoods with baffle filters and gesture control.',
        descriptionUr: 'ہیوی ڈیوٹی سکشن کچن رینج ہوڈز بمع بافل فلٹرز اور سینسر کنٹرول۔'
      },
      {
        slug: 'ovens',
        nameEn: 'Built-in Ovens & Microwaves',
        nameUr: 'بلٹ اِن اوونز اور مائیکرو ویوز',
        descriptionEn: 'Built-in electric convection ovens and convection microwaves for modern modular kitchens.',
        descriptionUr: 'جدید ماڈیولر کچن کے لیے بلٹ اِن الیکٹرک کنویکشن اوونز اور مائیکرو ویوز۔'
      }
    ]
  },
  {
    slug: 'hardware',
    nameEn: 'Home Hardware',
    nameUr: 'ہوم ہارڈویئر',
    descriptionEn: 'Architectural door locks, smart digital access, luxury brass handles, soft-close hinges, and heavy drawer runners.',
    descriptionUr: 'آرکیٹیکچرل ڈور لاکس، اسمارٹ ڈیجیٹل لاک، لگژری ہینڈلز، سافٹ کلوز قبضے اور ہیوی ڈیوٹی چینلز۔',
    heroImage: '/images/crafts.jpg',
    subcategories: [
      {
        slug: 'door-handles',
        nameEn: 'Door Handles & Pulls',
        nameUr: 'دروازوں کے ہینڈلز',
        descriptionEn: 'Heavy main door entrance pulls, rose handles, and interior bedroom door handles.',
        descriptionUr: 'مین ڈور ہیوی پل ہینڈلز، روز ہینڈلز اور کمروں کے خوبصورت لیور ہینڈلز۔'
      },
      {
        slug: 'locks',
        nameEn: 'Door Locks & Security',
        nameUr: 'ڈور لاکس اور سیکورٹی',
        descriptionEn: 'Biometric fingerprint locks, mortise cylinder locks, rim night latches, and deadbolts.',
        descriptionUr: 'بائیو میٹرک فنگر پرنٹ لاکس، مورٹائز سلنڈر تالے اور ہیوی سیکیورٹی لاکس۔'
      },
      {
        slug: 'cabinet-handles',
        nameEn: 'Cabinet & Wardrobe Handles',
        nameUr: 'الماری اور دراز ہینڈلز',
        descriptionEn: 'Wardrobe T-bars, antique brass knobs, knurled bar pulls, and contemporary furniture hardware.',
        descriptionUr: 'وارڈروب ٹی بارز، قدیم براس نوبس اور جدید فرنیچر ہینڈلز۔'
      },
      {
        slug: 'hinges',
        nameEn: 'Hinges & Pivots',
        nameUr: 'قبضے اور پیوٹ ہارڈویئر',
        descriptionEn: 'Hydraulic soft-close cabinet hinges, stainless steel butt hinges, and heavy pivot door hinges.',
        descriptionUr: 'ہائیڈرولک سافٹ کلوز کیبنٹ قبضے، اسٹیل بٹ قبضے اور ہیوی ڈور پیوٹ ہارڈویئر۔'
      },
      {
        slug: 'channels',
        nameEn: 'Drawer Channels & Runners',
        nameUr: 'دراز کے چینلز اور رنرز',
        descriptionEn: 'Telescopic ball-bearing runners, undermount concealed soft-close drawer slides, and push-to-open slides.',
        descriptionUr: 'ٹیلی اسکوپک بال بیئرنگ چینلز، انڈر ماؤنٹ کنسیلڈ سافٹ کلوز اور پش ٹو اوپن رنرز۔'
      },
      {
        slug: 'general',
        nameEn: 'General Hardware Fittings',
        nameUr: 'جنرل ہارڈویئر فٹنگز',
        descriptionEn: 'Tower bolts, magnetic door stoppers, wardrobe lifters, bed fittings, and architectural screws.',
        descriptionUr: 'ٹاور بولٹس (چٹخنی)، میگنیٹک ڈور اسٹاپر، الماری لفٹرز اور معیاری فٹنگز۔'
      }
    ]
  },
  {
    slug: 'bathroom',
    nameEn: 'Bathroom',
    nameUr: 'باتھ روم',
    descriptionEn: 'Vitreous china sanitary ware, rimless wall-hung commodes, water-saving mixers, vanities, and rain shower columns.',
    descriptionUr: 'ہائی کوالٹی سینیٹری ویئر، رِم لیس وال ہینگ کموڈز، واٹر سیونگ مکسرز، وینٹیز اور شاور پینلز۔',
    heroImage: '/images/shelf.jpg',
    subcategories: [
      {
        slug: 'commodes',
        nameEn: 'Commodes & Toilets',
        nameUr: 'کموڈز اور ٹوائلٹس',
        descriptionEn: 'Rimless wall-hung European water closets, one-piece floor toilets, and dual-flush water-saving systems.',
        descriptionUr: 'رِم لیس وال ہینگ کموڈز، ون پیس فلور کموڈز اور ڈوئل فلش سسٹم۔'
      },
      {
        slug: 'vanities',
        nameEn: 'Bathroom Vanities',
        nameUr: 'باتھ روم وینٹیز',
        descriptionEn: 'Waterproof PVC and solid surface floating bathroom vanities with LED smart touch mirrors.',
        descriptionUr: 'واٹر پروف پی وی سی اور سولڈ سرفیس وال ہینگ وینٹیز بمع اسمارٹ ایل ای ڈی مرر۔'
      },
      {
        slug: 'basins',
        nameEn: 'Wash Basins',
        nameUr: 'واش بیسنز',
        descriptionEn: 'Tabletop artistic ceramic basins, under-counter sinks, and glazed stone counter basins.',
        descriptionUr: 'ٹیبل ٹاپ آرٹسٹک سیرامک بیسنز، انڈر کاؤنٹر سنک اور گلیزڈ بیسنز۔'
      },
      {
        slug: 'faucets',
        nameEn: 'Bathroom Faucets & Mixers',
        nameUr: 'باتھ روم ٹونٹیاں اور مکسرز',
        descriptionEn: 'Tall basin mixers, concealed wall-mounted basin taps, and bidet sprayers.',
        descriptionUr: 'ٹال بیسن مکسرز، کنسیلڈ وال ماؤنٹڈ نل اور مسلم شاور سپرے۔'
      },
      {
        slug: 'showers',
        nameEn: 'Shower Systems',
        nameUr: 'شاور سسٹمز',
        descriptionEn: 'Thermostatic rainfall shower columns, multi-function hand showers, and concealed ceiling heads.',
        descriptionUr: 'تھرموسٹیٹک رین شاور کالمز، ملٹی فنکشن ہینڈ شاور اور کنسیلڈ سیلنگ شاورز۔'
      },
      {
        slug: 'accessories',
        nameEn: 'Bathroom Accessories',
        nameUr: 'باتھ روم اسیسریز',
        descriptionEn: 'Towel rails, glass shelves, soap dispensers, paper holders, and robe hooks.',
        descriptionUr: 'تولیہ ریل، گلاس شیلف، صابن ڈسپنسر، پیپر ہولڈر اور ہوکس۔'
      }
    ]
  },
  {
    slug: 'plywood',
    nameEn: 'Plywood & Boards',
    nameUr: 'پلائی ووڈ اور بورڈز',
    descriptionEn: 'Commercial plywood, certified Marine Grade BWR/BWP sheets, high-density MDF, blockboard, and decorative laminates.',
    descriptionUr: 'کمرشل پلائی ووڈ، میرین گریڈ واٹر پروف شیٹس، ایچ ڈی ایف/ایم ڈی ایف، بلاک بورڈ اور ڈیکوریٹو شیٹس۔',
    heroImage: '/images/wood.jpg',
    subcategories: [
      {
        slug: 'commercial',
        nameEn: 'Commercial Plywood (MR Grade)',
        nameUr: 'کمرشل پلائی ووڈ (MR گریڈ)',
        descriptionEn: 'Moisture resistant hardwood core commercial plywood in 4mm, 6mm, 8mm, 12mm, 16mm, and 18mm thicknesses.',
        descriptionUr: 'نمی سے محفوظ ہارڈ ووڈ کمرشل پلائی ووڈ (4mm تا 18mm موٹائی) برائے فرنیچر۔'
      },
      {
        slug: 'marine',
        nameEn: 'Marine Plywood (BWP / BWR)',
        nameUr: 'میرین پلائی ووڈ (BWP / BWR واٹر پروف)',
        descriptionEn: '100% boiling water-proof (BWP) marine grade plywood for kitchens, bathrooms, and exterior joinery.',
        descriptionUr: 'کچن، باتھ روم اور واٹر پروف کام کے لیے 100 فیصد بوائلنگ واٹر پروف شیٹس۔'
      },
      {
        slug: 'mdf',
        nameEn: 'MDF & HDF Boards',
        nameUr: 'ایم ڈی ایف اور ایچ ڈی ایف بورڈز',
        descriptionEn: 'High density fiberboard and medium density boards for smooth CNC carving, painting, and interior panels.',
        descriptionUr: 'سی این سی کٹنگ اور عمدہ پینٹ کے لیے ہموار ہائی ڈینسٹی فائبر بورڈز۔'
      },
      {
        slug: 'blockboard',
        nameEn: 'Blockboard',
        nameUr: 'بلاک بورڈ',
        descriptionEn: 'Solid seasoned wood batten core blockboard for long wardrobe doors and structural shelving.',
        descriptionUr: 'الماری کے بڑے دروازوں اور شیلفس کے لیے سیدھی لکڑی کا پائیدار بلاک بورڈ۔'
      },
      {
        slug: 'laminates',
        nameEn: 'Decorative Laminate Sheets (Sunmica)',
        nameUr: 'ڈیکوریٹو لیمینیٹ شیٹس (سن مائیکا)',
        descriptionEn: '0.8mm and 1.0mm high-pressure textured laminates: high-gloss, ultra-matt, woodgrain, and marble finishes.',
        descriptionUr: 'ہائی گلوس، میٹ، ووڈ گرین اور ماربل فنش میں 1.0mm جدید لیمینیٹ شیٹس۔'
      },
      {
        slug: 'edge-banding',
        nameEn: 'PVC Edge Banding Tapes',
        nameUr: 'پی وی سی ایج بینڈنگ ٹیپس',
        descriptionEn: 'Colour-matched 0.8mm, 1.0mm, and 2.0mm PVC edge tapes for water-tight furniture board edging.',
        descriptionUr: 'بورڈ کے کناروں کے لیے ہم رنگ واٹر پروف پی وی سی ایج بینڈنگ ٹیپس۔'
      }
    ]
  }
];

export const PRODUCTS: Product[] = [
  // --- KITCHEN PRODUCTS ---
  {
    slug: '19905-sink-mixer',
    titleEn: '19905 Stainless Steel Kitchen Sink Mixer',
    titleUr: '19905 اسٹین لیس اسٹیل کچن سنک مکسر',
    categorySlug: 'kitchen',
    categoryNameEn: 'Kitchen',
    categoryNameUr: 'کچن',
    subcategorySlug: 'faucets',
    subcategoryNameEn: 'Kitchen Faucets',
    subcategoryNameUr: 'کچن ٹونٹیاں اور مکسرز',
    brand: 'Forza',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/shelf.jpg',
    gallery: ['/images/shelf.jpg', '/images/shelf.jpg', '/images/shelf.jpg'],
    descriptionEn: 'Premium brass body kitchen sink mixer with 360-degree swivel spout, dual spray modes (aerated stream and powerful rinse), and brushed matte finish resistant to fingerprints and water spots.',
    descriptionUr: 'اعلیٰ کوالٹی براس باڈی کچن سنک مکسر بمع 360 ڈگری گھومنے والا پائپ، دو اسپرے موڈز، اور واٹر اسپاٹ پروف میٹ فنش۔',
    featuresEn: [
      'Solid brass construction with ceramic disc cartridge tested for 500,000 cycles',
      'Dual function pull-down sprayer head (stream and sweep spray)',
      '360-degree high-arc swivel spout for complete sink basin clearance',
      'Includes flexible stainless steel braided water supply hoses (hot & cold)',
      'Fingerprint and corrosion resistant brushed finish'
    ],
    featuresUr: [
      'سولڈ براس باڈی اور 5 لاکھ بار ٹیسٹ شدہ سیرامک ڈسک والو',
      'ڈوئل فنکشن پل ڈاؤن اسپرے ہیڈ',
      'بڑے برتن دھونے کے لیے 360 ڈگری ہائی آرک ڈیزائن',
      'گرم اور ٹھنڈے پانی کے لیے اسٹین لیس اسٹیل فلیکسیبل پائپ شامل',
      'داغ دھبوں اور زنگ سے محفوظ پائیدار فنش'
    ],
    specs: {
      'Model Number': '19905-SM',
      'Material': 'Solid Brass & 304 Stainless Steel',
      'Finish': 'Brushed Nickel / Matte Black',
      'Spout Reach': '210 mm',
      'Total Height': '410 mm',
      'Mounting Hole': '35 mm standard single hole',
      'Warranty': '5 Years Showroom Replacement Warranty'
    },
    specsUr: {
      'ماڈل نمبر': '19905-SM',
      'میٹیریل': 'سولڈ براس اور 304 اسٹین لیس اسٹیل',
      'فنش': 'برشڈ نکل / میٹ بلیک',
      'اسپاؤٹ ریچ': '210 ملی میٹر',
      'کل اونچائی': '410 ملی میٹر',
      'ماؤنٹنگ سوراخ': '35 ملی میٹر اسٹینڈرڈ',
      'وارنٹی': '5 سال شوروم ریپلیسمنٹ وارنٹی'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: true,
    sku: 'FORZA-19905',
    origin: 'Imported',
    tags: ['kitchen mixer', 'sink tap', 'pull-out faucet', 'forza', 'brass']
  },
  {
    slug: 'handmade-double-bowl-sink',
    titleEn: '304 Grade Handmade Double Bowl Kitchen Sink 37x18',
    titleUr: '304 گریڈ ہینڈ میڈ ڈبل باؤل کچن سنک 37x18',
    categorySlug: 'kitchen',
    categoryNameEn: 'Kitchen',
    categoryNameUr: 'کچن',
    subcategorySlug: 'sinks',
    subcategoryNameEn: 'Kitchen Sinks',
    subcategoryNameUr: 'کچن سنک',
    brand: 'Diamond Sinks',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/shelf.jpg',
    gallery: ['/images/shelf.jpg', '/images/shelf.jpg'],
    descriptionEn: 'Heavy 16-gauge 1.2mm 304 food-grade stainless steel handmade double bowl sink. Engineered with R10 tight radius corners for effortless cleaning and thick acoustic sound deadening pads.',
    descriptionUr: 'ہیوی 16 گیج 1.2 ملی میٹر موٹائی میں 304 فوڈ گریڈ اسٹین لیس اسٹیل ہینڈ میڈ ڈبل سنک بمع ساؤنڈ پروفنگ پیڈز۔',
    featuresEn: [
      'Heavy 1.2mm thickness (16 gauge) 304 food-grade stainless steel',
      'R10 tight radius corners prevent food trap and simplify cleaning',
      'Deep 10-inch basins accommodate large cooking pots and baking sheets',
      'Heavy acoustic pads and protective condensation undercoating',
      'Complete with basket strainer wastes and overflow drain kit'
    ],
    featuresUr: [
      '1.2 ملی میٹر ہیوی موٹائی (16 گیج) اصلی 304 فوڈ گریڈ اسٹیل',
      'آسان صفائی کے لیے R10 راؤنڈ کارنرز',
      'بڑے دیگچے اور برتن دھونے کے لیے 10 انچ گہرا باؤل',
      'آواز بند کرنے والے موٹے ساؤنڈ پیڈز اور کوٹنگ',
      'مکمل باسکٹ اسٹرینر اور ڈرینج کٹ شامل'
    ],
    specs: {
      'Dimensions': '37" x 18" x 10" (940 x 457 x 254 mm)',
      'Gauge/Thickness': '16 Gauge (1.2 mm)',
      'Steel Grade': 'SUS 304 Non-Magnetic',
      'Bowl Configuration': 'Equal Double Bowl 50/50',
      'Installation': 'Top-mount or Undermount'
    },
    specsUr: {
      'پیمائش': '37x18 انچ، گہرائی 10 انچ',
      'موٹائی': '16 گیج (1.2 ملی میٹر)',
      'اسٹیل گریڈ': '304 نان میگنیٹک اصلی اسٹیل',
      'ڈیزائن': 'برابر ڈبل باؤل',
      'فٹنگ': 'ٹاپ ماؤنٹ یا انڈر ماؤنٹ'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: false,
    sku: 'DM-3718-DB',
    origin: 'Imported',
    tags: ['handmade sink', 'double bowl', '304 stainless', 'kitchen sink']
  },
  {
    slug: 't1221-builtin-oven',
    titleEn: 'T1221 Built-in Electric Convection Oven',
    titleUr: 'T1221 بلٹ اِن الیکٹرک کنویکشن اوون',
    categorySlug: 'kitchen',
    categoryNameEn: 'Kitchen',
    categoryNameUr: 'کچن',
    subcategorySlug: 'ovens',
    subcategoryNameEn: 'Built-in Ovens & Microwaves',
    subcategoryNameUr: 'بلٹ اِن اوونز اور مائیکرو ویوز',
    brand: 'Forza Appliances',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/shelf.jpg',
    gallery: ['/images/shelf.jpg'],
    descriptionEn: '70L capacity premium built-in convection oven with triple-glazed cool touch glass door, 9 multifunction baking and roasting programmes, and digital touch timer.',
    descriptionUr: '70 لیٹر گنجائش والا بلٹ اِن الیکٹرک کنویکشن اوون، ٹرپل گلیزڈ کول ٹچ شیشہ اور 9 کوکنگ پروگرامز۔',
    featuresEn: [
      '70-litre spacious cooking cavity with easy-clean enamel interior',
      '9 specialized cooking functions including fan forced baking, grill, and defrost',
      'Triple-glazed removable safety door remains safe to touch',
      'Digital LED touch timer with automatic shut-off safety'
    ],
    featuresUr: [
      '70 لیٹر بڑی کیویٹی اور اینامل آسان صفائی کی کوٹنگ',
      'بیکنگ، گرل اور ڈی فروسٹ کے 9 خصوصی فنکشنز',
      'ٹرپل گلیزڈ کول گلاس ڈور',
      'ڈیجیٹل ایل ای ڈی ٹچ ٹائمر اور آٹو کٹ آف سیکیورٹی'
    ],
    specs: {
      'Capacity': '70 Litres',
      'Power Consumption': '2800 Watts',
      'Cutout Size': '560W x 580H x 550D mm',
      'Voltage': '220-240V / 50Hz',
      'Warranty': '1 Year Comprehensive Warranty'
    },
    specsUr: {
      'گنجائش': '70 لیٹر',
      'طاقت': '2800 واٹ',
      'کیبنٹ کٹ آؤٹ سائز': '560W x 580H x 550D ملی میٹر',
      'وولٹیج': '220-240 وولٹ',
      'وارنٹی': '1 سال جامع وارنٹی'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: true,
    sku: 'FORZA-T1221',
    origin: 'Imported',
    tags: ['electric oven', 'builtin oven', 'convection', 'forza']
  },
  {
    slug: 'modular-tall-pantry-unit',
    titleEn: 'Stainless Steel 6-Layer Modular Tall Pantry Pull-Out',
    titleUr: 'اسٹین لیس اسٹیل 6 لیئر ماڈیولر ٹال پینٹری پل آؤٹ',
    categorySlug: 'kitchen',
    categoryNameEn: 'Kitchen',
    categoryNameUr: 'کچن',
    subcategorySlug: 'accessories',
    subcategoryNameEn: 'Kitchen Storage & Accessories',
    subcategoryNameUr: 'کچن اسٹوریج اور اسیسریز',
    brand: 'Naseer Signature',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/shelf.jpg',
    gallery: ['/images/shelf.jpg'],
    descriptionEn: 'Soft-close tandem pantry pullout unit with 6 adjustable solid base chrome wire baskets. Supports up to 80kg of groceries with smooth damped closing action.',
    descriptionUr: '6 ایڈجسٹ ایبل ٹوکریاں، 80 کلوگرام تک وزن اٹھانے کی گنجائش اور سافٹ کلوز ہائیڈرولک چینل پر مشتمل پینٹری یونٹ۔',
    featuresEn: [
      'Synchronized heavy-duty runners with integrated soft-closing damper',
      '6 heavy gauge wire baskets with solid anti-slip acrylic mats',
      'Adjustable frame height (1850mm to 2150mm) to match cabinet ceiling',
      'Full extension pulls entire grocery stock forward for 100% visibility'
    ],
    featuresUr: [
      'ہیوی ڈیوٹی سافٹ کلوز چینلز',
      '6 مضبوط تاروں کی ٹوکریاں بمع اینٹی سلپ میٹس',
      'کیبنٹ کے مطابق 1850 ملی میٹر سے 2150 ملی میٹر تک ایڈجسٹ ایبل فریم',
      'مکمل باہر نکلنے والا ڈیزائن جس سے ہر سامان سامنے نظر آئے'
    ],
    specs: {
      'Cabinet Width': '450 mm (18 inch cabinet)',
      'Basket Count': '6 Baskets included',
      'Load Capacity': 'Up to 80 kg total weight',
      'Runner Mechanism': 'German style tandem damper runner'
    },
    specsUr: {
      'کیبنٹ چوڑائی': '450 ملی میٹر (18 انچ کیبنٹ)',
      'ٹوکریاں': '6 عدد ایڈجسٹ ایبل ٹوکریاں',
      'وزن اٹھانے کی صلاحیت': '80 کلوگرام تک',
      'چینل ٹائپ': 'ٹیندم ڈیمپنگ سافٹ کلوز'
    },
    inStock: true,
    isBestSeller: false,
    isFeatured: true,
    sku: 'NS-PANTRY-450',
    origin: 'Imported',
    tags: ['pantry unit', 'kitchen storage', 'pullout basket', 'soft-close']
  },

  // --- HARDWARE PRODUCTS ---
  {
    slug: 'ds-681-smart-door-lock',
    titleEn: 'DS-681 Biometric Smart Digital Door Lock',
    titleUr: 'DS-681 بائیو میٹرک اسمارٹ ڈیجیٹل ڈور لاک',
    categorySlug: 'hardware',
    categoryNameEn: 'Home Hardware',
    categoryNameUr: 'ہوم ہارڈویئر',
    subcategorySlug: 'locks',
    subcategoryNameEn: 'Door Locks & Security',
    subcategoryNameUr: 'ڈور لاکس اور سیکورٹی',
    brand: undefined,
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/crafts.jpg',
    gallery: ['/images/crafts.jpg', '/images/crafts.jpg'],
    descriptionEn: 'Heavy aerospace aluminium alloy digital lock with 5 unlocking modes: 3D semiconductor fingerprint scanner, PIN touchscreen keypad, RFID smart cards, mechanical backup key, and smartphone App.',
    descriptionUr: 'اعلیٰ سیکیورٹی ڈیجیٹل لاک بمع 5 ان لاکنگ طریقے: فنگر پرنٹ، ٹچ اسکرین پاس ورڈ، کارڈ، ایمرجنسی چابی اور موبائل ایپ۔',
    featuresEn: [
      '3D live semiconductor biometric fingerprint sensor',
      'Anti-peep virtual passcode entry prevents strangers watching your PIN',
      'Mortise stainless steel 6068 security lock body with anti-saw deadbolts',
      'Micro-USB emergency power port in case of battery discharge',
      'Voice prompts in English for easy user registration and setup'
    ],
    featuresUr: [
      'جدید لائیو فنگر پرنٹ سینسر',
      'پاس ورڈ چوری سے بچانے کے لیے اینٹی پیپ ورچوئل کوڈ سسٹم',
      'اسٹین لیس اسٹیل 6068 اینٹی کٹ مورٹائز ہیوی لاک باڈی',
      'بیٹری ختم ہونے کی صورت میں ایمرجنسی پاور پورٹ اور روایتی چابی',
      'آسان رجسٹریشن اور سیٹ اپ'
    ],
    specs: {
      'Door Thickness': '40 mm to 90 mm standard wooden & metal doors',
      'Fingerprint Capacity': '100 Fingerprints',
      'Card/PIN Capacity': '100 Users',
      'Power Source': '4x AA Alkaline Batteries (up to 12 months life)',
      'Lock Body': 'Stainless Steel 6068 Heavy Mortise',
      'Warranty': '2 Years Hardware Replacement Warranty'
    },
    specsUr: {
      'دروازے کی موٹائی': '40 ملی میٹر تا 90 ملی میٹر لکڑی و میٹل دروازے',
      'فنگر پرنٹ گنجائش': '100 فنگر پرنٹس',
      'صارفین کی تعداد': '100 کارڈز / پاس ورڈز',
      'بیٹری': '4 عدد الکلائن بیٹریاں (12 ماہ لائف)',
      'لاک باڈی': 'اسٹین لیس اسٹیل 6068 ہیوی مورٹائز',
      'وارنٹی': '2 سال ہارڈویئر ریپلیسمنٹ وارنٹی'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: true,
    sku: 'NP-LK-DS681',
    origin: 'Imported',
    tags: ['digital lock', 'smart lock', 'fingerprint lock', 'dorma', 'security']
  },
  {
    slug: 'zy004-cabinet-handle',
    titleEn: 'ZY004 Matte Gold Knurled Solid Brass Cabinet Handle',
    titleUr: 'ZY004 میٹ گولڈ نرلڈ سولڈ براس کیبنٹ ہینڈل',
    categorySlug: 'hardware',
    categoryNameEn: 'Home Hardware',
    categoryNameUr: 'ہوم ہارڈویئر',
    subcategorySlug: 'cabinet-handles',
    subcategoryNameEn: 'Cabinet & Wardrobe Handles',
    subcategoryNameUr: 'الماری اور دراز ہینڈلز',
    brand: 'Naseer Signature',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/crafts.jpg',
    gallery: ['/images/crafts.jpg'],
    descriptionEn: 'Architectural diamond-knurled solid brass bar handle in brushed satin brass finish. Ideal for modern kitchen drawers, luxury wardrobes, and bathroom vanity cabinetry.',
    descriptionUr: 'سولڈ براس کا بنا ہوا ڈائمنڈ نرلڈ بار ہینڈل، برشڈ ساٹن گولڈ فنش میں جو کچن درازوں اور الماریوں کو لگژری لک دیتا ہے۔',
    featuresEn: [
      'Machined from 100% solid brass bar with tactile diamond knurling',
      'Durable electroplated satin brass coating resistant to tarnishing',
      'Available in standard 96mm, 128mm, 160mm, 224mm, and 320mm hole centers',
      'Supplied with M4 break-off mounting screws for any door thickness'
    ],
    featuresUr: [
      '100 فیصد خالص سولڈ براس سے تیار کردہ مضبوط گرفت',
      'رنگ خراب نہ ہونے والی پائیدار الیکٹروپلیٹڈ گولڈ فنش',
      'مختلف سائزز (96 ملی میٹر تا 320 ملی میٹر) میں دستیاب',
      'ہر موٹائی کے دروازے کے لیے ایم 4 اسکرو شامل'
    ],
    specs: {
      'Hole Centers': '96mm / 128mm / 160mm / 224mm / 320mm',
      'Diameter': '12 mm solid rod',
      'Projection': '35 mm',
      'Finish': 'Satin Brushed Brass / Matte Black',
      'Material': 'Solid Brass'
    },
    specsUr: {
      'سوراخوں کا درمیانی فاصلہ': '96mm / 128mm / 160mm / 224mm / 320mm',
      'موٹائی': '12 ملی میٹر سولڈ راڈ',
      'فنش': 'ساٹن گولڈ / میٹ بلیک',
      'میٹیریل': 'خالص براس'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: false,
    sku: 'NS-ZY004-GLD',
    origin: 'Imported',
    tags: ['brass handle', 'knurled handle', 'cabinet handle', 'wardrobe pull']
  },
  {
    slug: 'hydraulic-soft-close-hinges',
    titleEn: '3D Clip-on Hydraulic Soft-Close Cabinet Hinges (Pair)',
    titleUr: '3D کلپ آن ہائیڈرولک سافٹ کلوز کیبنٹ قبضے (جوڑا)',
    categorySlug: 'hardware',
    categoryNameEn: 'Home Hardware',
    categoryNameUr: 'ہوم ہارڈویئر',
    subcategorySlug: 'hinges',
    subcategoryNameEn: 'Hinges & Pivots',
    subcategoryNameUr: 'قبضے اور پیوٹ ہارڈویئر',
    brand: 'Golden Hardware',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/crafts.jpg',
    gallery: ['/images/crafts.jpg'],
    descriptionEn: 'Cold-rolled steel 3D adjustable soft-close clip-on cabinet door hinges with integrated hydraulic piston. Guarantees silent door closure and prevents cabinet slamming.',
    descriptionUr: 'کولڈ رولڈ اسٹیل کے بنے 3D ایڈجسٹ ایبل سافٹ کلوز قبضے جو کیبنٹ دروازوں کو بغیر آواز نرمی سے بند کرتے ہیں۔',
    featuresEn: [
      'Built-in brass hydraulic cylinder damper for smooth, silent closing',
      '3D eccentric cam screws for easy vertical, horizontal, and depth adjustment',
      'Clip-on quick release baseplate for rapid door installation and removal',
      'Opening angle 105 degrees; rated for 80,000 opening/closing cycles'
    ],
    featuresUr: [
      'براس ہائیڈرولک سلنڈر ڈیمپر برائے خاموش بندش',
      'تینوں رخوں پر دروازے کی سیٹنگ کے لیے آسان کیم اسکرو سسٹم',
      'دروازہ فوری اتارنے اور چڑھانے کے لیے کلپ آن پلیٹ',
      '105 ڈگری کھلنے کا زاویہ اور 80 ہزار سائیکل لائف'
    ],
    specs: {
      'Hinge Type': 'Full Overlay / Half Overlay / Inset',
      'Cup Diameter': '35 mm standard cup',
      'Cup Depth': '11.5 mm',
      'Door Thickness': '14 mm to 22 mm',
      'Material': 'Cold-Rolled Steel Nickel Plated'
    },
    specsUr: {
      'قبضے کی قسم': 'فل اوورلے / ہاف اوورلے / اِنسٹ',
      'کپ سائز': '35 ملی میٹر اسٹینڈرڈ',
      'دروازے کی موٹائی': '14 تا 22 ملی میٹر',
      'میٹیریل': 'کولڈ رولڈ نکل پلیٹڈ اسٹیل'
    },
    inStock: true,
    isBestSeller: false,
    isFeatured: false,
    sku: 'GH-HYD-105',
    origin: 'Imported',
    tags: ['soft close hinges', 'cabinet hinges', 'hydraulic hinge', 'golden']
  },
  {
    slug: 'heavy-ball-bearing-drawer-slides',
    titleEn: '45mm Heavy Duty Three-Fold Soft-Close Drawer Slides',
    titleUr: '45 ملی میٹر ہیوی ڈیوٹی سافٹ کلوز دراز چینلز',
    categorySlug: 'hardware',
    categoryNameEn: 'Home Hardware',
    categoryNameUr: 'ہوم ہارڈویئر',
    subcategorySlug: 'channels',
    subcategoryNameEn: 'Drawer Channels & Runners',
    subcategoryNameUr: 'دراز کے چینلز اور رنرز',
    brand: 'Master Hardware',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/crafts.jpg',
    gallery: ['/images/crafts.jpg'],
    descriptionEn: 'Full extension 45mm cold-rolled steel telescopic drawer runner with dual spring hydraulic buffer mechanism. Supports up to 45kg dynamic load for tool and kitchen drawers.',
    descriptionUr: '45 کلوگرام تک وزن اٹھانے والے 45 ملی میٹر ہیوی بال بیئرنگ دراز چینل بمع ڈوئل اسپرنگ ہائیڈرولک بفر۔',
    featuresEn: [
      'Full extension 3-section telescopic design for 100% drawer interior access',
      'Precision solid steel ball bearings provide whisper-smooth sliding',
      'Integrated soft-close hydraulic buffer catches drawer 45mm before close',
      'Disconnect lever allows easy drawer removal without tools'
    ],
    featuresUr: [
      'مکمل دراز باہر آنے والا تھری فولڈ ڈیزائن',
      'اسٹیل بال بیئرنگ کی ہموار روانی',
      'سافٹ کلوز ہائیڈرولک بفر جو دراز کو جھٹکے کے بغیر بند کرے',
      'بغیر اوزار دراز نکالنے کے لیے ریلیز لیور'
    ],
    specs: {
      'Sizes Available': '10", 12", 14", 16", 18", 20", 22", 24" lengths',
      'Width': '45 mm',
      'Load Capacity': '45 kg per pair',
      'Material': '1.2mm High-strength cold rolled steel'
    },
    specsUr: {
      'لمبائی': '10 تا 24 انچ تمام سائزز',
      'چوڑائی': '45 ملی میٹر',
      'لوڈ صلاحیت': '45 کلوگرام فی جوڑا',
      'میٹیریل': '1.2 ملی میٹر کولڈ رولڈ اسٹیل'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: false,
    sku: 'MH-SLIDE-45',
    origin: 'Imported',
    tags: ['drawer channel', 'telescopic runner', 'soft close', 'ball bearing']
  },

  // --- BATHROOM PRODUCTS ---
  {
    slug: '1129-32-floating-vanity',
    titleEn: '1129 32" Waterproof PVC Floating Bathroom Vanity with LED Mirror',
    titleUr: '1129 32 انچ واٹر پروف پی وی سی فلوٹنگ وینٹی بمع ایل ای ڈی مرر',
    categorySlug: 'bathroom',
    categoryNameEn: 'Bathroom',
    categoryNameUr: 'باتھ روم',
    subcategorySlug: 'vanities',
    subcategoryNameEn: 'Bathroom Vanities',
    subcategoryNameUr: 'باتھ روم وینٹیز',
    brand: 'Sanita Luxury',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/shelf.jpg',
    gallery: ['/images/shelf.jpg', '/images/shelf.jpg'],
    descriptionEn: '32-inch wall-mounted 100% waterproof high-density PVC vanity with seamless glazed ceramic counter basin and smart anti-fog LED touch illuminated mirror.',
    descriptionUr: '32 انچ وال ہینگ مکمل واٹر پروف پی وی سی باتھ روم وینٹی بمع چمکدار سیرامک بیسن اور اسمارٹ اینٹی فوگ ایل ای ڈی مرر۔',
    featuresEn: [
      '100% moisture-proof and termite-proof virgin PVC board construction',
      'Seamless integrated glazed ceramic basin countertop with overflow',
      'Double soft-close drawer with U-shaped cutout for siphon pipe clearance',
      'Smart round LED mirror with defogger heating and 3-tone lighting'
    ],
    featuresUr: [
      '100 فیصد پانی اور دیمک سے محفوظ ہائی ڈینسٹی پی وی سی بورڈ',
      'چمکدار بیکڈ سیرامک سنک کاؤنٹر ٹاپ',
      'سافٹ کلوز ڈبل دراز بمع پائپ کے لیے یو شیپ کٹ آؤٹ',
      'اینٹی فوگ ہیٹر اور 3 لائٹ موڈز والا ٹچ اسکرین ایل ای ڈی مرر'
    ],
    specs: {
      'Vanity Size': '800W x 480D x 500H mm (32 inch)',
      'Mirror Size': '700 mm Diameter circular LED touch mirror',
      'Material': 'High-Density Waterproof PVC Board',
      'Basin Material': 'A-grade Vitreous Ceramic Basin',
      'Installation': 'Wall-hung mounting bracket included'
    },
    specsUr: {
      'وینٹی سائز': '800x480x500 ملی میٹر (32 انچ)',
      'شیشہ سائز': '700 ملی میٹر راؤنڈ ایل ای ڈی شیشہ',
      'میٹیریل': 'ہائی ڈینسٹی واٹر پروف پی وی سی بورڈ',
      'بیسن میٹیریل': 'گریڈ اے گلیزڈ سیرامک',
      'ماؤنٹنگ': 'وال ہینگ کٹ شامل'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: true,
    sku: 'SANITA-1129-32',
    origin: 'Imported',
    tags: ['bathroom vanity', 'floating vanity', 'pvc vanity', 'led mirror', 'sanita']
  },
  {
    slug: 'rimless-wall-hang-commode',
    titleEn: 'Rimless Tornado Flush Wall-Hung Commode with UF Soft-Close Seat',
    titleUr: 'رِم لیس ٹورنیڈو فلش وال ہینگ کموڈ بمع سافٹ کلوز سیٹ',
    categorySlug: 'bathroom',
    categoryNameEn: 'Bathroom',
    categoryNameUr: 'باتھ روم',
    subcategorySlug: 'commodes',
    subcategoryNameEn: 'Commodes & Toilets',
    subcategoryNameUr: 'کموڈز اور ٹوائلٹس',
    brand: 'Sanita Luxury',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/shelf.jpg',
    gallery: ['/images/shelf.jpg'],
    descriptionEn: 'Modern European design rimless wall-hung ceramic commode. Features powerful 360-degree tornado vortex flush technology and heavy-duty Urea Formaldehyde (UF) slim soft-close quick-release seat cover.',
    descriptionUr: 'جدید یورپین اسٹائل رِم لیس وال ہینگ کموڈ بمع 360 ڈگری طوفانی فلش اور پائیدار سافٹ کلوز سیٹ کور۔',
    featuresEn: [
      'Rimless bowl architecture eliminates hidden bacteria and limescale buildup',
      'High efficiency Tornado swirl flush cleans entire bowl surface with low water',
      'Heavy scratch-resistant Urea-Formaldehyde (UF) soft-closing slim seat',
      'Quick-release push-button buttons allow instant seat removal for cleaning'
    ],
    featuresUr: [
      'جراثیم اور کچرے کے جمنے سے پاک رِم لیس ماڈرن ڈیزائن',
      'کم پانی میں مکمل صفائی کرنے والی ٹورنیڈو فلش ٹیکنالوجی',
      'خراشوں سے محفوظ ہیوی سافٹ کلوز سلم سیٹ کور',
      'آسان صفائی کے لیے ایک بٹن سے سیٹ اتارنے کی سہولت'
    ],
    specs: {
      'Dimensions': '530L x 360W x 340H mm',
      'Mounting': 'Wall-Hung (Standard 180mm fixing centers)',
      'Flush Volume': '3 / 4.5 Litre dual flush compatible',
      'Glaze Quality': 'Nano-antibacterial self-cleaning glaze'
    },
    specsUr: {
      'پیمائش': '530x360x340 ملی میٹر',
      'ماؤنٹنگ': 'وال ہینگ (180 ملی میٹر اسٹینڈرڈ فکسنگ)',
      'فلش والیم': '3 تا 4.5 لیٹر کم پانی کا خرچ',
      'گلیز کوالٹی': 'نینو اینٹی بیکٹیریل چمکدار گلیز'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: true,
    sku: 'SANITA-WHC-08',
    origin: 'Imported',
    tags: ['wall hang commode', 'rimless toilet', 'tornado flush', 'sanitary']
  },
  {
    slug: 'thermostatic-piano-key-shower-system',
    titleEn: 'Digital Display Piano-Key Thermostatic Shower Column Gunmetal Gray',
    titleUr: 'ڈیجیٹل ڈسپلے پیانو کی تھرموسٹیٹک شاور سسٹم گن میٹل گرے',
    categorySlug: 'bathroom',
    categoryNameEn: 'Bathroom',
    categoryNameUr: 'باتھ روم',
    subcategorySlug: 'showers',
    subcategoryNameEn: 'Shower Systems',
    subcategoryNameUr: 'شاور سسٹمز',
    brand: 'Master Sanitary',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/shelf.jpg',
    gallery: ['/images/shelf.jpg'],
    descriptionEn: 'Luxury piano-button controlled concealed/exposed shower column with hydro-powered LED water temperature display, oversized air-injection rainfall shower head, 3-mode handheld spray, and high-pressure bidet jet.',
    descriptionUr: 'پانی کی طاقت سے جلنے والا ٹمپریچر ڈسپلے، پیانو پش بٹن کنٹرولز، رین شاور اور گن میٹل فنش میں شاور سسٹم۔',
    featuresEn: [
      'Self-generating hydropower digital LED display shows live water temperature without batteries',
      'Intuitive 4 piano keys to easily switch rainfall, handheld, bottom spout, and bidet spray',
      'Air-injection technology blends oxygen into water drops for a softer, invigorating shower',
      'PVD Gunmetal Gray electroplated finish resistant to lime scale and scratches'
    ],
    featuresUr: [
      'بغیر بیٹری پانی کی روانی سے چلنے والا واٹر ٹمپریچر ڈیجیٹل ڈسپلے',
      'چار پیانو کیز سے شاور موڈز بدلنے کا آسان سسٹم',
      'ہوا اور پانی کا حسین امتزاج جس سے مساج جیسا احساس ملے',
      'خراشوں اور زنگ سے محفوظ گن میٹل گرے پائیدار کوٹنگ'
    ],
    specs: {
      'Finish': 'PVD Brushed Gunmetal Gray',
      'Body Material': 'Grade-59 Solid Brass Valve Body',
      'Shower Head Size': '300 x 200 mm rectangular rainfall',
      'Height Range': '800 mm to 1200 mm telescoping height'
    },
    specsUr: {
      'فنش': 'پی وی ڈی برشڈ گن میٹل گرے',
      'میٹیریل': 'گریڈ 59 سولڈ براس والو باڈی',
      'شاور ہیڈ': '300x200 ملی میٹر بڑا رین شاور',
      'اونچائی': '800 تا 1200 ملی میٹر ایڈجسٹ ایبل'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: true,
    sku: 'MS-PIANO-GM',
    origin: 'Imported',
    tags: ['shower system', 'piano shower', 'thermostatic shower', 'gunmetal']
  },

  // --- PLYWOOD PRODUCTS ---
  {
    slug: 'marine-plywood-bwp-grade',
    titleEn: '710 BWP Grade 100% Boiling Water Proof Marine Plywood',
    titleUr: '710 BWP گریڈ 100 فیصد واٹر پروف میرین پلائی ووڈ شیٹ',
    categorySlug: 'plywood',
    categoryNameEn: 'Plywood & Boards',
    categoryNameUr: 'پلائی ووڈ اور بورڈز',
    subcategorySlug: 'marine',
    subcategoryNameEn: 'Marine Plywood (BWP / BWR)',
    subcategoryNameUr: 'میرین پلائی ووڈ (BWP / BWR واٹر پروف)',
    brand: 'Naseer Prime Marine',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/wood.jpg',
    gallery: ['/images/wood.jpg', '/images/wood.jpg'],
    descriptionEn: 'IS:710 certified Boiling Waterproof (BWP) Marine Plywood manufactured with 100% selected gurjan/hardwood veneers and bonded with high quality unextended Phenol Formaldehyde (PF) synthetic resin.',
    descriptionUr: 'IS:710 سرٹیفائیڈ میرین گریڈ واٹر پروف پلائی ووڈ جو 72 گھنٹے ابلتے پانی میں بھی نہیں پھولتی۔ کچن، باتھ روم اور نمی والے علاقوں کے لیے بہترین۔',
    featuresEn: [
      'Bonded with unextended BWP Phenol Formaldehyde resin under high heat and pressure',
      'Withstands 72 continuous hours of boiling water testing without delamination',
      'Treated with micro-refined copper-based chemicals for 100% borer and termite immunity',
      'Zero core gaps and overlap due to calibrated vacuum veneer composing'
    ],
    featuresUr: [
      'اعلیٰ درجے کے فینولک رال سے ہائی پریشر پر تیار شدہ',
      '72 گھنٹے ابلتے پانی میں رہنے کے باوجود تہیں الگ نہ ہونے کی گارنٹی',
      'دیمک اور کیڑے سے محفوظ رکھنے کے لیے خصوصی کیمیکل ٹریٹمنٹ',
      'درمیان میں بغیر خلا اور جوڑ کے یکساں اور مضبوط بناوٹ'
    ],
    specs: {
      'Standard Size': '8ft x 4ft (2440 x 1220 mm)',
      'Available Thicknesses': '6mm, 8mm, 12mm, 16mm, 18mm, 25mm',
      'Core Composition': '100% Hardwood / Gurjan Core Veneers',
      'Glue Grade': 'Phenol Formaldehyde (PF) BWP Grade Synthetic Resin',
      'Guarantee': '20 Years Showroom Replacement Guarantee against Borer/Termite'
    },
    specsUr: {
      'اسٹینڈرڈ سائز': '8 فٹ ضرب 4 فٹ (2440x1220 ملی میٹر)',
      'دستیاب موٹائیاں': '6mm, 8mm, 12mm, 16mm, 18mm, 25mm',
      'اندرونی لکڑی': '100 فیصد ہارڈ ووڈ / گرنجن کور',
      'گلو ٹائپ': 'پی ایف فینولک رال واٹر پروف',
      'گارنٹی': 'دیمک اور کیڑے کے خلاف 20 سال شوروم گارنٹی'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: true,
    sku: 'NP-MARINE-710',
    origin: 'Selected Hardwood',
    tags: ['marine plywood', 'bwp plywood', 'waterproof board', 'plywood sheet', 'sargodha']
  },
  {
    slug: 'commercial-plywood-mr-grade',
    titleEn: 'Commercial Plywood MR Grade Hardwood Core',
    titleUr: 'کمرشل پلائی ووڈ MR گریڈ ہارڈ ووڈ کور فرنیچر شیٹ',
    categorySlug: 'plywood',
    categoryNameEn: 'Plywood & Boards',
    categoryNameUr: 'پلائی ووڈ اور بورڈز',
    subcategorySlug: 'commercial',
    subcategoryNameEn: 'Commercial Plywood (MR Grade)',
    subcategoryNameUr: 'کمرشل پلائی ووڈ (MR گریڈ)',
    brand: 'Naseer Commercial',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/wood.jpg',
    gallery: ['/images/wood.jpg'],
    descriptionEn: 'High quality Moisture Resistant (MR) commercial plywood for home furniture, beds, wall paneling, and interior wardrobe cabinetry. Offers superior nail-holding strength and smooth face veneer.',
    descriptionUr: 'فرنیچر، الماریوں، بیڈز اور انٹیرئیر کے لیے پائیدار نمی سے محفوظ کمرشل پلائی ووڈ جس کی کیل پکڑنے کی صلاحیت بے مثال ہے۔',
    featuresEn: [
      'Moisture Resistant (MR) grade resin formulation for interior durability',
      'Uniform thickness with calibrated sanding for smooth veneer lamination',
      'High nail and screw holding strength prevents drawer loosening',
      'Cost-effective solution for all residential interior carpentry'
    ],
    featuresUr: [
      'گھریلو فرنیچر کے لیے نمی سے محفوظ پائیدار شیٹ',
      'سن مائیکا اور لیمینیشن کے لیے ہموار سینڈڈ سرفیس',
      'کیل اور اسکرو کی زبردست مضبوطی',
      'کفایتی اور پائیدار انتخاب برائے کارپینٹرز'
    ],
    specs: {
      'Standard Size': '8ft x 4ft (2440 x 1220 mm)',
      'Available Thicknesses': '4mm, 6mm, 8mm, 12mm, 16mm, 18mm',
      'Glue': 'Melamine Urea Formaldehyde (MUF)',
      'Usage': 'Interior Furniture, Wardrobes, Partitions'
    },
    specsUr: {
      'اسٹینڈرڈ سائز': '8 فٹ ضرب 4 فٹ',
      'دستیاب موٹائیاں': '4mm, 6mm, 8mm, 12mm, 16mm, 18mm',
      'گلو': 'میلامائن یو ایف ریزن',
      'استعمال': 'انڈور فرنیچر، الماریاں، پارٹیشنز'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: false,
    sku: 'NP-COMM-MR',
    origin: 'Kiln Dried Timber',
    tags: ['commercial plywood', 'mr grade', 'furniture board', 'plywood sheet']
  },
  {
    slug: 'high-gloss-acrylic-laminate-sheet',
    titleEn: '1.0mm Premium High-Gloss Acrylic Textured Decorative Sheet',
    titleUr: '1.0 ملی میٹر پریمیم ہائی گلوس ڈیکوریٹو لیمینیٹ شیٹ',
    categorySlug: 'plywood',
    categoryNameEn: 'Plywood & Boards',
    categoryNameUr: 'پلائی ووڈ اور بورڈز',
    subcategorySlug: 'laminates',
    subcategoryNameEn: 'Decorative Laminate Sheets (Sunmica)',
    subcategoryNameUr: 'ڈیکوریٹو لیمینیٹ شیٹس (سن مائیکا)',
    brand: 'Formica Selection',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/wood.jpg',
    gallery: ['/images/wood.jpg'],
    descriptionEn: '1.0mm mirror finish high-gloss decorative laminate sheet for modern kitchen shutters and luxury bedroom wardrobes. Highly scratch-resistant and UV stable.',
    descriptionUr: '1.0 ملی میٹر شیشے جیسی چمک والی ہائی گلوس ڈیکوریٹو لیمینیٹ شیٹ جو کچن اور الماری کے دروازوں کو انتہائی خوبصورت بناتی ہے۔',
    featuresEn: [
      'Mirror-like ultra-gloss reflective surface with deep color vibrancy',
      'Treated with hard anti-scratch protective surface coating',
      'Resistance to boiling water, domestic stains, and dry heat',
      'Matching PVC edge banding tapes available in stock'
    ],
    featuresUr: [
      'شیشے جیسا چمکدار عکس اور گہرے رنگ',
      'اینٹی اسکریچ حفاظتی کوٹنگ',
      'داغ دھبوں اور گرمی کے خلاف مزاحمت',
      'ہم رنگ پی وی سی ایج بینڈنگ ٹیپ بھی دستیاب'
    ],
    specs: {
      'Dimensions': '8ft x 4ft (2440 x 1220 mm)',
      'Thickness': '1.0 mm Heavy Duty Grade',
      'Finish': 'Crystal High Gloss / Ultra Matt',
      'Application': 'Kitchen Shutter, Wardrobe Front, Wall Paneling'
    },
    specsUr: {
      'سائز': '8 فٹ ضرب 4 فٹ',
      'موٹائی': '1.0 ملی میٹر ہیوی ڈیوٹی',
      'فنش': 'کرسٹل ہائی گلوس / الٹرا میٹ',
      'استعمال': 'کچن دروازے، الماری فرنٹ، وال پینلنگ'
    },
    inStock: true,
    isBestSeller: false,
    isFeatured: true,
    sku: 'FS-GLOSS-10',
    origin: 'Imported',
    tags: ['acrylic sheet', 'laminate', 'sunmica', 'high gloss', 'kitchen shutters']
  },
  {
    slug: 'raw-hd-mdf-board',
    titleEn: 'Heavy Density Calibrated Raw MDF / HDF Board 16mm & 18mm',
    titleUr: 'ہیوی ڈینسٹی کیلیبریٹڈ را ایم ڈی ایف اور ایچ ڈی ایف بورڈ 16mm و 18mm',
    categorySlug: 'plywood',
    categoryNameEn: 'Plywood & Boards',
    categoryNameUr: 'پلائی ووڈ اور بورڈز',
    subcategorySlug: 'mdf',
    subcategoryNameEn: 'MDF & HDF Boards',
    subcategoryNameUr: 'ایم ڈی ایف اور ایچ ڈی ایف بورڈز',
    brand: 'Naseer Wood Boards',
    priceType: 'onRequest',
    price: null,
    currency: 'PKR',
    imageUrl: '/images/wood.jpg',
    gallery: ['/images/wood.jpg'],
    descriptionEn: 'High density wood fiber board engineered for precision CNC routing, smooth duco painting, and interior acoustic cladding. Void-free structure with uniform density throughout.',
    descriptionUr: 'ہائی ڈینسٹی ووڈ فائبر بورڈ برائے سی این سی کٹنگ، ڈوکو پینٹ اور اعلیٰ انٹیرئیر فرنیچر ورک۔',
    featuresEn: [
      'Dense homogeneous core structure eliminates chipping during high-speed CNC routing',
      'Ultra-smooth double-sanded face saves primer and paint coats',
      'Calibrated precise thickness throughout the entire 8x4 sheet',
      'Low formaldehyde emission compliant with interior air safety'
    ],
    featuresUr: [
      'سی این سی جالی کٹنگ کے دوران نہ ٹوٹنے والی یکساں ڈینسٹی',
      'ہموار سرفیس جس پر پینٹ اور پالش انتہائی کم خرچ ہوتی ہے',
      'پوری شیٹ میں برابر ناپ اور موٹائی',
      'انڈور استعمال کے لیے ماحول دوست'
    ],
    specs: {
      'Sheet Size': '8ft x 4ft (2440 x 1220 mm)',
      'Density': '780 to 820 kg/m³ high density',
      'Thicknesses in stock': '3mm, 6mm, 8mm, 12mm, 16mm, 18mm',
      'Surface': 'Double Side Calibrated Sanded'
    },
    specsUr: {
      'شیٹ سائز': '8 فٹ ضرب 4 فٹ',
      'ڈینسٹی': '780 تا 820 کلوگرام فی میٹر کیوب',
      'اسٹاک موٹائی': '3mm, 6mm, 8mm, 12mm, 16mm, 18mm',
      'سرفیس': 'ڈبل سائیڈ سینڈڈ ہموار'
    },
    inStock: true,
    isBestSeller: true,
    isFeatured: false,
    sku: 'NW-MDF-RAW',
    origin: 'Certified Timber',
    tags: ['mdf board', 'hdf sheet', 'cnc carving', 'wood board', 'sargodha']
  }
];

export const BRANDS: Brand[] = [
  {
    slug: 'forza',
    name: 'Forza Hardware & Appliances',
    category: 'Kitchen Appliances & Faucets',
    country: 'Italy / International Standards',
    descriptionEn: 'Specialist in Italian-engineered high-pressure kitchen faucets, built-in electric ovens, and heavy suction range hoods.',
    descriptionUr: 'اطالوی معیار کی کچن ٹونٹیاں، بلٹ اِن اوونز اور ہیوی ڈیوٹی رینج ہوڈز کے ماہر۔',
    featuredProductsCount: 18
  },
  {
    slug: 'dorma',
    name: 'DORMA Access & Security',
    category: 'Digital Locks & Heavy Architectural Hardware',
    country: 'Germany / Global Standard',
    descriptionEn: 'World-renowned security access technology, high-security mortise deadbolts, and biometric smart fingerprint locks.',
    descriptionUr: 'عالمی معیار کے بائیو میٹرک اسمارٹ ڈور لاکس اور سیکیورٹی ڈور ہارڈویئر۔',
    featuredProductsCount: 24
  },
  {
    slug: 'sanita',
    name: 'Sanita Luxury Sanitary Ware',
    category: 'Sanitary Ware, Commodes & Vanities',
    country: 'International Vitreous Glaze',
    descriptionEn: 'Designer rimless tornado-flush wall-hung commodes, water-saving cisterns, and waterproof floating PVC vanities.',
    descriptionUr: 'رِم لیس وال ہینگ کموڈز، اسمارٹ وینٹیز اور خوبصورت واش بیسنز۔',
    featuredProductsCount: 30
  },
  {
    slug: 'naseer-prime',
    name: 'Naseer Prime Marine Plywood',
    category: 'Commercial & Marine Plywood',
    country: 'Pakistan & Selected Timber Imports',
    descriptionEn: 'Direct showroom-certified 710 Boiling Water Proof (BWP) hardwood marine plywood and heavy blockboards with 20-year borer warranty.',
    descriptionUr: 'شوروم کی تصدیق شدہ 100 فیصد واٹر پروف میرین پلائی ووڈ اور پائیدار بلاک بورڈز بمع 20 سالہ دیمک وارنٹی۔',
    featuredProductsCount: 42
  },
  {
    slug: 'golden-hardware',
    name: 'Golden Hardware fittings',
    category: 'Hinges, Channels & Furniture Accessories',
    country: 'Specialized Hardware',
    descriptionEn: 'Precision hydraulic clip-on soft-close hinges, 45mm heavy drawer slides, and architectural cabinet fittings.',
    descriptionUr: 'ہائیڈرولک سافٹ کلوز قبضے اور پائیدار بال بیئرنگ دراز چینلز۔',
    featuredProductsCount: 35
  },
  {
    slug: 'diamond-sinks',
    name: 'Diamond Stainless Steel',
    category: 'Kitchen Sinks & Wire Accessories',
    country: 'Food Grade 304 Stainless',
    descriptionEn: 'Heavy 16-gauge 1.2mm handmade single and double bowl kitchen sinks with acoustic sound proofing.',
    descriptionUr: 'ہیوی 16 گیج 1.2 ملی میٹر موٹائی میں اصلی 304 فوڈ گریڈ اسٹین لیس اسٹیل سنک۔',
    featuredProductsCount: 16
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-choose-commercial-vs-marine-plywood',
    titleEn: 'How to Choose Between Commercial (MR) and Marine (BWP) Plywood',
    titleUr: 'کمرشل پلائی ووڈ بمقابلہ میرین پلائی ووڈ: آپ کے گھر کے لیے کون سا بہتر ہے؟',
    excerptEn: 'Learn the critical differences between Moisture Resistant (MR) commercial boards and Boiling Water Proof (BWP) marine plywood for your furniture, kitchens, and wardrobes.',
    excerptUr: 'فرنیچر، کچن اور الماریوں کے لیے کمرشل اور واٹر پروف میرین پلائی ووڈ کے فرق اور انتخاب کا مکمل تفصیلی گائیڈ۔',
    date: '2026-11-10',
    readTimeEn: '5 min read',
    readTimeUr: '5 منٹ مطالعہ',
    categoryEn: 'Plywood & Carpentry',
    categoryUr: 'پلائی ووڈ اور کارپینٹری',
    imageUrl: '/images/wood.jpg',
    contentEn: [
      'When building modern home furniture or fitting out a new kitchen in Sargodha or Punjab, choosing the right grade of plywood is one of the most critical structural decisions you will make.',
      'Commercial Plywood (MR Grade): MR stands for Moisture Resistant. It is bonded with Melamine Urea Formaldehyde resin. This board is perfect for dry living spaces: bedroom wardrobes, TV wall units, study tables, and bed frames. It provides high screw-holding strength at an economical price point.',
      'Marine Plywood (BWP Grade): BWP stands for Boiling Water Proof. It is bonded with pure Phenol Formaldehyde resin and can withstand continuous boiling water testing without delamination. It is strictly mandatory for kitchen sink cabinets, bathroom vanities, exterior door frames, and areas near water piping.',
      'Summary Rule: Never use commercial MR plywood inside kitchen sink cabinets or under bathroom sinks. Always invest in 710 Grade Marine Plywood from Naseer Plywood & Hardware for peace of mind.'
    ],
    contentUr: [
      'گھر میں نیا فرنیچر یا کچن بنواتے وقت سب سے اہم فیصلہ لکڑی اور پلائی ووڈ کی صحیح گریڈ کا انتخاب ہے۔',
      'کمرشل پلائی ووڈ (MR گریڈ): یہ نمی سے محفوظ شیٹ ہوتی ہے جو عام کمروں، بیڈز، ٹی وی یونٹس اور بیڈ روم الماریوں کے لیے سستی اور پائیدار ہے۔',
      'میرین پلائی ووڈ (BWP گریڈ): یہ 100 فیصد واٹر پروف ہوتی ہے اور اس میں فینولک واٹر پروف گلو استعمال کی جاتی ہے۔ کچن سنک کیبنٹ، باتھ روم وینٹی اور گیلے حصوں کے لیے صرف یہی استعمال ہونی چاہیے۔',
      'سنہری اصول: کچن سنک کے نیچے کبھی بھی عام کمرشل پلائی ووڈ نہ لگائیں۔ ہمیشہ نصیر پلائی ووڈ سے اصلی 710 گریڈ میرین پلائی ووڈ طلب فرمائیں۔'
    ]
  },
  {
    slug: 'smart-digital-locks-buying-guide',
    titleEn: 'Smart Digital Door Locks: A Complete Homeowner Buying Guide',
    titleUr: 'اسمارٹ ڈیجیٹل ڈور لاکس: اپنے گھر کی حفاظت کے لیے درست انتخاب',
    excerptEn: 'Everything you need to know about biometric fingerprint locks, passcode security, emergency power, and door thickness requirements.',
    excerptUr: 'بائیو میٹرک فنگر پرنٹ لاکس، پاس ورڈ سسٹم اور اپنے مین گیٹ اور دروازے کی سیکیورٹی کا جامع گائیڈ۔',
    date: '2026-11-05',
    readTimeEn: '4 min read',
    readTimeUr: '4 منٹ مطالعہ',
    categoryEn: 'Security & Hardware',
    categoryUr: 'سیکیورٹی اور ہارڈویئر',
    imageUrl: '/images/crafts.jpg',
    contentEn: [
      'Modern homeowners are rapidly transitioning from traditional brass keys to smart biometric digital locks. But what should you look for before buying one for your front door?',
      '1. Biometric Semiconductor Sensors: Always prefer 3D live semiconductor fingerprint sensors over optical scanners. They cannot be fooled by silicon prints and read fingers in under 0.4 seconds.',
      '2. Mortise Heavy Lock Body: Ensure the digital lock is equipped with a multi-point 6068 stainless steel mortise body with anti-saw deadbolts to resist physical forced entry.',
      '3. Emergency Override Options: Even the most advanced smart locks must provide two failsafes: an emergency physical cylinder key and an external USB power terminal for jumpstarting if batteries ever fully deplete.',
      'Visit Naseer Plywood & Hardware on Canal Road Sargodha to test working display models before deciding.'
    ],
    contentUr: [
      'آج کل روایتی چابیوں کے بجائے بائیو میٹرک فنگر پرنٹ اسمارٹ لاکس کا رجحان تیزی سے بڑھ رہا ہے۔',
      '1. تھری ڈی سیمی کنڈکٹر سینسر: ہمیشہ اصلی فنگر پرنٹ سینسر کا انتخاب کریں جو انگلی کی گرمی اور نبض محسوس کرے اور سیکنڈ کے دسویں حصے میں دروازہ کھولے۔',
      '2. ہیوی اسٹیل مورٹائز باڈی: یقینی بنائیں کہ تالے کے اندر 6068 اسٹین لیس اسٹیل کی مضبوط پلیٹ ہو جو کٹائی اور زبردستی توڑنے سے محفوظ ہو۔',
      '3. ایمرجنسی بیک اپ: لاک میں روایتی چابی اور بیٹری ختم ہونے کی صورت میں بیرونی یو ایس بی چارجنگ پوائنٹ کا ہونا لازمی ہے۔',
      'نصیر ہارڈویئر سرگودھا کے شوروم پر تشریف لائیں اور مختلف ماڈلز کا خود تجربہ کریں۔'
    ]
  },
  {
    slug: 'modular-kitchen-hardware-essentials',
    titleEn: '5 Essential Hardware Fittings Every Modern Kitchen Needs',
    titleUr: 'جدید ماڈیولر کچن کے 5 لازمی ہارڈویئر فٹنگز',
    excerptEn: 'Discover how hydraulic soft-close hinges, tall pantry pullouts, and high-gauge stainless sinks transform your cooking experience.',
    excerptUr: 'ہائیڈرولک نرم قبضے، پینٹری یونٹس اور معیاری سنک کس طرح آپ کے کچن کو آرام دہ اور خوبصورت بناتے ہیں۔',
    date: '2026-10-28',
    readTimeEn: '6 min read',
    readTimeUr: '6 منٹ مطالعہ',
    categoryEn: 'Kitchen Fittings',
    categoryUr: 'کچن فٹنگز',
    imageUrl: '/images/shelf.jpg',
    contentEn: [
      'A great kitchen is not just about beautiful marble and glossy shutters—it is about the engineering inside the cabinets that you touch 50 times every day.',
      '1. Hydraulic Soft-Close Hinges: Eliminate loud cabinet door banging with clip-on hydraulic hinges rated for 80,000 cycles.',
      '2. Full-Extension Drawer Runners: Standard runners hide 30% of your drawer at the back. Full extension ball-bearing runners pull out completely so every spice jar is in plain sight.',
      '3. Tall Pantry Pull-Out Units: Turn a narrow 18-inch tall cabinet into a grocery powerhouse holding up to 80kg of supplies on 6 adjustable baskets.',
      '4. Food-Grade 304 Handmade Sinks: Choose thick 1.2mm handmade sinks with acoustic undercoating to prevent loud running water noise.',
      '5. Pull-Down Spray Sink Mixers: Easily rinse vegetables and clean large karahi pots with 360-degree flexible hoses.'
    ],
    contentUr: [
      'شاندار کچن صرف باہر کی چمک دمک کا نام نہیں بلکہ کیبنٹ کے اندر لگی فٹنگز کا کمال ہے جنہیں آپ روزانہ درجنوں بار استعمال کرتے ہیں۔',
      '1. ہائیڈرولک سافٹ کلوز قبضے: دروازوں کی کھٹ کھٹ کی آوازوں سے نجات اور دیرپا حفاظت۔',
      '2. فل ایکسٹینشن دراز چینلز: دراز کو مکمل باہر نکالیں تاکہ آخری کونے میں رکھی چیز بھی آسانی سے مل جائے۔',
      '3. ٹال پینٹری پل آؤٹ یونٹس: صرف 18 انچ جگہ میں پورے مہینے کا راشن ترتیب سے محفوظ کریں۔',
      '4. فوڈ گریڈ 304 ہینڈ میڈ سنک: موٹے اسٹیل اور ساؤنڈ پیڈز والے سنک جو پانی کی آواز کو دبا دیں۔',
      '5. فلیکسیبل پل ڈاؤن مکسرز: بڑے برتن اور سبزی دھونے کے لیے لچکدار گھومنے والی ٹونٹیاں۔'
    ]
  }
];

// Helper functions for easy querying
export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsBySubcategory(categorySlug: string, subcategorySlug: string): Product[] {
  return PRODUCTS.filter(
    (p) => p.categorySlug === categorySlug && p.subcategorySlug === subcategorySlug
  );
}

export function getRelatedProducts(currentSlug: string, categorySlug: string, limit = 4): Product[] {
  return PRODUCTS.filter((p) => p.slug !== currentSlug && p.categorySlug === categorySlug).slice(0, limit);
}

export function getAllCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getAllSubcategories(): { categorySlug: string; subcategory: Subcategory }[] {
  const result: { categorySlug: string; subcategory: Subcategory }[] = [];
  CATEGORIES.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      result.push({ categorySlug: cat.slug, subcategory: sub });
    });
  });
  return result;
}

export function getAllBrands(): Brand[] {
  return BRANDS;
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
