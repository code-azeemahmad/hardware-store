"""Database Seeder for Hardware & Plywood Store Catalogue.

Populates categories, brands, attributes, products, images, and variants.
Clearly separates sample development records from production inventory.
Idempotent: skips existing records matching slugs.
"""
import uuid
from decimal import Decimal
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.category import Category
from app.models.product import (
    Attribute,
    Brand,
    Product,
    ProductAttributeValue,
    ProductImage,
    ProductVariant,
    StockStatus,
)


def seed_database(db: Session, force_production: bool = False) -> dict[str, int]:
    # Production Safeguard: Never seed development demo data in production
    if getattr(settings, "APP_ENV", "") == "production" and not force_production:
        raise RuntimeError(
            "Database seeding of sample development data is strictly disabled in production. "
            "Use the admin dashboard or pass force_production=True if intentionally seeding a staging environment."
        )

    counts = {
        "categories": 0,
        "brands": 0,
        "attributes": 0,
        "products": 0,
        "images": 0,
        "variants": 0,
    }

    # --------------------------------------------------------------------------
    # 1. Brands
    # --------------------------------------------------------------------------
    brands_data = [
        {
            "slug": "hafele",
            "name": "Häfele",
            "logo_url": "/brands/hafele.svg",
            "description_en": "World-renowned German manufacturer of architectural hardware, furniture fittings, and smart electronic locks.",
            "description_ur": "جرمنی کا مشہور ترین برانڈ برائے آرکیٹیکچرل ہارڈویئر، فرنیچر فٹنگز اور اسمارٹ الیکٹرانک لاکس۔",
            "website_url": "https://www.hafele.com",
            "sort_order": 1,
        },
        {
            "slug": "blum",
            "name": "Blum",
            "logo_url": "/brands/blum.svg",
            "description_en": "Austrian manufacturer of high-precision lift mechanisms, soft-close hinges, and premium drawer box runner systems.",
            "description_ur": "آسٹریا کا عالمی شہرت یافتہ برانڈ برائے لفٹ سسٹمز، سافٹ کلوز قلابے اور پریمیم دراز رنرز۔",
            "website_url": "https://www.blum.com",
            "sort_order": 2,
        },
        {
            "slug": "hettich",
            "name": "Hettich",
            "logo_url": "/brands/hettich.svg",
            "description_en": "German precision engineering for modern intelligent kitchen drawer slides, hinges, and sliding door mechanisms.",
            "description_ur": "جدید کچن دراز، ہائیڈرولک قلابے اور سلائیڈنگ ڈور سسٹمز میں جرمن انجنیئرنگ کا شاہکار۔",
            "website_url": "https://www.hettich.com",
            "sort_order": 3,
        },
        {
            "slug": "diamond-supreme",
            "name": "Diamond Supreme Plywood",
            "logo_url": "/brands/diamond-supreme.svg",
            "description_en": "Pakistan's benchmark for BWP Grade 710 marine plywood, boiling water resistant core panels, and commercial wood sheets.",
            "description_ur": "پاکستان میں بی ڈبلیو پی گریڈ 710 واٹر پروف میرین پلائی ووڈ اور کمرشل لکڑی کا معیاری نام۔",
            "website_url": None,
            "sort_order": 4,
        },
        {
            "slug": "al-noor",
            "name": "Al-Noor MDF Board",
            "logo_url": "/brands/al-noor.svg",
            "description_en": "Leading producer of premium high-density MDF boards, melamine-faced sheets, and tactile woodgrain textures.",
            "description_ur": "ہائی ڈینسٹی ایم ڈی ایف شیٹس اور ٹیکسچرڈ ملامین ووڈ بورڈز کا معروف پروڈیوسر۔",
            "website_url": None,
            "sort_order": 5,
        },
        {
            "slug": "master-sanitary",
            "name": "Master Sanitary",
            "logo_url": "/brands/master-sanitary.svg",
            "description_en": "Heavy brass bathroom faucets, kitchen sink mixers, and luxury architectural sanitary fittings.",
            "description_ur": "ہیوی براس باتھ روم مکسرز، کچن ٹونٹیاں اور لگژری سینیٹری فٹنگز۔",
            "website_url": None,
            "sort_order": 6,
        },
    ]

    brand_map: dict[str, Brand] = {}
    for b_data in brands_data:
        existing = db.query(Brand).filter(Brand.slug == b_data["slug"]).first()
        if not existing:
            brand = Brand(**b_data)
            db.add(brand)
            db.flush()
            brand_map[brand.slug] = brand
            counts["brands"] += 1
        else:
            brand_map[existing.slug] = existing

    # --------------------------------------------------------------------------
    # 2. Categories Hierarchy (Kitchen, Hardware, Bathroom, Plywood)
    # --------------------------------------------------------------------------
    root_categories = [
        {
            "slug": "kitchen",
            "name_en": "Kitchen",
            "name_ur": "کچن",
            "description_en": "Modern kitchen sinks, designer mixer faucets, pantry storage units, and architectural drawer fittings.",
            "description_ur": "جدید کچن سنک، ڈیزائنر مکسر فوسٹس، پینٹری یونٹس اور آرکیٹیکچرل دراز فٹنگز۔",
            "sort_order": 1,
            "meta_title_en": "Kitchen Sinks, Faucets & Storage Accessories | Naseer Plywood Sargodha",
            "meta_title_ur": "کچن سنک، فوسٹس اور کیبنٹ اسیسریز | نصیر پلائی ووڈ سرگودھا",
            "children": [
                {
                    "slug": "kitchen-sinks",
                    "name_en": "Kitchen Sinks",
                    "name_ur": "کچن سنک",
                    "description_en": "Stainless steel 304 handmade single and double bowl sinks, sound-dampened with drainers.",
                    "description_ur": "سٹین لیس سٹیل 304 ہینڈ میڈ سنگل اور ڈبل باؤل کچن سنک۔",
                    "sort_order": 1,
                },
                {
                    "slug": "kitchen-faucets",
                    "name_en": "Kitchen Faucets",
                    "name_ur": "کچن مکسر اور فوسٹس",
                    "description_en": "Pull-out brass sink mixers, 360-degree swivel spouts, and matte black deck-mount faucets.",
                    "description_ur": "پل آؤٹ براس کچن مکسرز اور میٹ بلیک ڈیک ماؤنٹ فوسٹس۔",
                    "sort_order": 2,
                },
                {
                    "slug": "kitchen-accessories",
                    "name_en": "Kitchen Accessories",
                    "name_ur": "کچن اسیسریز",
                    "description_en": "Pantry pullouts, corner magic carousels, spice racks, and heavy-duty dish drainers.",
                    "description_ur": "پینٹری پل آؤٹ، کارنر میجک کاروسل، اسپائس ریکس اور ڈش ڈرینرز۔",
                    "sort_order": 3,
                },
            ],
        },
        {
            "slug": "hardware",
            "name_en": "Home Hardware",
            "name_ur": "ہوم ہارڈویئر",
            "description_en": "Architectural door handles, smart digital locks, concealed hinges, and precision cabinet fittings.",
            "description_ur": "آرکیٹیکچرل ڈور ہینڈلز، اسمارٹ ڈیجیٹل لاکس، ہائیڈرولک قلابے اور پریمیم کیبنٹ فٹنگز۔",
            "sort_order": 2,
            "meta_title_en": "Door Handles, Smart Locks & Hinges | Naseer Plywood Sargodha",
            "meta_title_ur": "ڈور ہینڈلز، اسمارٹ لاکس اور ہارڈویئر فٹنگز | نصیر پلائی ووڈ سرگودھا",
            "children": [
                {
                    "slug": "door-handles",
                    "name_en": "Door Handles",
                    "name_ur": "ڈور ہینڈلز",
                    "description_en": "Solid brass mortise lever handles, contemporary pull handles, and minimalist rosette designs.",
                    "description_ur": "براس مورٹائز لیور ہینڈلز اور جدید مین ڈور پل ہینڈلز۔",
                    "sort_order": 1,
                },
                {
                    "slug": "door-locks",
                    "name_en": "Door Locks",
                    "name_ur": "دروازوں کے تالے اور اسمارٹ لاکس",
                    "description_en": "High-security cylinder mortise locks, biometric fingerprint digital locks, and rim deadbolts.",
                    "description_ur": "ہائی سیکیورٹی سلنڈر مورٹائز تالے اور بائیو میٹرک فنگر پرنٹ اسمارٹ لاکس۔",
                    "sort_order": 2,
                },
                {
                    "slug": "hinges-fittings",
                    "name_en": "Hinges & Fittings",
                    "name_ur": "قلابے اور فٹنگز",
                    "description_en": "Hydraulic soft-close cabinet hinges, stainless steel ball-bearing door hinges, and heavy pivots.",
                    "description_ur": "ہائیڈرولک سافٹ کلوز کیبنٹ قلابے اور بال بیئرنگ ڈور ہنگز۔",
                    "sort_order": 3,
                },
            ],
        },
        {
            "slug": "bathroom",
            "name_en": "Bathroom",
            "name_ur": "باتھ روم",
            "description_en": "Vitreous china sanitary ware, rimless wall-hung commodes, water-saving mixers, vanities, and rain shower columns.",
            "description_ur": "ہائی کوالٹی سینیٹری ویئر، رِم لیس وال ہینگ کموڈز، واٹر سیونگ مکسرز، وینٹیز اور شاور پینلز۔",
            "sort_order": 3,
            "meta_title_en": "Luxury Bathroom Vanities, Commodes & Sanitary Ware | Naseer Plywood Sargodha",
            "meta_title_ur": "لگژری باتھ روم وینٹیز، کموڈز اور سینیٹری ویئر | نصیر پلائی ووڈ سرگودھا",
            "children": [
                {
                    "slug": "vanities",
                    "name_en": "Bathroom Vanities",
                    "name_ur": "باتھ روم وینٹیز",
                    "description_en": "Waterproof PVC and solid surface floating bathroom vanities with LED smart touch mirrors.",
                    "description_ur": "واٹر پروف پی وی سی اور سولڈ سرفیس وال ہینگ وینٹیز بمع اسمارٹ ایل ای ڈی مرر۔",
                    "sort_order": 1,
                },
                {
                    "slug": "commodes",
                    "name_en": "Commodes & Toilets",
                    "name_ur": "کموڈز اور ٹوائلٹس",
                    "description_en": "Rimless wall-hung European water closets, one-piece floor toilets, and dual-flush water-saving systems.",
                    "description_ur": "رِم لیس وال ہینگ کموڈز، ون پیس فلور کموڈز اور ڈوئل فلش سسٹم۔",
                    "sort_order": 2,
                },
                {
                    "slug": "showers",
                    "name_en": "Shower Systems",
                    "name_ur": "شاور سسٹمز",
                    "description_en": "Thermostatic rainfall shower columns, multi-function hand showers, and concealed ceiling heads.",
                    "description_ur": "تھرموسٹیٹک رین شاور کالمز، ملٹی فنکشن ہینڈ شاور اور کنسیلڈ سیلنگ شاورز۔",
                    "sort_order": 3,
                },
                {
                    "slug": "basins",
                    "name_en": "Wash Basins",
                    "name_ur": "واش بیسنز",
                    "description_en": "Tabletop artistic ceramic basins, under-counter sinks, and glazed stone counter basins.",
                    "description_ur": "ٹیبل ٹاپ آرٹسٹک سیرامک بیسنز، انڈر کاؤنٹر سنک اور گلیزڈ بیسنز۔",
                    "sort_order": 4,
                },
                {
                    "slug": "bathroom-faucets",
                    "name_en": "Bathroom Faucets & Mixers",
                    "name_ur": "باتھ روم ٹونٹیاں اور مکسرز",
                    "description_en": "Tall basin mixers, concealed wall-mounted basin taps, and bidet sprayers.",
                    "description_ur": "ٹال بیسن مکسرز، کنسیلڈ وال ماؤنٹڈ نل اور مسلم شاور سپرے۔",
                    "sort_order": 5,
                },
                {
                    "slug": "bathroom-accessories",
                    "name_en": "Bathroom Accessories",
                    "name_ur": "باتھ روم اسیسریز",
                    "description_en": "Towel rails, glass shelves, soap dispensers, paper holders, and robe hooks.",
                    "description_ur": "تولیہ ریل، گلاس شیلف، صابن ڈسپنسر، پیپر ہولڈر اور ہوکس۔",
                    "sort_order": 6,
                },
            ],
        },
        {
            "slug": "plywood",
            "name_en": "Plywood & Sheets",
            "name_ur": "پلائی ووڈ اور ووڈ شیٹس",
            "description_en": "Commercial grade plywood, waterproof BWP marine plywood, high-density MDF boards, and laminated veneers.",
            "description_ur": "کمرشل پلائی ووڈ، 100٪ واٹر پروف میرین پلائی ووڈ اور ہائی ڈینسٹی ایم ڈی ایف بورڈز۔",
            "sort_order": 4,
            "meta_title_en": "Marine Plywood, Commercial Wood & MDF Sheets | Naseer Plywood Sargodha",
            "meta_title_ur": "میرین پلائی ووڈ اور کمرشل ایم ڈی ایف شیٹس | نصیر پلائی ووڈ سرگودھا",
            "children": [
                {
                    "slug": "commercial-plywood",
                    "name_en": "Commercial Plywood",
                    "name_ur": "کمرشل پلائی ووڈ",
                    "description_en": "Multi-layer hardwood core sheets for interior furniture, wardrobes, and commercial paneling.",
                    "description_ur": "اندرونی فرنیچر اور الماریوں کے لیے معیاری کمرشل پلائی ووڈ شیٹس۔",
                    "sort_order": 1,
                },
                {
                    "slug": "marine-plywood",
                    "name_en": "Marine & Waterproof Plywood",
                    "name_ur": "میرین واٹر پروف پلائی ووڈ",
                    "description_en": "BWP Grade 710 boiling waterproof plywood for wet areas, kitchens, bathrooms, and exterior joinery.",
                    "description_ur": "بی ڈبلیو پی 710 گریڈ بوائلنگ واٹر پروف پلائی ووڈ برائے کچن اور باتھ رومز۔",
                    "sort_order": 2,
                },
                {
                    "slug": "mdf-sheets",
                    "name_en": "MDF & Laminated Sheets",
                    "name_ur": "ایم ڈی ایف اور لیمینیٹڈ شیٹس",
                    "description_en": "Smooth high-density fiberboard and tactile melamine embossed decorative sheets.",
                    "description_ur": "ہموار ہائی ڈینسٹی فائبر بورڈ اور لیمینیٹڈ ڈیکوریٹو شیٹس۔",
                    "sort_order": 3,
                },
            ],
        },
    ]

    category_map: dict[str, Category] = {}
    for r_data in root_categories:
        kids = r_data.pop("children", [])
        existing = db.query(Category).filter(Category.slug == r_data["slug"]).first()
        if not existing:
            parent = Category(**r_data)
            db.add(parent)
            db.flush()
            category_map[parent.slug] = parent
            counts["categories"] += 1
        else:
            parent = existing
            category_map[parent.slug] = parent

        for k_data in kids:
            k_existing = db.query(Category).filter(Category.slug == k_data["slug"]).first()
            if not k_existing:
                child = Category(**k_data, parent_id=parent.id)
                db.add(child)
                db.flush()
                category_map[child.slug] = child
                counts["categories"] += 1
            else:
                category_map[k_existing.slug] = k_existing

    # --------------------------------------------------------------------------
    # 3. Dynamic Attributes
    # --------------------------------------------------------------------------
    attributes_data = [
        {"slug": "material", "name_en": "Material", "name_ur": "میٹریل", "is_filterable": True, "sort_order": 1},
        {"slug": "finish", "name_en": "Finish / Color", "name_ur": "فنش اور رنگ", "is_filterable": True, "sort_order": 2},
        {"slug": "thickness", "name_en": "Thickness", "name_ur": "موٹائی", "is_filterable": True, "sort_order": 3},
        {"slug": "origin", "name_en": "Country of Origin", "name_ur": "مینوفیکچرنگ ملک", "is_filterable": False, "sort_order": 4},
        {"slug": "warranty", "name_en": "Warranty", "name_ur": "وارنٹی", "is_filterable": False, "sort_order": 5},
    ]

    attr_map: dict[str, Attribute] = {}
    for a_data in attributes_data:
        existing_a = db.query(Attribute).filter(Attribute.slug == a_data["slug"]).first()
        if not existing_a:
            attr = Attribute(**a_data)
            db.add(attr)
            db.flush()
            attr_map[attr.slug] = attr
            counts["attributes"] += 1
        else:
            attr_map[existing_a.slug] = existing_a

    # --------------------------------------------------------------------------
    # 4. Products, Images, Attributes, Variants (Clearly Labeled Demo Records)
    # --------------------------------------------------------------------------
    products_seed = [
        {
            "slug": "commercial-mdf-sheet-18mm",
            "sku": "NP-MDF-18MM",
            "name_en": "Commercial MDF Sheet 18mm",
            "name_ur": "کمرشل ایم ڈی ایف شیٹ 18 ملی میٹر",
            "short_description_en": "Premium high-density 18mm fiberboard with ultra-smooth surface for CNC routing, cabinetry, and decorative paint work.",
            "short_description_ur": "پریمیم ہائی ڈینسٹی 18 ملی میٹر فائبر بورڈ برائے کیبنٹس، سی این سی کٹنگ اور کلر پینٹ۔",
            "description_en": "[Sample Development Record] Manufactured using high-pressure thermo-bonding technology. Ideal for interior cabinetry, wardrobes, decorative wall panels, and CNC carving with zero internal voids.",
            "description_ur": "[سیمپل ریکارڈ] اعلیٰ معیار کے ہائی پریشر تھرمو بانڈنگ سے تیار کردہ ایم ڈی ایف شیٹ۔ الماریوں، کچن کیبنٹس اور سی این سی ڈیزائننگ کے لیے بہترین۔",
            "price": None,
            "price_on_request": True,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": True,
            "is_best_seller": True,
            "brand_slug": "al-noor",
            "category_slugs": ["mdf-sheets", "plywood"],
            "specifications": {
                "Standard Sheet Size": "8 ft x 4 ft (2440mm x 1220mm)",
                "Thickness": "18 mm",
                "Density": "750 - 780 kg/m³",
                "Surface": "Double Sanded Smooth Face",
                "Usage": "Interior Furniture, Paneling, Kitchen Shutters",
            },
            "images": [
                {"image_url": "/images/products/mdf-18mm-front.jpg", "alt_text_en": "Commercial MDF Sheet 18mm Surface", "sort_order": 1, "is_primary": True},
                {"image_url": "/images/products/mdf-18mm-edge.jpg", "alt_text_en": "Core Density Profile 18mm", "sort_order": 2, "is_primary": False},
            ],
            "attribute_values": [
                ("material", "High-Density Wood Fiber", "ہائی ڈینسٹی ووڈ فائبر"),
                ("origin", "Pakistan", "پاکستان"),
                ("warranty", "Standard Quality Guarantee", "معیاری کوالٹی گارنٹی"),
            ],
            "variants": [
                {
                    "sku": "NP-MDF-12MM",
                    "name_en": "Commercial MDF Sheet 12mm",
                    "name_ur": "کمرشل ایم ڈی ایف شیٹ 12 ملی میٹر",
                    "price": None,
                    "price_on_request": True,
                    "stock_status": StockStatus.IN_STOCK,
                    "sort_order": 1,
                },
                {
                    "sku": "NP-MDF-18MM",
                    "name_en": "Commercial MDF Sheet 18mm",
                    "name_ur": "کمرشل ایم ڈی ایف شیٹ 18 ملی میٹر",
                    "price": None,
                    "price_on_request": True,
                    "stock_status": StockStatus.IN_STOCK,
                    "sort_order": 2,
                },
                {
                    "sku": "NP-MDF-24MM",
                    "name_en": "Commercial MDF Sheet 24mm",
                    "name_ur": "کمرشل ایم ڈی ایف شیٹ 24 ملی میٹر",
                    "price": None,
                    "price_on_request": True,
                    "stock_status": StockStatus.ORDER_BASED,
                    "sort_order": 3,
                },
            ],
        },
        {
            "slug": "marine-plywood-bwp-grade",
            "sku": "NP-PLY-BWP-710",
            "name_en": "Marine Plywood BWP 710 Grade",
            "name_ur": "میرین پلائی ووڈ بی ڈبلیو پی 710 گریڈ",
            "short_description_en": "100% boiling water proof marine plywood with preservative-treated Gurjan core layers for lifetime moisture resistance.",
            "short_description_ur": "100٪ بوائلنگ واٹر پروف میرین پلائی ووڈ برائے کچن کیبنٹس اور نم آلود جگہیں، گرجن کور کے ساتھ۔",
            "description_en": "[Sample Development Record] High-durability exterior-grade marine sheet bonded with unextended phenol formaldehyde (PF) resin under extreme temperature and pressure.",
            "description_ur": "[سیمپل ریکارڈ] اعلیٰ پائے کی واٹر پروف لکڑی جو طویل عرصے تک نمی اور پانی کے خلاف پائیدار رہتی ہے۔",
            "price": None,
            "price_on_request": True,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": True,
            "is_best_seller": True,
            "brand_slug": "diamond-supreme",
            "category_slugs": ["marine-plywood", "plywood"],
            "specifications": {
                "Grade Standard": "IS:710 Marine Grade BWP",
                "Standard Sheet Size": "8 ft x 4 ft",
                "Bonding Resin": "100% Phenol Formaldehyde (PF)",
                "Boiling Water Test": "Exceeds 72 Hours Boiling Resistance",
                "Treatment": "Vacuum Pressure Anti-Termite & Anti-Borer",
            },
            "images": [
                {"image_url": "/images/products/marine-plywood-front.jpg", "alt_text_en": "Marine Plywood Sheet Texture", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "Selected Gurjan / Hardwood Core", "گرجن اور ہارڈووڈ کور"),
                ("origin", "Pakistan", "پاکستان"),
                ("warranty", "Lifetime BWP Replacement Warranty", "لائف ٹائم واٹر پروف گارنٹی"),
            ],
            "variants": [
                {
                    "sku": "NP-PLY-BWP-16",
                    "name_en": "Marine Plywood BWP 16mm",
                    "name_ur": "میرین پلائی ووڈ 16 ملی میٹر",
                    "price": None,
                    "price_on_request": True,
                    "stock_status": StockStatus.IN_STOCK,
                    "sort_order": 1,
                },
                {
                    "sku": "NP-PLY-BWP-19",
                    "name_en": "Marine Plywood BWP 19mm",
                    "name_ur": "میرین پلائی ووڈ 19 ملی میٹر",
                    "price": None,
                    "price_on_request": True,
                    "stock_status": StockStatus.IN_STOCK,
                    "sort_order": 2,
                },
            ],
        },
        {
            "slug": "ds-681-smart-door-lock",
            "sku": "NP-LCK-HAF-681",
            "name_en": "DS-681 Smart Digital Door Lock",
            "name_ur": "ڈی ایس 681 اسمارٹ ڈیجیٹل ڈور لاک",
            "short_description_en": "5-in-1 keyless biometric mortise door lock with semiconductor 360° fingerprint scanner, RFID card, and anti-peep PIN keypad.",
            "short_description_ur": "5 ان 1 بغیر چابی کے بائیو میٹرک فنگر پرنٹ اسمارٹ ڈور لاک بمع RFID کارڈ اور ڈیجیٹل کوڈ۔",
            "description_en": "[Sample Development Record] High-security residential entrance digital electronic lock with auto-locking motor mortise, emergency mechanical override key, and mobile Bluetooth app access.",
            "description_ur": "[سیمپل ریکارڈ] جدید گھروں اور دفاتر کے داخلی دروازوں کے لیے فول پروف سیکیورٹی لاک۔",
            "price": Decimal("38500.00"),
            "price_on_request": False,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": True,
            "is_best_seller": True,
            "brand_slug": "hafele",
            "category_slugs": ["door-locks", "hardware"],
            "specifications": {
                "Access Methods": "Fingerprint, RFID Card, PIN Code, Mobile App, Physical Key",
                "Fingerprint Sensor": "Semiconductor FPC Live Bio-Scanner (< 0.3s)",
                "User Capacity": "100 Fingerprints, 100 RFID Cards, 10 PINs",
                "Door Thickness Fit": "35 mm to 65 mm Timber or Metal Doors",
                "Power Source": "4x AA Alkaline Batteries with USB-C Emergency Backup",
            },
            "images": [
                {"image_url": "/images/products/smart-lock-front.jpg", "alt_text_en": "DS-681 Smart Digital Lock Front Handle", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "Aviation Grade Aluminum Alloy", "ایوی ایشن الائے میٹریل"),
                ("finish", "Matte Obsidian Black", "میٹ اوبسیڈین بلیک"),
                ("origin", "Germany", "جرمنی"),
                ("warranty", "3 Years Manufacturer Warranty", "3 سال مینوفیکچرر وارنٹی"),
            ],
            "variants": [],
        },
        {
            "slug": "undermount-double-bowl-kitchen-sink",
            "sku": "NP-SNK-HAF-DB",
            "name_en": "Undermount Double Bowl Kitchen Sink 32-inch",
            "name_ur": "انڈر ماؤنٹ ڈبل باؤل کچن سنک 32 انچ",
            "short_description_en": "Handcrafted SUS 304 16-gauge stainless steel kitchen sink with 10mm tight-radius corners and acoustic sound-dampening pads.",
            "short_description_ur": "ہینڈ میڈ سٹین لیس سٹیل 304 ڈبل باؤل کچن سنک، ساؤنڈ پروفنگ پیڈز کے ساتھ۔",
            "description_en": "[Sample Development Record] Heavy commercial 1.2mm thickness undermount double bowl sink designed for luxury granite and quartz countertops.",
            "description_ur": "[سیمپل ریکارڈ] گرینائٹ اور ماربل سلیب کے لیے پائیدار انڈر ماؤنٹ ڈبل کچن سنک۔",
            "price": None,
            "price_on_request": True,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": False,
            "is_best_seller": True,
            "brand_slug": "hafele",
            "category_slugs": ["kitchen-sinks", "kitchen"],
            "specifications": {
                "Overall Dimensions": "820 mm x 450 mm x 220 mm (32 x 18 x 9 in)",
                "Material Grade": "SUS 304 Commercial Food-Grade Stainless Steel",
                "Gauge Thickness": "16 Gauge (1.5mm Rim, 1.2mm Basin)",
                "Corner Radius": "R10 Tight Radius for Easy Cleaning",
                "Drain Size": "3.5-inch Standard Waste Disposal Ready",
            },
            "images": [
                {"image_url": "/images/products/sink-double-bowl.jpg", "alt_text_en": "Undermount Double Bowl Sink", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "SUS 304 Stainless Steel", "سٹین لیس سٹیل 304"),
                ("finish", "Brushed Satin Stainless", "برشڈ سیٹن سٹیل"),
                ("origin", "Imported", "امپورٹڈ"),
                ("warranty", "10 Years Anti-Rust Guarantee", "10 سال زنگ سے بچاؤ کی گارنٹی"),
            ],
            "variants": [],
        },
        {
            "slug": "19905-sink-mixer",
            "sku": "NP-MXR-MST-19905",
            "name_en": "19905 Pull-Down Dual-Function Kitchen Sink Mixer",
            "name_ur": "19905 پل ڈاؤن ڈوئل فنکشن کچن سنک مکسر",
            "short_description_en": "Commercial solid brass deck-mount kitchen tap with 360-degree swivel spout and dual stream/spray pull-down hose.",
            "short_description_ur": "ہیوی براس پل ڈاؤن کچن مکسر، 360 ڈگری گھومنے والے پائپ اور دوہرے اسپرے کے ساتھ۔",
            "description_en": "[Sample Development Record] Heavyweight kitchen sink mixer featuring a European ceramic disc cartridge tested to 500,000 cycles and high-temperature nylon braided pullout hose.",
            "description_ur": "[سیمپل ریکارڈ] اعلیٰ کوالٹی براس باڈی اور دیرپا سیرامک کارٹریج سے مزین کچن مکسر۔",
            "price": Decimal("14500.00"),
            "price_on_request": False,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": True,
            "is_best_seller": True,
            "brand_slug": "master-sanitary",
            "category_slugs": ["kitchen-faucets", "kitchen"],
            "specifications": {
                "Spout Height": "420 mm High-Arch Clearance",
                "Spout Reach": "230 mm Projection",
                "Cartridge Type": "35 mm Sedal Ceramic Disc Cartridge",
                "Flow Modes": "Aerated Laminar Stream & High-Velocity Rinse Spray",
                "Installation": "Single Hole Deck Mount (35mm-38mm cutout)",
            },
            "images": [
                {"image_url": "/images/products/sink-mixer-19905.jpg", "alt_text_en": "19905 Kitchen Sink Mixer", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "Solid DR Brass Alloy", "ہیوی براس میٹریل"),
                ("finish", "Electroplated Matte Black", "میٹ بلیک فنش"),
                ("origin", "Pakistan", "پاکستان"),
                ("warranty", "5 Years Replacement Guarantee", "5 سال گارنٹی"),
            ],
            "variants": [],
        },
        {
            "slug": "hafele-metalla-110-hinge",
            "sku": "NP-HNG-METALLA",
            "name_en": "Häfele Metalla 110° Soft-Close Concealed Hinge",
            "name_ur": "ہیفلے میٹالا 110 ڈگری سافٹ کلوز قلابہ",
            "short_description_en": "German engineered clip-on furniture hinge with integrated hydraulic piston damper for silent, controlled door closure.",
            "short_description_ur": "جرمن ٹیکنالوجی سے لیس سافٹ کلوز الماری قلابہ، خاموش اور پائیدار۔",
            "description_en": "[Sample Development Record] High-durability concealed furniture hinge for wardrobe shutters and kitchen cabinets. Features 3-way eccentric cam adjustment for rapid door alignment.",
            "description_ur": "[سیمپل ریکارڈ] کچن الماریوں اور کیبنٹس کے لیے معیاری سافٹ کلوز ہنگز۔",
            "price": Decimal("650.00"),
            "price_on_request": False,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": False,
            "is_best_seller": True,
            "brand_slug": "hafele",
            "category_slugs": ["hinges-fittings", "hardware"],
            "specifications": {
                "Opening Angle": "110 Degrees",
                "Damper Mechanism": "Integrated Hydraulic Piston Damper",
                "Cup Diameter": "35 mm Standard Bore",
                "Drilling Depth": "11.5 mm",
                "Crank Type": "Full Overlay (0mm Crank)",
            },
            "images": [
                {"image_url": "/images/products/metalla-hinge.jpg", "alt_text_en": "Häfele Metalla 110 Hinge", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "High-Grade Cold Rolled Steel", "کولڈ رولڈ سٹیل"),
                ("finish", "Corrosion-Resistant Nickel Plating", "نکل پلیٹڈ فنش"),
                ("origin", "Germany", "جرمنی"),
                ("warranty", "50,000 Cycles Guarantee", "50 ہزار سائیکل ٹیسٹڈ"),
            ],
            "variants": [],
        },
        {
            "slug": "hydraulic-soft-close-concealed-hinge",
            "sku": "NP-HNG-BLUM-110",
            "name_en": "Clip-Top 110° Soft-Close Hydraulic Hinge",
            "name_ur": "کلپ ٹاپ 110 ڈگری سافٹ کلوز ہائیڈرولک قلابہ",
            "short_description_en": "Precision clip-on concealed furniture hinge with integrated BLUMOTION silent soft-closing damper mechanism.",
            "short_description_ur": "کیبنٹ دروازوں کے لیے خاموش سافٹ کلوز ہائیڈرولک قلابہ مع 3D ایڈجسٹمنٹ۔",
            "description_en": "[Sample Development Record] The global standard for cabinet and wardrobe doors. Tool-free clip-on assembly, 3-dimensional front adjustment, and tested to 200,000 opening cycles.",
            "description_ur": "[سیمپل ریکارڈ] الماریوں اور کچن کیبنٹس کے لیے دنیا کا سب سے قابل اعتماد سافٹ کلوز قلابہ۔",
            "price": Decimal("850.00"),
            "price_on_request": False,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": False,
            "is_best_seller": True,
            "brand_slug": "blum",
            "category_slugs": ["hinges-fittings", "hardware"],
            "specifications": {
                "Opening Angle": "110 Degrees",
                "Damper Mechanism": "Integrated Hydraulic Piston Damper",
                "Cup Diameter": "35 mm Standard Bore",
                "Drilling Depth": "13 mm",
                "Crank Type": "Full Overlay (0mm Crank)",
            },
            "images": [
                {"image_url": "/images/products/blum-hinge.jpg", "alt_text_en": "Blum Soft Close Hinge", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "All-Steel Nickel-Plated Mechanism", "آل سٹیل نکل پلیٹڈ میٹریل"),
                ("finish", "Satin Nickel", "سیٹن نکل"),
                ("origin", "Austria", "آسٹریا"),
                ("warranty", "Lifetime Functional Guarantee", "لائف ٹائم فنکشنل گارنٹی"),
            ],
            "variants": [],
        },
        {
            "slug": "pullout-pantry-storage-unit",
            "sku": "NP-KIT-PANTRY-06",
            "name_en": "Tandem Heavy-Duty Pull-Out Tall Pantry",
            "name_ur": "ٹیندم ہیوی ڈیوٹی ٹال کچن پینٹری یونٹ",
            "short_description_en": "Full-extension tall kitchen larder unit with 6 height-adjustable anti-slip chrome baskets and smooth soft-close runners.",
            "short_description_ur": "6 ٹوکریوں پر مشتمل ٹال کچن پینٹری اسٹوریج یونٹ، ہیوی ویٹ کپیسٹی کے ساتھ۔",
            "description_en": "[Sample Development Record] Maximize high-capacity dry ration storage in your modern kitchen. Features heavy-duty concealed bottom and top slide tracks supporting up to 100 kg total payload.",
            "description_ur": "[سیمپل ریکارڈ] کچن گروسری اور سامان کو سلیقے سے رکھنے کے لیے ہیوی ڈیوٹی ٹال پینٹری ریک۔",
            "price": None,
            "price_on_request": True,
            "stock_status": StockStatus.ORDER_BASED,
            "is_featured": True,
            "is_best_seller": False,
            "brand_slug": "hettich",
            "category_slugs": ["kitchen-accessories", "kitchen"],
            "specifications": {
                "Cabinet Width Fit": "450 mm / 600 mm Carcase",
                "Height Range": "1900 mm to 2200 mm Adjustable Frame",
                "Number of Trays": "6 Deep Baskets with Solid Melamine Bases",
                "Load Capacity": "Up to 100 kg Distributed Payload",
                "Runner System": "Synchronized Heavy-Duty Soft-Close Tracks",
            },
            "images": [
                {"image_url": "/images/products/pantry-pullout.jpg", "alt_text_en": "Tall Kitchen Pantry Storage Pullout", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "Steel Frame with Wooden Anti-Slip Base", "سٹیل فریم اور اینٹی سلپ لکڑی بیس"),
                ("finish", "Anthracite Gray & Polished Chrome", "اینتھراسائیٹ گرے اور کروم"),
                ("origin", "Germany", "جرمنی"),
                ("warranty", "5 Years Mechanism Warranty", "5 سال میکانزم وارنٹی"),
            ],
            "variants": [],
        },
        {
            "slug": "floating-vanity-with-led-mirror",
            "sku": "NP-VAN-32-LED",
            "name_en": "Floating Bathroom Vanity 32-inch with Smart LED Mirror",
            "name_ur": "32 انچ فلوٹنگ باتھ روم وینٹی مع اسمارٹ ایل ای ڈی مرر",
            "short_description_en": "Waterproof high-density PVC floating vanity with seamless sintered stone countertop and anti-fog LED touch mirror.",
            "short_description_ur": "واٹر پروف پی وی سی وال ہینگ وینٹی، سنٹرڈ اسٹون کاؤنٹر ٹاپ اور ایل ای ڈی مرر کے ساتھ۔",
            "description_en": "[Sample Development Record] High-durability wall-hung bathroom cabinet designed for humid environments. Features dual soft-close drawers and integrated ceramic under-mount basin.",
            "description_ur": "[سیمپل ریکارڈ] نمی سے محفوظ پی وی سی میٹریل سے تیار کردہ وال ہینگ باتھ روم وینٹی، سافٹ کلوز درازوں کے ساتھ۔",
            "price": None,
            "price_on_request": True,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": True,
            "is_best_seller": True,
            "brand_slug": "master-sanitary",
            "category_slugs": ["vanities", "bathroom"],
            "specifications": {
                "Cabinet Dimensions": "800mm W x 480mm D x 450mm H (32-inch)",
                "Cabinet Material": "Multi-layer Waterproof Rigid PVC Board",
                "Countertop": "Solid Sintered Stone Slab",
                "Mirror Features": "Defogger Heater & 3-Color Touch Dimmer",
                "Basin Type": "Integrated Seamless Ceramic Basin",
            },
            "images": [
                {"image_url": "/images/products/vanity-32.jpg", "alt_text_en": "32 Inch Floating Bathroom Vanity", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "Waterproof PVC & Sintered Stone", "واٹر پروف پی وی سی اور سنٹرڈ اسٹون"),
                ("finish", "Matte Gray & White Ceramic", "میٹ گرے اور سفید سیرامک"),
                ("origin", "Pakistan", "پاکستان"),
                ("warranty", "2 Years Cabinet Warranty", "2 سال کیبنٹ وارنٹی"),
            ],
            "variants": [],
        },
        {
            "slug": "rimless-wall-hung-smart-toilet",
            "sku": "NP-SAN-WH01",
            "name_en": "Rimless Wall-Hung European Water Closet",
            "name_ur": "رِم لیس وال ہینگ یورپیئن کموڈ",
            "short_description_en": "Vitreous china glazed ceramic wall-hung toilet with hygienic 360-degree rimless tornado flush and UF soft-closing slim seat.",
            "short_description_ur": "رِم لیس ٹورنیڈو فلش وال ہینگ کموڈ بمع سافٹ کلوزنگ سلم سیٹ کور۔",
            "description_en": "[Sample Development Record] Space-saving wall-mounted commode featuring ultra-smooth nano-glazed ceramic bowl for effortless hygiene and dual 3L/4.5L water-saving flush compatibility.",
            "description_ur": "[سیمپل ریکارڈ] جدید واش رومز کے لیے وال ہینگ کموڈ، نینو گلیزڈ سیرامک باؤل اور واٹر سیونگ فلش۔",
            "price": None,
            "price_on_request": True,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": False,
            "is_best_seller": True,
            "brand_slug": "master-sanitary",
            "category_slugs": ["commodes", "bathroom"],
            "specifications": {
                "Dimensions": "540mm L x 360mm W x 350mm H",
                "Flush Mechanism": "360-Degree Rimless Dual Vortex Jet",
                "Seat Cover": "UF Heavy Resin Soft-Close Detachable",
                "Trap Distance": "Standard 180mm / 230mm Center Fixing",
                "Ceramic Glaze": "Nano Self-Cleaning Antibacterial Coating",
            },
            "images": [
                {"image_url": "/images/products/wall-hung-commode.jpg", "alt_text_en": "Rimless Wall Hung Commode", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "Vitreous China Ceramic", "سیرامک سینیٹری ویئر"),
                ("finish", "Gloss White Nano Glaze", "چمکت دار سفید گلیز"),
                ("origin", "Pakistan", "پاکستان"),
                ("warranty", "10 Years Ceramic Glaze Warranty", "10 سال سیرامک وارنٹی"),
            ],
            "variants": [],
        },
        {
            "slug": "thermostatic-digital-piano-shower-system",
            "sku": "NP-SHW-PK04",
            "name_en": "Thermostatic Piano-Key Digital Rain Shower Set",
            "name_ur": "تھرموسٹیٹک پیانو کی ڈیجیٹل رین شاور سیٹ",
            "short_description_en": "Concealed mixing valve shower set with 4 independent piano-key flow selectors, LED real-time temperature display, and ambient bidet sprayer.",
            "short_description_ur": "پیانو کی ویلو سلیکٹر، ڈیجیٹل ٹمپریچر ڈسپلے اور اوور ہیڈ رین شاور۔",
            "description_en": "[Sample Development Record] Architectural brass bathroom shower column with water-powered hydroelectric digital temperature display (no batteries required), 300mm ultra-thin rainfall head, and pressurized hand-held wand.",
            "description_ur": "[سیمپل ریکارڈ] ہائی پریشر رین شاور، ڈیجیٹل ٹمپریچر ڈسپلے اور پریشرائزڈ ہینڈ شاور۔",
            "price": None,
            "price_on_request": True,
            "stock_status": StockStatus.IN_STOCK,
            "is_featured": True,
            "is_best_seller": False,
            "brand_slug": "master-sanitary",
            "category_slugs": ["showers", "bathroom"],
            "specifications": {
                "Valve Body": "Solid Grade-A 59 Brass Monobloc",
                "Overhead Shower": "300mm x 200mm Anti-Clog Silicone Nozzles",
                "Display Tech": "Internal Hydro-Turbine Powered LED Readout",
                "Modes": "Rain Shower, Hand Spray, Bidet Gun, Bottom Tub Spout",
                "Finish": "Electrophoretic Gunmetal Matte Gray",
            },
            "images": [
                {"image_url": "/images/products/piano-shower.jpg", "alt_text_en": "Digital Piano Key Shower System", "sort_order": 1, "is_primary": True},
            ],
            "attribute_values": [
                ("material", "Solid Brass Valve & Stainless 304 Column", "ہیوی براس اور سٹین لیس سٹیل"),
                ("finish", "Gunmetal Gray Matte", "گن میٹل میٹ گرے"),
                ("origin", "Imported", "امپورٹڈ"),
                ("warranty", "5 Years Valve Cartridge Guarantee", "5 سال والو کارٹریج گارنٹی"),
            ],
            "variants": [],
        },
    ]

    for p_data in products_seed:
        existing = db.query(Product).filter(Product.slug == p_data["slug"]).first()
        if existing:
            continue

        brand_slug = p_data.pop("brand_slug")
        cat_slugs = p_data.pop("category_slugs")
        images_info = p_data.pop("images")
        attr_vals = p_data.pop("attribute_values")
        variants_info = p_data.pop("variants")

        brand = brand_map.get(brand_slug)
        categories = [category_map[s] for s in cat_slugs if s in category_map]

        product = Product(
            **p_data,
            brand_id=brand.id if brand else None,
            categories=categories,
        )
        db.add(product)
        db.flush()
        counts["products"] += 1

        # Add images
        for img in images_info:
            p_img = ProductImage(**img, product_id=product.id)
            db.add(p_img)
            counts["images"] += 1

        # Add attribute values
        for a_slug, val_en, val_ur in attr_vals:
            if a_slug in attr_map:
                pav = ProductAttributeValue(
                    product_id=product.id,
                    attribute_id=attr_map[a_slug].id,
                    value_en=val_en,
                    value_ur=val_ur,
                )
                db.add(pav)

        # Add variants
        for v in variants_info:
            p_var = ProductVariant(**v, product_id=product.id)
            db.add(p_var)
            counts["variants"] += 1

    db.commit()
    return counts
