import React, { useState, useRef, useEffect } from 'react';
import { ui } from '../../i18n/ui';

interface DesktopMegaMenuProps {
  lang: 'en' | 'ur';
  currentPath: string;
}

interface Subcategory {
  title: string;
  href: string;
  badge?: string;
}

interface MegaMenuCategory {
  id: string;
  nameKey: keyof typeof ui['en'];
  href: string;
  subcategories: {
    columnTitle: string;
    items: Subcategory[];
  }[];
}

export const DesktopMegaMenu: React.FC<DesktopMegaMenuProps> = ({ lang, currentPath }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const basePath = lang === 'ur' ? '/ur' : '';
  const isUrdu = lang === 'ur';

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = (id: string) => {
    cancelClose();
    setActiveMenu(id);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  const menuData: MegaMenuCategory[] = [
    {
      id: 'kitchen',
      nameKey: 'nav.kitchen',
      href: `${basePath}/kitchen/`,
      subcategories: [
        {
          columnTitle: isUrdu ? 'سنک اور ٹونٹیاں' : 'Sinks & Faucets',
          items: [
            { title: ui[lang]['mega.kitchen.sinks'], href: `${basePath}/kitchen/kitchen-sinks/` },
            { title: ui[lang]['mega.kitchen.faucets'], href: `${basePath}/kitchen/faucets/` },
            { title: isUrdu ? 'سنگل باؤل سنک' : 'Single Bowl Sinks', href: `${basePath}/kitchen/kitchen-sinks/?type=single` },
            { title: isUrdu ? 'ڈبل باؤل سنک' : 'Double Bowl Sinks', href: `${basePath}/kitchen/kitchen-sinks/?type=double` },
          ],
        },
        {
          columnTitle: isUrdu ? 'اسیسریز اور آرگنائزر' : 'Storage & Organization',
          items: [
            { title: ui[lang]['mega.kitchen.accessories'], href: `${basePath}/kitchen/accessories/` },
            { title: isUrdu ? 'پینٹری یونٹس' : 'Tall Pantry Units', href: `${basePath}/kitchen/accessories/?type=pantry` },
            { title: isUrdu ? 'ڈش ریکس' : 'Dish & Plate Racks', href: `${basePath}/kitchen/accessories/?type=dish-racks` },
            { title: isUrdu ? 'اسپائس ریکس' : 'Spice Pull-out Racks', href: `${basePath}/kitchen/accessories/?type=spice` },
          ],
        },
        {
          columnTitle: isUrdu ? 'ہینڈلز اور اپلائنسز' : 'Hardware & Appliances',
          items: [
            { title: ui[lang]['mega.kitchen.handles'], href: `${basePath}/kitchen/handles/` },
            { title: ui[lang]['mega.kitchen.hoods'], href: `${basePath}/kitchen/hoods/` },
            { title: ui[lang]['mega.kitchen.ovens'], href: `${basePath}/kitchen/ovens/` },
            { title: isUrdu ? 'بلٹ اِن مائیکرو ویو' : 'Built-in Microwaves', href: `${basePath}/kitchen/ovens/?type=microwave` },
          ],
        },
      ],
    },
    {
      id: 'hardware',
      nameKey: 'nav.hardware',
      href: `${basePath}/hardware/`,
      subcategories: [
        {
          columnTitle: isUrdu ? 'دروازوں کے ہینڈلز' : 'Door Handles & Pulls',
          items: [
            { title: ui[lang]['mega.hardware.doorHandles'], href: `${basePath}/hardware/door-handles/` },
            { title: isUrdu ? 'مین ڈور پل ہینڈلز' : 'Main Door Pull Handles', href: `${basePath}/hardware/door-handles/?type=pull` },
            { title: isUrdu ? 'لیور ہینڈلز' : 'Lever Handles', href: `${basePath}/hardware/door-handles/?type=lever` },
          ],
        },
        {
          columnTitle: isUrdu ? 'لاک اور سیکورٹی' : 'Locks & Security',
          items: [
            { title: ui[lang]['mega.hardware.locks'], href: `${basePath}/hardware/door-locks/` },
            { title: isUrdu ? 'اسمارٹ ڈیجیٹل لاکس' : 'Smart Digital Door Locks', href: `${basePath}/hardware/door-locks/?type=smart` },
            { title: isUrdu ? 'مورٹائز ڈور لاکس' : 'Mortise Heavy Locks', href: `${basePath}/hardware/door-locks/?type=mortise` },
          ],
        },
        {
          columnTitle: isUrdu ? 'قبضے اور چینلز' : 'Fittings & Channels',
          items: [
            { title: ui[lang]['mega.hardware.cabinetHandles'], href: `${basePath}/hardware/cabinet-handles/` },
            { title: ui[lang]['mega.hardware.hinges'], href: `${basePath}/hardware/hinges/` },
            { title: ui[lang]['mega.hardware.channels'], href: `${basePath}/hardware/channels/` },
            { title: ui[lang]['mega.hardware.general'], href: `${basePath}/hardware/general/` },
          ],
        },
      ],
    },
    {
      id: 'bathroom',
      nameKey: 'nav.bathroom',
      href: `${basePath}/bathroom/`,
      subcategories: [
        {
          columnTitle: isUrdu ? 'سینیٹری اور ٹوائلٹ' : 'Sanitary Ware',
          items: [
            { title: ui[lang]['mega.bathroom.commodes'], href: `${basePath}/bathroom/commodes/` },
            { title: isUrdu ? 'رِم لیس وال ہینگ کموڈ' : 'Rimless Wall-Hang Commodes', href: `${basePath}/bathroom/commodes/?type=rimless` },
            { title: isUrdu ? 'ڈوئل ٹون کموڈز' : 'Dual Tone Matt/Gloss', href: `${basePath}/bathroom/commodes/?type=matte` },
          ],
        },
        {
          columnTitle: isUrdu ? 'وینٹیز اور بیسنز' : 'Vanities & Basins',
          items: [
            { title: ui[lang]['mega.bathroom.vanities'], href: `${basePath}/bathroom/vanities/` },
            { title: ui[lang]['mega.bathroom.basins'], href: `${basePath}/bathroom/basins/` },
            { title: isUrdu ? 'ایل ای ڈی ٹچ مررز' : 'LED Smart Touch Mirrors', href: `${basePath}/bathroom/vanities/?type=mirrors` },
          ],
        },
        {
          columnTitle: isUrdu ? 'شاور اور مکسرز' : 'Showers & Mixers',
          items: [
            { title: ui[lang]['mega.bathroom.faucets'], href: `${basePath}/bathroom/faucets/` },
            { title: ui[lang]['mega.bathroom.showers'], href: `${basePath}/bathroom/showers/` },
            { title: ui[lang]['mega.bathroom.accessories'], href: `${basePath}/bathroom/accessories/` },
          ],
        },
      ],
    },
    {
      id: 'plywood',
      nameKey: 'nav.plywood',
      href: `${basePath}/plywood/`,
      subcategories: [
        {
          columnTitle: isUrdu ? 'پلائی ووڈ کی اقسام' : 'Plywood Grades',
          items: [
            { title: ui[lang]['mega.plywood.commercial'], href: `${basePath}/plywood/commercial-plywood/` },
            { title: ui[lang]['mega.plywood.marine'], href: `${basePath}/plywood/marine-plywood/` },
            { title: isUrdu ? 'بی ڈبلیو آر واٹر پروف شیٹس' : 'BWR Waterproof Boards', href: `${basePath}/plywood/marine-plywood/?grade=bwr` },
          ],
        },
        {
          columnTitle: isUrdu ? 'شیٹس اور بورڈز' : 'Boards & Sheets',
          items: [
            { title: ui[lang]['mega.plywood.mdf'], href: `${basePath}/plywood/mdf/` },
            { title: ui[lang]['mega.plywood.blockboard'], href: `${basePath}/plywood/blockboard/` },
            { title: isUrdu ? 'پارٹیکل بورڈز' : 'Particle & Chipboards', href: `${basePath}/plywood/mdf/?type=particle` },
          ],
        },
        {
          columnTitle: isUrdu ? 'ڈیکوریٹو اور فنشنگ' : 'Laminates & Finishing',
          items: [
            { title: ui[lang]['mega.plywood.laminates'], href: `${basePath}/plywood/laminates/` },
            { title: ui[lang]['mega.plywood.edgebanding'], href: `${basePath}/plywood/edge-banding/` },
            { title: isUrdu ? 'ماربل و ووڈ فنش لیمینیٹس' : 'Marble & Textured Sheets', href: `${basePath}/plywood/laminates/?type=textured` },
          ],
        },
      ],
    },
  ];

  // Close mega-menu on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelClose();
        setActiveMenu(null);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        cancelClose();
        setActiveMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      cancelClose();
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="mega-nav-wrapper" ref={menuRef} aria-label="Desktop Navigation">
      <ul className="mega-nav-list">
        {/* Home Item */}
        <li>
          <a
            href={basePath || '/'}
            className={`mega-nav-link ${currentPath === (basePath || '/') ? 'active' : ''}`}
          >
            {ui[lang]['nav.home']}
          </a>
        </li>

        {/* Mega Menu Categories */}
        {menuData.map((category) => {
          const isOpen = activeMenu === category.id;
          const isActive = currentPath.startsWith(category.href);

          return (
            <li
              key={category.id}
              className="mega-menu-parent"
              onMouseEnter={() => openMenu(category.id)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                className={`mega-nav-link mega-trigger ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  cancelClose();
                  setActiveMenu(isOpen ? null : category.id);
                }}
              >
                <span>{ui[lang][category.nameKey]}</span>
                <svg
                  className={`chevron-icon ${isOpen ? 'rotate' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Mega Dropdown Panel */}
              {isOpen && (
                <div
                  className="mega-dropdown-panel"
                  aria-label={ui[lang][category.nameKey]}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <div className="mega-dropdown-container">
                    <div className="mega-columns-grid">
                      {category.subcategories.map((col, idx) => (
                        <div key={idx} className="mega-column">
                          <h4 className="mega-column-title">{col.columnTitle}</h4>
                          <ul className="mega-sub-list">
                            {col.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <a
                                  href={item.href}
                                  className="mega-sub-link"
                                  onClick={() => {
                                    cancelClose();
                                    setActiveMenu(null);
                                  }}
                                >
                                  {item.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Promo Callout in Mega Menu */}
                      <div className="mega-promo-box">
                        <span className="promo-tag">{isUrdu ? 'براہ راست رابطہ' : 'Direct Assistance'}</span>
                        <h5>{isUrdu ? 'حسب ضرورت آرڈرز' : 'Custom Project Sizing?'}</h5>
                        <p>{isUrdu ? 'تمام سائز اور موٹائی کے لیے ہمارے ماہرین سے واٹس ایپ پر رابطہ کریں۔' : 'Connect with our hardware & plywood specialists for bulk contractor pricing.'}</p>
                        <a
                          href="https://wa.me/923177030847"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mega-whatsapp-pill"
                        >
                          {ui[lang]['action.whatsapp']}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}

        {/* Contact Us Item */}
        <li>
          <a
            href={`${basePath}/contact/`}
            className={`mega-nav-link ${currentPath.includes('/contact') ? 'active' : ''}`}
          >
            {ui[lang]['nav.contact']}
          </a>
        </li>

        {/* About Us Item */}
        <li>
          <a
            href={`${basePath}/about/`}
            className={`mega-nav-link ${currentPath.includes('/about') ? 'active' : ''}`}
          >
            {ui[lang]['nav.about']}
          </a>
        </li>
      </ul>

      <style>{`
        .mega-nav-wrapper {
          display: flex;
          align-items: stretch;
          height: 100%;
        }

        .mega-nav-list {
          display: flex;
          list-style: none;
          align-items: stretch;
          height: 100%;
          gap: 1.25rem;
          margin: 0;
          padding: 0;
        }

        .mega-nav-list > li {
          display: flex;
          align-items: stretch;
          height: 100%;
        }

        .mega-menu-parent {
          position: static;
          display: flex;
          align-items: stretch;
          height: 100%;
        }

        .mega-nav-link {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-text-dark);
          padding: 0 0.5rem;
          display: inline-flex;
          align-items: center;
          height: 100%;
          gap: 0.35rem;
          cursor: pointer;
          background: none;
          border: none;
          position: relative;
          transition: color var(--transition-fast);
        }

        .mega-nav-link:hover,
        .mega-nav-link.active,
        .mega-nav-link.open {
          color: var(--color-primary-red);
        }

        .mega-nav-link.active::after,
        .mega-nav-link.open::after {
          content: '';
          position: absolute;
          bottom: 0;
          inset-inline: 0;
          height: 3px;
          background-color: var(--color-primary-red);
        }

        .chevron-icon {
          transition: transform var(--transition-fast);
        }

        .chevron-icon.rotate {
          transform: rotate(180deg);
        }

        /* Mega Dropdown Full-width Panel */
        .mega-dropdown-panel {
          position: absolute;
          top: var(--header-height);
          inset-inline: 0;
          width: 100%;
          background-color: var(--color-surface-white);
          border-top: 1px solid var(--color-border);
          border-bottom: 3px solid var(--color-primary-red);
          box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.15);
          z-index: 1001;
          pointer-events: auto;
          animation: megaFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Invisible hover bridge connecting navbar trigger buttons to dropdown panel */
        .mega-dropdown-panel::before {
          content: '';
          position: absolute;
          top: -24px;
          inset-inline: 0;
          height: 24px;
          background: transparent;
          pointer-events: auto;
          z-index: 10;
        }

        @keyframes megaFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mega-dropdown-container {
          max-width: var(--container-max-width);
          margin-inline: auto;
          padding: 2.25rem 2rem;
        }

        .mega-columns-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr) 1.25fr;
          gap: 2rem;
        }

        .mega-column-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-secondary-black);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          padding-bottom: 0.4rem;
          border-bottom: 2px solid var(--color-surface-muted);
        }

        .mega-sub-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .mega-sub-link {
          font-size: 0.875rem;
          color: #444444;
          text-decoration: none;
          display: block;
          padding: 0.35rem 0.5rem;
          border-radius: 4px;
          transition: all var(--transition-fast);
        }

        .mega-sub-link:hover {
          color: var(--color-primary-red);
          background-color: var(--color-surface-muted);
          padding-inline-start: 0.75rem;
        }

        .mega-promo-box {
          background-color: #FAFAFA;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .promo-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-primary-red);
          letter-spacing: 0.5px;
          margin-bottom: 0.4rem;
        }

        .mega-promo-box h5 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--color-secondary-black);
          margin-bottom: 0.5rem;
        }

        .mega-promo-box p {
          font-size: 0.8125rem;
          color: #666666;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .mega-whatsapp-pill {
          display: inline-block;
          background-color: var(--color-whatsapp);
          color: #FFFFFF;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          transition: background-color var(--transition-fast);
        }

        .mega-whatsapp-pill:hover {
          background-color: var(--color-whatsapp-hover);
        }
      `}</style>
    </nav>
  );
};
