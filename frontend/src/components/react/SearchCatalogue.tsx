import React, { useState, useEffect } from 'react';
import type { Product } from '../../data/catalogue';

interface SearchCatalogueProps {
  lang: 'en' | 'ur';
  initialProducts: Product[];
}

export const SearchCatalogue: React.FC<SearchCatalogueProps> = ({
  lang,
  initialProducts,
}) => {
  const isUrdu = lang === 'ur';
  const basePath = isUrdu ? '/ur' : '';

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [results, setResults] = useState<Product[]>(initialProducts);

  // Initialize query from URL search param if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      if (q) {
        setQuery(q);
      }
    }
  }, []);

  // Filter products whenever query or category changes
  useEffect(() => {
    let filtered = initialProducts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.categorySlug === selectedCategory);
    }

    if (query.trim()) {
      const qLower = query.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const titleMatch = isUrdu
          ? p.titleUr.toLowerCase().includes(qLower) || p.titleEn.toLowerCase().includes(qLower)
          : p.titleEn.toLowerCase().includes(qLower);
        const brandMatch = p.brand.toLowerCase().includes(qLower);
        const skuMatch = p.sku.toLowerCase().includes(qLower);
        const tagMatch = p.tags.some((t) => t.toLowerCase().includes(qLower));
        const categoryMatch = p.categoryNameEn.toLowerCase().includes(qLower);

        return titleMatch || brandMatch || skuMatch || tagMatch || categoryMatch;
      });
    }

    setResults(filtered);
  }, [query, selectedCategory, initialProducts, isUrdu]);

  const categories = [
    { id: 'all', label: isUrdu ? 'تمام کیٹیگریز' : 'All Categories' },
    { id: 'kitchen', label: isUrdu ? 'کچن' : 'Kitchen' },
    { id: 'hardware', label: isUrdu ? 'ہوم ہارڈویئر' : 'Home Hardware' },
    { id: 'bathroom', label: isUrdu ? 'باتھ روم' : 'Bathroom' },
    { id: 'plywood', label: isUrdu ? 'پلائی ووڈ اور بورڈز' : 'Plywood & Boards' },
  ];

  return (
    <div className={`search-catalogue-root ${isUrdu ? 'rtl' : 'ltr'}`}>
      {/* Search Input Toolbar */}
      <div className="search-box-wrap">
        <div className="search-input-field">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isUrdu
                ? 'پراڈکٹ، برانڈ، ماڈل یا کیٹیگری تلاش کریں (مثلاً: سنک، لاک، پلائی ووڈ)...'
                : 'Search products, brands, models, or categories (e.g., sink, lock, plywood)...'
            }
            className="search-input"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="clear-query-btn"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="category-filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`cat-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <span className="results-count">
          {isUrdu ? (
            <>
              موجود نتائج: <strong>{results.length}</strong>
              {query && <> برائے "<strong>{query}</strong>"</>}
            </>
          ) : (
            <>
              Showing <strong>{results.length}</strong> results
              {query && <> for "<strong>{query}</strong>"</>}
            </>
          )}
        </span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="search-results-grid">
          {results.map((p) => {
            const productTitle = isUrdu ? p.titleUr : p.titleEn;
            const categoryName = isUrdu ? p.subcategoryNameUr : p.subcategoryNameEn;
            const productHref = `${basePath}/products/${p.slug}/`;
            const waHref = `https://wa.me/923045030046?text=${encodeURIComponent(
              isUrdu
                ? `السلام علیکم! مجھے اس پراڈکٹ کی قیمت جاننی ہے: ${p.titleUr}`
                : `Hello! I would like to inquire about: ${p.titleEn}`
            )}`;

            return (
              <div key={p.slug} className="product-card">
                <a href={productHref} className="product-media-link">
                  <div className="image-aspect-box">
                    <img src={p.imageUrl} alt={productTitle} loading="lazy" />
                  </div>
                  <div className="card-badge">
                    <span>{p.brand}</span>
                  </div>
                </a>

                <div className="product-card-body">
                  <span className="product-card-category">{categoryName}</span>
                  <h3 className="product-card-title">
                    <a href={productHref}>{productTitle}</a>
                  </h3>

                  <div className="product-price-row">
                    <span className="price-tag-onRequest">
                      {isUrdu ? 'قیمت برائے رابطہ' : 'Price on Request'}
                    </span>
                  </div>

                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-wa-btn"
                  >
                    <span>{isUrdu ? 'واٹس ایپ انکوائری' : 'WhatsApp Inquiry'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-results-box">
          <div className="no-results-icon">🔍</div>
          <h3>{isUrdu ? 'کوئی پراڈکٹ نہیں ملی' : 'No Matching Products Found'}</h3>
          <p>
            {isUrdu
              ? 'شاید آپ کے مطلوبہ الفاظ مختلف ہوں۔ آپ براہ راست ہمارے واٹس ایپ پر تصویر یا تفصیل بھیج کر معلومات حاصل کر سکتے ہیں۔'
              : 'Try checking your spelling, using broader keywords, or message our showroom team on WhatsApp directly.'}
          </p>
          <a
            href="https://wa.me/923045030046"
            target="_blank"
            rel="noopener noreferrer"
            className="no-results-wa-btn"
          >
            {isUrdu ? 'واٹس ایپ پر پوچھیں (+92 304 5030046)' : 'Ask on WhatsApp (+92 304 5030046)'}
          </a>
        </div>
      )}

      <style>{`
        .search-catalogue-root {
          padding: 1rem 0 3rem;
        }
        .search-box-wrap {
          background-color: var(--color-surface-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        .search-input-field {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background-color: var(--color-surface-light);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-full);
          padding: 0.75rem 1.25rem;
          color: var(--color-text-muted);
          transition: border-color var(--transition-fast), background-color var(--transition-fast);
        }
        .search-input-field:focus-within {
          border-color: var(--color-primary-red);
          background-color: var(--color-surface-white);
        }
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1.05rem;
          color: var(--color-surface-black);
          outline: none;
        }
        .clear-query-btn {
          background: none;
          border: none;
          font-size: 1rem;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }
        .category-filter-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.25rem;
        }
        .cat-tab-btn {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          background-color: var(--color-surface-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-surface-black);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .cat-tab-btn.active {
          background-color: var(--color-surface-black);
          color: #ffffff;
          border-color: var(--color-surface-black);
        }
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          color: var(--color-text-muted);
        }
        .results-header strong {
          color: var(--color-surface-black);
        }
        .search-results-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .search-results-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .search-results-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .search-results-grid {
            grid-template-columns: 1fr;
          }
        }
        .product-card {
          background-color: var(--color-surface-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
        .product-media-link {
          position: relative;
          display: block;
        }
        .image-aspect-box {
          position: relative;
          aspect-ratio: 1 / 1;
          background-color: var(--color-surface-light);
          overflow: hidden;
        }
        .image-aspect-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-medium);
        }
        .product-card:hover .image-aspect-box img {
          transform: scale(1.04);
        }
        .card-badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background-color: rgba(17, 17, 17, 0.88);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .rtl .card-badge {
          left: auto;
          right: 0.75rem;
        }
        .product-card-body {
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .product-card-category {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-primary-red);
          margin-bottom: 0.35rem;
        }
        .product-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-surface-black);
          line-height: 1.35;
          margin-bottom: 0.75rem;
          flex-grow: 1;
        }
        .product-card-title a {
          color: inherit;
          text-decoration: none;
        }
        .product-card-title a:hover {
          color: var(--color-primary-red);
        }
        .product-price-row {
          margin-bottom: 0.85rem;
        }
        .price-tag-onRequest {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-primary-red);
          background-color: #fee2e2;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .card-wa-btn {
          display: block;
          text-align: center;
          padding: 0.55rem;
          background-color: #25d366;
          color: #ffffff;
          font-size: 0.825rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          text-decoration: none;
          transition: background-color var(--transition-fast);
        }
        .card-wa-btn:hover {
          background-color: #1eb956;
        }
        .no-results-box {
          text-align: center;
          padding: 4rem 2rem;
          background-color: var(--color-surface-light);
          border-radius: var(--radius-lg);
        }
        .no-results-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .no-results-box h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-surface-black);
          margin-bottom: 0.5rem;
        }
        .no-results-box p {
          font-size: 1rem;
          color: var(--color-text-muted);
          max-width: 500px;
          margin: 0 auto 1.5rem;
          line-height: 1.6;
        }
        .no-results-wa-btn {
          display: inline-flex;
          background-color: #25d366;
          color: #ffffff;
          font-weight: 700;
          padding: 0.75rem 1.75rem;
          border-radius: var(--radius-full);
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};
