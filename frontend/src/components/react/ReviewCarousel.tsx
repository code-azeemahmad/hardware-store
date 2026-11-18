import React, { useState } from 'react';
import { ui } from '../../i18n/ui';

interface ReviewCarouselProps {
  lang: 'en' | 'ur';
}

interface Review {
  initial: string;
  name: string;
  avatarColor: string;
  rating: number;
  date: string;
  quote: string;
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';

  const reviews: Review[] = [
    {
      initial: 'Y',
      name: isUrdu ? 'یاسر انیس' : 'Yasir Anees',
      avatarColor: '#1A73E8',
      rating: 5,
      date: isUrdu ? '2 ہفتے قبل' : '2 weeks ago',
      quote: isUrdu
        ? 'پروڈکٹس کا بہترین مجموعہ اور ان کا اسٹاف کسٹمرز کو سامان منتخب کرنے میں بہت مددگار ہے۔ سرگودھا میں ہارڈویئر کے لیے بہترین دکان۔'
        : 'A good range of products and staff is very keen to guide customers. Best wholesale hardware and plywood rates in Sargodha.',
    },
    {
      initial: 'G',
      name: isUrdu ? 'غزالہ ملک' : 'Ghazala Malik',
      avatarColor: '#EA4335',
      rating: 5,
      date: isUrdu ? '1 ماہ قبل' : '1 month ago',
      quote: isUrdu
        ? 'نہایت مناسب قیمتیں، اعلیٰ معیار کا سامان۔ کچن سنک اور ڈور ہینڈلز کی وسیع ورائٹی موجود ہے۔'
        : 'Very economical prices, value for goods. They have the most complete sanitary fittings and cabinet handles collection.',
    },
    {
      initial: 'S',
      name: isUrdu ? 'شاہد شاہد' : 'Shahid Shahid',
      avatarColor: '#FBBC05',
      rating: 5,
      date: isUrdu ? '3 ماہ قبل' : '3 months ago',
      quote: isUrdu
        ? 'ان کا شوروم شاندار ہے اور قیمتیں بالکل جائز ہیں۔ میرین پلائی ووڈ اور سینیٹری کا لاجواب اسٹاک ہے۔'
        : 'Their showroom is excellent, and their prices are very reasonable. High-quality waterproof marine plywood and fittings.',
    },
    {
      initial: 'M',
      name: isUrdu ? 'محمد عرفان (بلڈر)' : 'M. Irfan (Contractor)',
      avatarColor: '#34A853',
      rating: 5,
      date: isUrdu ? '4 ماہ قبل' : '4 months ago',
      quote: isUrdu
        ? 'ہم تمام پراجیکٹس کے لیے پلائی ووڈ، ایم ڈی ایف شیٹس اور لاکس یہیں سے لیتے ہیں۔ ہمیشہ قابل اعتماد کوالٹی۔'
        : 'Reliable supplier for construction and interior projects. Timely supply of bulk commercial plywood and hardware.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="section reviews-section" aria-label="Customer Testimonials">
      <div className="container">
        {/* Header */}
        <div className="reviews-header">
          <h2 className="reviews-title">{ui[lang]['section.reviews']}</h2>
          <div className="google-rating-badge">
            <div className="stars-row" aria-label="5 stars rating">
              {'★★★★★'}
            </div>
            <span className="rating-text">{ui[lang]['section.reviewsRating']}</span>
          </div>
        </div>

        {/* Reviews Grid / Carousel */}
        <div className="reviews-cards-wrapper">
          <button
            type="button"
            className="carousel-nav-btn prev-nav"
            onClick={prevReview}
            aria-label="Previous review"
          >
            {isUrdu ? '›' : '‹'}
          </button>

          <div className="reviews-cards-grid">
            {reviews.map((rev, idx) => (
              <div key={idx} className="review-card">
                <div className="review-card-top">
                  <div className="avatar-circle" style={{ backgroundColor: rev.avatarColor }}>
                    {rev.initial}
                  </div>
                  <div className="reviewer-info">
                    <span className="reviewer-name">{rev.name}</span>
                    <span className="google-badge-tag">Google Review</span>
                  </div>
                </div>

                <div className="card-stars">
                  {'★★★★★'}
                  <span className="review-date">{rev.date}</span>
                </div>

                <p className="review-quote">“{rev.quote}”</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="carousel-nav-btn next-nav"
            onClick={nextReview}
            aria-label="Next review"
          >
            {isUrdu ? '‹' : '›'}
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="carousel-dots-row">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>

        {/* CTA Button matching reference */}
        <div className="reviews-footer">
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="google-reviews-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>{ui[lang]['action.viewReviews']}</span>
          </a>
        </div>
      </div>

      <style>{`
        .reviews-section {
          padding-block: 4.5rem;
          background-color: var(--color-surface-white);
        }

        .reviews-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .reviews-title {
          font-size: clamp(1.75rem, 3.5vw, 2.25rem);
          font-weight: 800;
          color: var(--color-secondary-black);
          margin-bottom: 0.5rem;
        }

        .google-rating-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stars-row {
          color: #F4B400;
          font-size: 1.25rem;
          letter-spacing: 2px;
        }

        .rating-text {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .reviews-cards-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .reviews-cards-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.5rem;
          width: 100%;
        }

        @media (min-width: 768px) {
          .reviews-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1200px) {
          .reviews-cards-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .carousel-nav-btn {
          display: none;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          background-color: #FFF;
          font-size: 1.5rem;
          line-height: 1;
          color: var(--color-text-dark);
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .carousel-nav-btn:hover {
          background-color: var(--color-surface-muted);
          border-color: #999;
        }

        .review-card {
          background-color: #FFFFFF;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }

        .review-card-top {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 0.85rem;
        }

        .avatar-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          color: #FFF;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .reviewer-info {
          display: flex;
          flex-direction: column;
        }

        .reviewer-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-secondary-black);
        }

        .google-badge-tag {
          font-size: 0.75rem;
          color: #888;
        }

        .card-stars {
          color: #F4B400;
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .review-date {
          font-size: 0.75rem;
          color: #AAA;
        }

        .review-quote {
          font-size: 0.875rem;
          line-height: 1.6;
          color: #444444;
          font-style: italic;
          flex: 1;
        }

        .reviews-footer {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
        }

        .google-reviews-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          background-color: #1A73E8;
          color: #FFFFFF;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: background-color var(--transition-fast), transform var(--transition-fast);
        }

        .google-reviews-btn:hover {
          background-color: #1557B0;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
};
