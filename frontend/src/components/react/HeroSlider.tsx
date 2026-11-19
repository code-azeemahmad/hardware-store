import React, { useState, useEffect, useRef } from 'react';
import { ui } from '../../i18n/ui';

interface HeroSliderProps {
  lang: 'en' | 'ur';
}

interface Slide {
  id: number;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  categoryLink: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';
  const basePath = isUrdu ? '/ur' : '';

  const slides: Slide[] = [
    {
      id: 1,
      image: '/images/gate.jpg',
      badge: isUrdu ? 'سرگودھا کا سب سے بڑا شوروم' : 'Main Showroom — Sargodha',
      title: isUrdu ? 'نصیر پلائی ووڈ اینڈ ہارڈویئر' : 'Naseer Plywood & Hardware',
      subtitle: isUrdu
        ? 'کینال روڈ اور جنرل بس اسٹینڈ روڈ سرگودھا پر کچن فٹنگز، ڈور ہینڈلز اور پریمیم پلائی ووڈ کی وسیع ورائٹی۔'
        : 'Your trusted partner for architectural hardware, designer door locks, luxury kitchen mixers, and building supplies.',
      categoryLink: `${basePath}/kitchen/`,
    },
    {
      id: 2,
      image: '/images/wood.jpg',
      badge: isUrdu ? 'ڈائریکٹ امپورٹ و ڈسٹری بیوشن' : 'Direct Wholesale & Distribution',
      title: isUrdu ? 'واٹر پروف میرین اور کمرشل پلائی ووڈ' : 'Commercial & Waterproof Marine Plywood',
      subtitle: isUrdu
        ? 'بی ڈبلیو آر کوالٹی، ایم ڈی ایف شیٹس اور لیمینیٹس۔ بلڈرز، ٹھیکیداروں اور کارپینٹرز کے لیے خصوصی ریٹس۔'
        : 'High-density BWR marine plywood, particle boards, and decorative marble & woodgrain laminate sheets in all thicknesses.',
      categoryLink: `${basePath}/plywood/`,
    },
    {
      id: 3,
      image: '/images/crafts.jpg',
      badge: isUrdu ? 'پریمیم ڈور فٹنگز' : 'Architectural Door Fittings',
      title: isUrdu ? 'اسمارٹ ڈیجیٹل لاکس اور مین ڈور ہینڈلز' : 'Smart Digital Door Locks & Handles',
      subtitle: isUrdu
        ? 'جدید ترین الیکٹرانک فنگر پرنٹ لاکس، پیتل اور میٹ بلیک ڈور ہینڈلز برائے لگژری ہوم انٹیریئرز۔'
        : 'Next-generation biometric keyless smart locks, mortise sets, and custom hardware fittings for modern residential doors.',
      categoryLink: `${basePath}/hardware/`,
    },
    {
      id: 4,
      image: '/images/shelf.jpg',
      badge: isUrdu ? 'ایج بینڈنگ و دراز فٹنگز' : 'Precision Cabinet Accessories',
      title: isUrdu ? 'پی وی سی ایج بینڈنگ اور ہائیڈرولک چینلز' : 'PVC Edge Banding Tapes & Hydraulic Channels',
      subtitle: isUrdu
        ? 'تمام شیڈز میں ایج بینڈنگ ٹیپس، سافٹ کلوز دراز سلائیڈز اور امپورٹڈ جرمن گلو۔'
        : 'Matching PVC edge banding tapes across 100+ textures, soft-close drawer slides, and heavy-duty adhesives.',
      categoryLink: `${basePath}/hardware/`,
    },
  ];

  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(nextSlide, 6000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, current]);

  return (
    <section className="hero-slider-section" aria-label="Showroom Showcase">
      <div className="hero-slides-wrapper">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === current ? 'active' : ''}`}
          >
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              fetchPriority={index === 0 ? 'high' : 'low'}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="hero-slide-bg"
            />
            <div className="hero-slide-overlay" aria-hidden="true" />
            <div className="container hero-slide-container">
              <div className="hero-slide-content">
                <span className="hero-badge">{slide.badge}</span>
                <h1 className="hero-slide-title">{slide.title}</h1>
                <p className="hero-slide-desc">{slide.subtitle}</p>
                <div className="hero-slide-buttons">
                  <a href={slide.categoryLink} className="hero-btn hero-btn-primary">
                    {ui[lang]['action.shopNow']}
                  </a>
                  <a
                    href="https://wa.me/923177030847"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-btn hero-btn-whatsapp"
                    data-analytics-event="whatsapp_click"
                    data-source="hero_slider"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-12.416c-5.514 0-10 4.486-10 10 0 1.945.565 3.755 1.537 5.289l-1.637 5.979 6.136-1.61c1.476.883 3.204 1.342 4.964 1.342 5.514 0 10-4.486 10-10s-4.486-10-10-10z"/>
                    </svg>
                    <span>{ui[lang]['action.whatsapp']}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Navigation Bar (Arrows & Dots matching reference) */}
      <div className="slider-controls-bar">
        <button
          type="button"
          className="slider-arrow-btn prev-btn"
          onClick={prevSlide}
          aria-label="Previous Slide"
        >
          {isUrdu ? '›' : '‹'}
        </button>

        <div className="slider-dots" role="tablist">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`slider-dot ${idx === current ? 'active' : ''}`}
              onClick={() => setCurrent(idx)}
              role="tab"
              aria-selected={idx === current}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="slider-arrow-btn next-btn"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          {isUrdu ? '‹' : '›'}
        </button>

        <button
          type="button"
          className="slider-play-toggle"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause auto-slider' : 'Play auto-slider'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <style>{`
        .hero-slider-section {
          position: relative;
          background-color: var(--color-secondary-black);
          overflow: hidden;
          color: var(--color-surface-white);
        }

        .hero-slides-wrapper {
          position: relative;
          min-height: 520px;
          display: flex;
        }

        @media (min-width: 992px) {
          .hero-slides-wrapper {
            min-height: 600px;
          }
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s ease;
          transform: scale(1.02);
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-slide.active {
          opacity: 1;
          visibility: visible;
          transform: scale(1);
          z-index: 1;
        }

        .hero-slide-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }

        .hero-slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(17, 17, 17, 0.88) 0%, rgba(17, 17, 17, 0.65) 50%, rgba(17, 17, 17, 0.85) 100%);
          z-index: 2;
        }

        .hero-slide-container {
          position: relative;
          z-index: 3;
          padding-block: 4rem;
        }

        .hero-slide-content {
          max-width: 720px;
        }

        .hero-badge {
          display: inline-block;
          background-color: var(--color-primary-red);
          color: #FFF;
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0.3rem 0.85rem;
          border-radius: 4px;
          margin-bottom: 1.25rem;
        }

        .hero-slide-title {
          font-size: clamp(2.1rem, 4.5vw, 3.4rem);
          font-weight: 800;
          line-height: ${isUrdu ? '1.4' : '1.15'};
          color: #FFFFFF;
          margin-bottom: 1.25rem;
          letter-spacing: ${isUrdu ? '0' : '-0.5px'};
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .hero-slide-desc {
          font-size: clamp(1rem, 2vw, 1.2rem);
          line-height: ${isUrdu ? '1.8' : '1.6'};
          color: #D8D8D8;
          margin-bottom: 2.25rem;
          max-width: 620px;
        }

        .hero-slide-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.95rem 2rem;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform var(--transition-fast), background-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .hero-btn-primary {
          background-color: var(--color-primary-red);
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(226, 27, 35, 0.4);
        }

        .hero-btn-primary:hover {
          background-color: var(--color-primary-red-hover);
          transform: translateY(-2px);
        }

        .hero-btn-whatsapp {
          background-color: var(--color-whatsapp);
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
        }

        .hero-btn-whatsapp:hover {
          background-color: var(--color-whatsapp-hover);
          transform: translateY(-2px);
        }

        /* Slider Controls Bar */
        .slider-controls-bar {
          position: absolute;
          bottom: 1.5rem;
          inset-inline-start: 50%;
          transform: translateX(${isUrdu ? '50%' : '-50%'});
          display: flex;
          align-items: center;
          gap: 0.75rem;
          z-index: 10;
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          padding: 0.4rem 1rem;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .slider-arrow-btn {
          background: none;
          border: none;
          color: #FFFFFF;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          padding: 0.1rem 0.4rem;
          transition: color var(--transition-fast);
        }

        .slider-arrow-btn:hover {
          color: var(--color-primary-red);
        }

        .slider-dots {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .slider-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.45);
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
          padding: 0;
        }

        .slider-dot.active {
          width: 24px;
          border-radius: 5px;
          background-color: var(--color-primary-red);
        }

        .slider-play-toggle {
          background: none;
          border: none;
          color: #AAAAAA;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.2rem;
        }

        .slider-play-toggle:hover {
          color: #FFF;
        }
      `}</style>
    </section>
  );
};
