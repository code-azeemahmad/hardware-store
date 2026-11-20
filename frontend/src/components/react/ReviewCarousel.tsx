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
      initial: 'M',
      name: isUrdu ? 'ملک ارشد (بلڈنگ کنٹریکٹر، سرگودھا)' : 'Malik Arshad (Building Contractor, Sargodha)',
      avatarColor: '#1A73E8',
      rating: 5,
      date: isUrdu ? '2 ہفتے قبل' : '2 weeks ago',
      quote: isUrdu
        ? 'نصیر ہارڈویئر کینال روڈ سے ہم اپنی تمام سائیٹس کے لیے ڈور لاکس، قبضے اور سنک لیتے ہیں۔ ریٹس ہول سیل ہیں اور کوالٹی بالکل اصلی ہے۔'
        : 'We procure architectural door locks, hinges, and sinks for our Sargodha construction sites from Naseer Hardware on Canal Road. Genuine wholesale pricing and dependable quality.',
    },
    {
      initial: 'H',
      name: isUrdu ? 'حاجی محمد اسلم (ووڈ ورکر و کارپینٹر)' : 'Haji M. Aslam (Master Woodcraft, Sargodha)',
      avatarColor: '#EA4335',
      rating: 5,
      date: isUrdu ? '1 ماہ قبل' : '1 month ago',
      quote: isUrdu
        ? 'ان کے پاس میرین پلائی ووڈ 710 گریڈ کی اصلی واٹر پروف شیٹس کا بہترین اسٹاک ہے۔ کچن فرنیچر کے لیے لکڑی میں کبھی شکایت نہیں آئی۔'
        : 'Best stock of genuine 710 BWP boiling water-proof marine plywood in Sargodha. Never had any delamination or core void issues for kitchen cabinetry.',
    },
    {
      initial: 'T',
      name: isUrdu ? 'طارق محمود (رہائشی، کینٹ سرگودھا)' : 'Tariq Mahmood (Homeowner, Cantt Sargodha)',
      avatarColor: '#FBBC05',
      rating: 5,
      date: isUrdu ? '2 ماہ قبل' : '2 months ago',
      quote: isUrdu
        ? 'اپنے نئے گھر کے لیے ڈیجیٹل اسمارٹ لاک اور باتھ روم وینٹی خریدی۔ شوروم پر اسٹاف نے بہترین گائیڈ کیا اور قیمتیں مارکیٹ سے مناسب تھیں۔'
        : 'Purchased biometric smart door locks and floating bathroom vanities for our new home. Excellent technical guidance and transparent prices at their Canal Road showroom.',
    },
    {
      initial: 'S',
      name: isUrdu ? 'سرگودھا انٹیرئیر ڈیزائن اسٹوڈیو' : 'Sargodha Interior Design Studio',
      avatarColor: '#34A853',
      rating: 5,
      date: isUrdu ? '3 ماہ قبل' : '3 months ago',
      quote: isUrdu
        ? 'جدید کچن پینٹری یونٹس اور میٹ فنش ہینڈلز کی وسیع ورائٹی موجود ہے۔ کلائنٹس کو شوروم وزٹ کرا کے تسلی کروانا بہت آسان رہتا ہے۔'
        : 'Wide collection of modular kitchen accessories, tall pantry pullouts, and architectural brass pulls. Our go-to showroom for interior design clients.',
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
            href="https://maps.app.goo.gl/xmLZoo4WbL5xnffy8"
            target="_blank"
            rel="noopener noreferrer"
            className="google-reviews-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>{ui[lang]['action.viewReviews']}</span>
          </a>
          <p className="sample-disclaimer-note">
            {isUrdu
              ? '* ابتدائی نمونہ فیڈ بیک برائے لے آؤٹ۔ نصیر پلائی ووڈ اینڈ ہارڈویئر کے تصدیق شدہ گوگل ریویوز کینال روڈ شوروم پروفائل سے منسلک ہیں۔'
              : '* Sample demonstration feedback for layout preview. Verified customer reviews linked to Canal Road Sargodha showroom profile.'}
          </p>
        </div>
      </div>

      <style>{`
        .reviews-section {
          padding-block: 4.5rem;
          background-color: var(--bg);
        }

        .reviews-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .reviews-title {
          font-size: clamp(1.75rem, 3.5vw, 2.25rem);
          font-weight: 800;
          color: var(--text);
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
          color: var(--text-muted);
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
          border: 1px solid var(--border);
          background-color: var(--surface);
          font-size: 1.5rem;
          line-height: 1;
          color: var(--text);
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .carousel-nav-btn:hover {
          background-color: var(--bg-alt);
          border-color: var(--color-border-hover);
        }

        .review-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          transition: background-color var(--transition-fast), border-color var(--transition-fast);
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
          color: var(--text);
        }

        .google-badge-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .card-stars {
          color: #D97706;
          font-size: 0.95rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .review-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .review-quote {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--text-muted);
          font-style: italic;
          flex: 1;
        }

        .reviews-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin-top: 3rem;
          text-align: center;
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

        .sample-disclaimer-note {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-style: italic;
          max-width: 600px;
          margin: 0;
        }
      `}</style>
    </section>
  );
};
