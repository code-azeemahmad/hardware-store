import React, { useState, useEffect, useRef } from 'react';
import { ui } from '../../i18n/ui';

interface MobileNavDrawerProps {
  lang: 'en' | 'ur';
  currentPath: string;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ lang, currentPath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const basePath = lang === 'ur' ? '/ur' : '';
  const isUrdu = lang === 'ur';

  const categories = [
    {
      id: 'kitchen',
      title: ui[lang]['nav.kitchen'],
      href: `${basePath}/kitchen/`,
      items: [
        { title: ui[lang]['mega.kitchen.sinks'], href: `${basePath}/kitchen/kitchen-sinks/` },
        { title: ui[lang]['mega.kitchen.faucets'], href: `${basePath}/kitchen/faucets/` },
        { title: ui[lang]['mega.kitchen.accessories'], href: `${basePath}/kitchen/accessories/` },
        { title: ui[lang]['mega.kitchen.handles'], href: `${basePath}/kitchen/handles/` },
        { title: ui[lang]['mega.kitchen.hoods'], href: `${basePath}/kitchen/hoods/` },
        { title: ui[lang]['mega.kitchen.ovens'], href: `${basePath}/kitchen/ovens/` },
      ],
    },
    {
      id: 'hardware',
      title: ui[lang]['nav.hardware'],
      href: `${basePath}/hardware/`,
      items: [
        { title: ui[lang]['mega.hardware.doorHandles'], href: `${basePath}/hardware/door-handles/` },
        { title: ui[lang]['mega.hardware.cabinetHandles'], href: `${basePath}/hardware/cabinet-handles/` },
        { title: ui[lang]['mega.hardware.locks'], href: `${basePath}/hardware/door-locks/` },
        { title: ui[lang]['mega.hardware.hinges'], href: `${basePath}/hardware/hinges/` },
        { title: ui[lang]['mega.hardware.channels'], href: `${basePath}/hardware/channels/` },
        { title: ui[lang]['mega.hardware.general'], href: `${basePath}/hardware/general/` },
      ],
    },
    {
      id: 'bathroom',
      title: ui[lang]['nav.bathroom'],
      href: `${basePath}/bathroom/`,
      items: [
        { title: ui[lang]['mega.bathroom.vanities'], href: `${basePath}/bathroom/vanities/` },
        { title: ui[lang]['mega.bathroom.basins'], href: `${basePath}/bathroom/basins/` },
        { title: ui[lang]['mega.bathroom.commodes'], href: `${basePath}/bathroom/commodes/` },
        { title: ui[lang]['mega.bathroom.faucets'], href: `${basePath}/bathroom/faucets/` },
        { title: ui[lang]['mega.bathroom.showers'], href: `${basePath}/bathroom/showers/` },
        { title: ui[lang]['mega.bathroom.accessories'], href: `${basePath}/bathroom/accessories/` },
      ],
    },
    {
      id: 'plywood',
      title: ui[lang]['nav.plywood'],
      href: `${basePath}/plywood/`,
      items: [
        { title: ui[lang]['mega.plywood.commercial'], href: `${basePath}/plywood/commercial-plywood/` },
        { title: ui[lang]['mega.plywood.marine'], href: `${basePath}/plywood/marine-plywood/` },
        { title: ui[lang]['mega.plywood.mdf'], href: `${basePath}/plywood/mdf/` },
        { title: ui[lang]['mega.plywood.laminates'], href: `${basePath}/plywood/laminates/` },
        { title: ui[lang]['mega.plywood.blockboard'], href: `${basePath}/plywood/blockboard/` },
        { title: ui[lang]['mega.plywood.edgebanding'], href: `${basePath}/plywood/edge-banding/` },
      ],
    },
  ];

