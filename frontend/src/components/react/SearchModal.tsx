import React, { useState, useEffect, useRef } from 'react';
import { ui } from '../../i18n/ui';

interface SearchModalProps {
  lang: 'en' | 'ur';
}

interface SearchItem {
  title: string;
  category: string;
  href: string;
  badge?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const basePath = lang === 'ur' ? '/ur' : '';
  const isUrdu = lang === 'ur';

  // Seed searchable catalog items matching physical store inventory & categories
  const searchableCatalog: SearchItem[] = [
    { title: isUrdu ? '19905 سنگل لیور سنک مکسر' : '19905 Single Lever Kitchen Sink Mixer', category: isUrdu ? 'کچن' : 'Kitchen', href: `${basePath}/kitchen/sinks/` },
    { title: isUrdu ? 'T1221 بلٹ اِن الیکٹرک اوون' : 'T1221 Built-in Electric Oven', category: isUrdu ? 'کچن' : 'Kitchen' , href: `${basePath}/kitchen/ovens/` },
    { title: isUrdu ? 'DS-681 اسمارٹ ڈیجیٹل ڈور لاک' : 'DS-681 Smart Digital Door Lock', category: isUrdu ? 'ہارڈویئر' : 'Hardware', href: `${basePath}/hardware/locks/` },
    { title: isUrdu ? 'ZY004 میٹ گولڈ کیبنٹ ہینڈل' : 'ZY004 Matte Gold Cabinet Handle', category: isUrdu ? 'ہارڈویئر' : 'Hardware', href: `${basePath}/hardware/cabinet-handles/` },
    { title: isUrdu ? 'وال ہینگ رِم لیس کموڈ' : 'Rimless Wall-Hang Designer Commode', category: isUrdu ? 'باتھ روم' : 'Bathroom', href: `${basePath}/bathroom/commodes/` },
    { title: isUrdu ? '9322-1 لگژری ٹیبل ٹاپ بیسن' : '9322-1 Luxury Tabletop Basin', category: isUrdu ? 'باتھ روم' : 'Bathroom', href: `${basePath}/bathroom/basins/` },
    { title: isUrdu ? 'واٹر پروف بی ڈبلیو آر میرین پلائی ووڈ 16 ایم ایم' : 'Waterproof BWR Marine Plywood 16mm', category: isUrdu ? 'پلائی ووڈ' : 'Plywood', href: `${basePath}/plywood/marine/` },
    { title: isUrdu ? 'ہائی ڈینسٹی کمرشل پلائی ووڈ شیٹس' : 'High Density Commercial Plywood Sheets', category: isUrdu ? 'پلائی ووڈ' : 'Plywood', href: `${basePath}/plywood/commercial/` },
    { title: isUrdu ? 'پی وی سی ووڈ گرین ایج بینڈنگ رولز' : 'PVC Woodgrain Edge Banding Tapes', category: isUrdu ? 'پلائی ووڈ' : 'Plywood', href: `${basePath}/plywood/edge-banding/` },
    { title: isUrdu ? 'سافٹ کلوزنگ ہائیڈرولک دراز چینلز' : 'Soft-Closing Hydraulic Drawer Channels', category: isUrdu ? 'ہارڈویئر' : 'Hardware', href: `${basePath}/hardware/channels/` },
  ];

  const filteredItems = query.trim() === ''
    ? []
    : searchableCatalog.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Global hotkey: Cmd/Ctrl + K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="search-widget">
      {/* Search Trigger Button */}
      <button
        type="button"
        className="search-header-btn"
        aria-label="Search Catalogue"
        title="Search (Ctrl+K)"
        onClick={() => setIsOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>

      {/* Search Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="search-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="search-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Catalogue Search"
          >
            {/* Search Input Bar */}
            <div className="search-input-header">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="search-input-field"
                placeholder={ui[lang]['action.search']}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className="search-close-icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
              >
                ESC
              </button>
            </div>

            {/* Results or Suggestions */}
            <div className="search-results-container">
              {query.trim() === '' ? (
                <div className="search-quick-categories">
                  <span className="quick-title">{isUrdu ? 'مقبول ترین کیٹیگریز' : 'Popular Categories'}</span>
                  <div className="quick-tags">
                    <a href={`${basePath}/kitchen/sinks/`} className="quick-pill" onClick={() => setIsOpen(false)}>
                      {ui[lang]['mega.kitchen.sinks']}
                    </a>
                    <a href={`${basePath}/hardware/locks/`} className="quick-pill" onClick={() => setIsOpen(false)}>
                      {ui[lang]['mega.hardware.locks']}
                    </a>
                    <a href={`${basePath}/bathroom/commodes/`} className="quick-pill" onClick={() => setIsOpen(false)}>
                      {ui[lang]['mega.bathroom.commodes']}
                    </a>
                    <a href={`${basePath}/plywood/marine/`} className="quick-pill" onClick={() => setIsOpen(false)}>
                      {ui[lang]['mega.plywood.marine']}
                    </a>
                  </div>
                </div>
              ) : filteredItems.length > 0 ? (
                <ul className="search-items-list">
                  {filteredItems.map((item, idx) => (
                    <li key={idx} className="search-item">
                      <a href={item.href} className="search-item-link" onClick={() => setIsOpen(false)}>
                        <div className="item-text">
                          <span className="item-title">{item.title}</span>
                          <span className="item-cat-badge">{item.category}</span>
                        </div>
                        <span className="item-arrow">{isUrdu ? '←' : '→'}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="search-empty-state">
                  <p>{isUrdu ? 'کوئی پروڈکٹ نہیں ملی۔ براہ راست واٹس ایپ پر رابطہ کریں۔' : 'No matching products found. Contact us on WhatsApp for custom inquiries.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-header-btn {
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background-color var(--transition-fast), color var(--transition-fast);
        }

        .search-header-btn:hover {
          background-color: var(--bg-alt);
          color: var(--red-text);
        }

        .search-modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(3px);
          z-index: 99999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 10vh;
        }

        .search-modal-dialog {
          width: 90%;
          max-width: 620px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: searchSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes searchSlideDown {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .search-input-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.15rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .search-input-field {
          flex: 1;
          font-size: 1.05rem;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text);
          font-family: inherit;
        }

        .search-close-icon {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          background-color: var(--bg-alt);
          border: 1px solid var(--border);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .search-results-container {
          max-height: 420px;
          overflow-y: auto;
          padding: 1rem 1.5rem;
        }

        .search-quick-categories {
          padding-block: 0.5rem;
        }

        .quick-title {
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          display: block;
        }

        .quick-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .quick-pill {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.4rem 0.85rem;
          background-color: var(--bg-alt);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 20px;
          text-decoration: none;
          transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
        }

        .quick-pill:hover {
          background-color: var(--red);
          color: var(--on-red);
          border-color: var(--red);
        }

        .search-items-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }

        .search-item {
          border-bottom: 1px solid var(--border);
        }

        .search-item-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 0.25rem;
          text-decoration: none;
          color: var(--text);
          transition: color var(--transition-fast);
        }

        .search-item-link:hover {
          color: var(--red-text);
        }

        .item-text {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .item-title {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .item-cat-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          background-color: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .item-arrow {
          font-weight: 700;
          color: var(--text-muted);
        }

        .search-empty-state {
          padding: 2rem 0;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};
