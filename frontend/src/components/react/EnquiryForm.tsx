import React, { useState } from 'react';

interface EnquiryFormProps {
  lang: 'en' | 'ur';
  prefilledSubject?: string;
  prefilledProduct?: string;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  lang,
  prefilledSubject = '',
  prefilledProduct = '',
}) => {
  const isUrdu = lang === 'ur';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: prefilledProduct
      ? isUrdu
        ? `السلام علیکم، مجھے اس پروڈکٹ کے بارے میں معلومات اور قیمت درکار ہے: ${prefilledProduct}`
        : `Hello, I am interested in inquiring about: ${prefilledProduct}`
      : prefilledSubject || '',
    honeypot: '', // anti-spam
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.honeypot) {
      // silently reject bot
      setStatus('success');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMessage(
        isUrdu
          ? 'براہ کرم اپنا نام، موبائل نمبر اور پیغام درج فرمائیں۔'
          : 'Please enter your name, phone number, and message.'
      );
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() ? formData.email.trim() : null,
          product_name: prefilledProduct || null,
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to submit enquiry');
      }

      setStatus('success');

      // Dispatch analytics conversion event (GTM dataLayer + CustomEvent, zero PII)
      if (typeof window !== 'undefined') {
        const eventPayload = {
          event: 'enquiry_submit',
          channel: 'website_form',
          product_name: prefilledProduct || undefined,
          timestamp: new Date().toISOString(),
        };
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(eventPayload);
        window.dispatchEvent(
          new CustomEvent('naseer:analytics', { detail: eventPayload })
        );
      }
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        isUrdu
          ? 'معذرت، رابطہ فارم بھیجنے میں خرابی پیش آئی۔ براہ کرم براہ راست واٹس ایپ یا فون پر رابطہ فرمائیں۔'
          : err instanceof Error
          ? err.message
          : 'Failed to submit enquiry. Please call or WhatsApp us directly.'
      );
    }
  };

  const whatsappHref = `https://wa.me/923045030046?text=${encodeURIComponent(
    isUrdu
      ? `السلام علیکم نصیر ہارڈویئر! ${prefilledProduct ? `میں اس پراڈکٹ کے بارے میں معلومات لینا چاہتا ہوں: ${prefilledProduct}` : 'مجھے انکوائری کرنی ہے۔'}`
      : `Hello Naseer Hardware! ${prefilledProduct ? `I want to inquire about: ${prefilledProduct}` : 'I have a question about your products.'}`
  )}`;

  return (
    <div className={`enquiry-card ${isUrdu ? 'rtl' : 'ltr'}`}>
      <div className="enquiry-header">
        <h3 className="enquiry-title">
          {isUrdu ? 'آن لائن انکوائری فارم' : 'Send an Instant Enquiry'}
        </h3>
        <p className="enquiry-subtitle">
          {isUrdu
            ? 'فارم پُر کریں یا فوری جواب کے لیے ہمارے واٹس ایپ پر رابطہ فرمائیں۔'
            : 'Fill out this form or message our showroom team directly on WhatsApp.'}
        </p>
      </div>

      {status === 'success' ? (
        <div className="enquiry-success" role="alert">
          <div className="success-icon-wrap">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="success-heading">
            {isUrdu ? 'شکریہ! آپ کا پیغام موصول ہو چکا ہے' : 'Thank You! Your Enquiry Was Received'}
          </h4>
          <p className="success-text">
            {isUrdu
              ? 'ہماری ٹیم جلد از جلد آپ کے فراہم کردہ نمبر پر رابطہ کرے گی۔'
              : 'Our sales team at the Sargodha showroom will contact you shortly.'}
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-followup-btn"
            data-analytics-event="whatsapp_click"
            data-source="enquiry_form_success"
          >
            {isUrdu ? 'واٹس ایپ پر فوری بات کریں' : 'Chat on WhatsApp Now'}
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="enquiry-form" noValidate>
          {/* Honeypot field (hidden from screen readers & users) */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="honeypot"
              tabIndex={-1}
              value={formData.honeypot}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          {status === 'error' && (
            <div className="enquiry-alert error" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="enquiry-name" className="form-label">
              {isUrdu ? 'آپ کا نام *' : 'Your Full Name *'}
            </label>
            <input
              id="enquiry-name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder={isUrdu ? 'مثال: محمد احمد' : 'e.g. Muhammad Ahmed'}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="enquiry-phone" className="form-label">
                {isUrdu ? 'موبائل / واٹس ایپ نمبر *' : 'Phone / WhatsApp Number *'}
              </label>
              <input
                id="enquiry-phone"
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="0304-5030046"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="enquiry-email" className="form-label">
                {isUrdu ? 'ای میل (اختیاری)' : 'Email Address (Optional)'}
              </label>
              <input
                id="enquiry-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="form-input"
              />
            </div>
          </div>

          {prefilledProduct && (
            <div className="form-group">
              <label htmlFor="enquiry-product" className="form-label">
                {isUrdu ? 'پراڈکٹ' : 'Selected Product'}
              </label>
              <input
                id="enquiry-product"
                type="text"
                readOnly
                value={prefilledProduct}
                className="form-input readonly-input"
                aria-label={isUrdu ? 'پراڈکٹ' : 'Selected Product'}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="enquiry-message" className="form-label">
              {isUrdu ? 'آپ کا پیغام یا مطلوبہ تعداد *' : 'Message or Specifications *'}
            </label>
            <textarea
              id="enquiry-message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder={
                isUrdu
                  ? 'مطلوبہ سائز، موٹائی، تعداد یا دیگر تفصیلات یہاں لکھیں...'
                  : 'Please state required sizes, quantities, or delivery inquiries...'
              }
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="submit-btn"
            >
              {status === 'submitting' ? (
                <span>{isUrdu ? 'بھیجا جا رہا ہے...' : 'Sending...'}</span>
              ) : (
                <span>{isUrdu ? 'انکوائری بھیجیں' : 'Submit Enquiry'}</span>
              )}
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-direct-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-12.416c-5.514 0-10 4.486-10 10 0 1.945.565 3.755 1.537 5.289l-1.637 5.979 6.136-1.61c1.476.883 3.204 1.342 4.964 1.342 5.514 0 10-4.486 10-10s-4.486-10-10-10z"/>
              </svg>
              <span>{isUrdu ? 'یا واٹس ایپ پر فوری پوچھیں' : 'Or WhatsApp Directly'}</span>
            </a>
          </div>
        </form>
      )}

      <style>{`
        .enquiry-card {
          background-color: var(--color-surface-white);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        .enquiry-header {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 1rem;
        }
        .enquiry-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--color-surface-black);
          margin-bottom: 0.35rem;
        }
        .enquiry-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          line-height: 1.4;
        }
        .enquiry-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-surface-black);
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 0.75rem 0.9rem;
          font-size: 0.925rem;
          font-family: inherit;
          color: var(--color-surface-black);
          background-color: var(--color-surface-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          outline: none;
          transition: border-color var(--transition-fast), background-color var(--transition-fast);
        }
        .form-input:focus, .form-textarea:focus {
          border-color: var(--color-primary-red);
          background-color: var(--color-surface-white);
        }
        .readonly-input {
          background-color: #f1f5f9;
          color: #475569;
          font-weight: 600;
        }
        .form-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .submit-btn {
          flex: 1;
          min-width: 180px;
          background-color: var(--color-primary-red);
          color: #ffffff;
          padding: 0.85rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background-color var(--transition-fast), transform var(--transition-fast);
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #c7161d;
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .whatsapp-direct-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.25rem;
          background-color: var(--color-whatsapp, #0d6e38);
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          text-decoration: none;
          transition: background-color var(--transition-fast);
        }
        .whatsapp-direct-btn:hover {
          background-color: var(--color-whatsapp-hover, #0b5c2e);
        }
        .enquiry-alert {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
        }
        .enquiry-alert.error {
          background-color: #fee2e2;
          color: #b91c1c;
          border: 1px solid #f87171;
        }
        .enquiry-success {
          text-align: center;
          padding: 2.5rem 1.5rem;
        }
        .success-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background-color: #dcfce7;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        .success-heading {
          font-size: 1.25rem;
          font-weight: 700;
          color: #15803d;
          margin-bottom: 0.5rem;
        }
        .success-text {
          font-size: 0.95rem;
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
        }
        .whatsapp-followup-btn {
          display: inline-flex;
          padding: 0.75rem 1.5rem;
          background-color: #25d366;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: var(--radius-full);
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};