  // Lock body scroll and manage focus when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Trap focus inside drawer
  const handleKeyDownTrap = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };

  const toggleAccordion = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  return (
    <div className="mobile-nav-root">
      {/* Mobile Hamburger Trigger */}
      <button
        type="button"
        ref={triggerRef}
        className="mobile-hamburger-btn"
        aria-label="Open Navigation Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={() => {
            setIsOpen(false);
            triggerRef.current?.focus();
          }}
          aria-hidden="true"
        />
      )}

      {/* Off-Canvas Drawer */}
      <div
        className={`drawer-panel ${isOpen ? 'open' : ''}`}
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        onKeyDown={handleKeyDownTrap}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <span className="drawer-emblem">NP</span>
            <div className="drawer-brand-text">
              <strong>{isUrdu ? 'نصیر پلائی ووڈ' : 'NASEER PLYWOOD'}</strong>
              <small>{isUrdu ? 'اینڈ ہارڈویئر' : '& HARDWARE'}</small>
            </div>
          </div>
          <button
            type="button"
            ref={closeBtnRef}
            className="drawer-close-btn"
            aria-label="Close Navigation Menu"
            onClick={() => {
              setIsOpen(false);
              triggerRef.current?.focus();
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-body">
          <ul className="drawer-nav-list">
            {/* Home */}
            <li className="drawer-item">
              <a
                href={basePath || '/'}
                className={`drawer-link ${currentPath === (basePath || '/') ? 'active-link' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {ui[lang]['nav.home']}
              </a>
            </li>

            {/* Accordion Categories */}
            {categories.map((cat) => {
              const isExpanded = expandedCategory === cat.id;

              return (
                <li key={cat.id} className="drawer-item">
                  <div className="drawer-accordion-header">
                    <a
                      href={cat.href}
                      className="drawer-link"
                      onClick={() => setIsOpen(false)}
                    >
                      {cat.title}
                    </a>
                    <button
                      type="button"
                      className="accordion-toggle-btn"
                      aria-expanded={isExpanded}
                      onClick={() => toggleAccordion(cat.id)}
                      aria-label={`Toggle ${cat.title} subcategories`}
                    >
                      <svg
                        className={`accordion-chevron ${isExpanded ? 'rotated' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>

                  {isExpanded && (
                    <ul className="drawer-sub-list">
                      {cat.items.map((sub, sIdx) => (
                        <li key={sIdx}>
                          <a
                            href={sub.href}
                            className="drawer-sub-link"
                            onClick={() => setIsOpen(false)}
                          >
                            {sub.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}

            {/* Contact & About */}
            <li className="drawer-item">
              <a href={`${basePath}/contact/`} className="drawer-link" onClick={() => setIsOpen(false)}>
                {ui[lang]['nav.contact']}
              </a>
            </li>
            <li className="drawer-item">
              <a href={`${basePath}/about/`} className="drawer-link" onClick={() => setIsOpen(false)}>
                {ui[lang]['nav.about']}
              </a>
            </li>
          </ul>

          {/* Quick Contact CTAs in Drawer */}
          <div className="drawer-footer-actions">
            <a
              href="https://wa.me/923045030046"
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-whatsapp-btn"
              data-analytics-event="whatsapp_click"
              data-source="mobile_drawer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-12.416c-5.514 0-10 4.486-10 10 0 1.945.565 3.755 1.537 5.289l-1.637 5.979 6.136-1.61c1.476.883 3.204 1.342 4.964 1.342 5.514 0 10-4.486 10-10s-4.486-10-10-10z"/>
              </svg>
              <span>{ui[lang]['action.whatsapp']}</span>
            </a>
            <a
              href="tel:+923045030046"
              className="drawer-call-btn"
              dir="ltr"
              data-analytics-event="call_click"
              data-phone="03045030046"
            >
              📞 +92-304-5030046
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .mobile-nav-root {
          display: block;
        }
        @media (min-width: 992px) {
          .mobile-nav-root {
            display: none;
          }
        }

        .mobile-hamburger-btn {
          background: none;
          border: none;
          color: var(--color-secondary-black);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
        }

        .drawer-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(2px);
          z-index: 9998;
          animation: overlayFadeIn 0.2s ease-out;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .drawer-panel {
          position: fixed;
          top: 0;
          bottom: 0;
          inset-inline-start: 0;
          width: 85%;
          max-width: 360px;
          background-color: var(--color-surface-white);
          z-index: 9999;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          transform: translateX(${isUrdu ? '100%' : '-100%'});
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .drawer-panel.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--color-border);
        }

        .drawer-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .drawer-emblem {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--color-secondary-black);
          color: #FFF;
          font-weight: 800;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--color-primary-red);
        }

        .drawer-brand-text {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          line-height: 1.2;
        }

        .drawer-close-btn {
          background: none;
          border: none;
          color: var(--color-text-dark);
          cursor: pointer;
          padding: 0.25rem;
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .drawer-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
        }

        .drawer-item {
          border-bottom: 1px solid #F0F0F0;
        }

        .drawer-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .drawer-link {
          display: block;
          padding: 0.9rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-secondary-black);
          text-decoration: none;
          flex: 1;
        }

        .accordion-toggle-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          color: #666;
          cursor: pointer;
        }

        .accordion-chevron {
          transition: transform 0.2s ease;
        }

        .accordion-chevron.rotated {
          transform: rotate(180deg);
        }

        .drawer-sub-list {
          list-style: none;
          padding-inline-start: 1rem;
          padding-bottom: 0.75rem;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .drawer-sub-link {
          font-size: 0.9rem;
          color: #555;
          text-decoration: none;
          display: block;
          padding-block: 0.25rem;
        }

        .drawer-footer-actions {
          margin-top: auto;
          padding-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .drawer-whatsapp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background-color: var(--color-whatsapp);
          color: #FFF;
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
        }

        .drawer-call-btn {
          display: block;
          text-align: center;
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--color-secondary-black);
          text-decoration: none;
          background-color: var(--color-surface-muted);
        }
      `}</style>
    </div>
  );
};
