import { useCallback } from 'react';
import { useLanguage } from '../state/LanguageContext.jsx';
import { useJsonResource } from '../hooks/useJsonResource.js';
import { formatDate, normalizeDate, normalizePayload } from '../lib/content.js';

function normalizePayments(payload) {
  const normalized = normalizePayload(payload, 'payments');
  return normalized.items
    .map((raw) => ({
      title: String(raw?.title || raw?.name || '').trim(),
      date: normalizeDate(raw?.date || raw?.created_time || raw?.last_edited_time),
      summary: String(raw?.summary || raw?.description || '').trim(),
      url: String(raw?.url || raw?.file || '').trim()
    }))
    .filter((item) => item.title && item.url)
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
}

function normalizePaymentUrl(url) {
  if (/^(?:https?:|mailto:|tel:|\/)/i.test(url)) return url;
  if (url.startsWith('./')) return url;
  if (url.startsWith('assets/')) return `./${url}`;
  return `./assets/payment/${url.split(/[\\/]/).pop()}`;
}

function PaymentItem({ payment, language, t }) {
  return (
    <article className="card payment-card">
      <header className="payment-header">
        <h2 className="payment-title">{payment.title}</h2>
        {payment.date && <time className="payment-date">{formatDate(payment.date, language === 'en' ? 'en-US' : 'ko-KR')}</time>}
      </header>
      {payment.summary && <p>{payment.summary}</p>}
      <a
        className="btn btn-primary payment-download"
        href={normalizePaymentUrl(payment.url)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('download')}
      </a>
    </article>
  );
}

export function PaymentsPage() {
  const { t, language } = useLanguage();
  const normalize = useCallback(normalizePayments, []);
  const { status, data, error } = useJsonResource(
    './data/payments.json',
    'shiningus:payments-json:v2',
    normalize
  );

  return (
    <main className="container">
      <section className="page-header">
        <h1>{t('payments')}</h1>
        <p>{language === 'en' ? 'View and download expense report PDFs.' : '\uC9C0\uCD9C\uB0B4\uC5ED PDF\uB97C \uD655\uC778\uD558\uACE0 \uB2E4\uC6B4\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.'}</p>
      </section>

      <section className="payments-container" role="region" aria-label={t('payments')}>
        {status === 'loading' && (
          <div className="card content loading-state" role="status" aria-live="polite">
            <p className="loading-title">{t('loading')}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="card content">
            <h2>{t('notFound')}</h2>
            <p>{error?.message}</p>
          </div>
        )}

        {status === 'success' && data.length === 0 && (
          <div className="card content">
            <h2>{t('empty')}</h2>
          </div>
        )}

        {status === 'success' && data.map((payment) => (
          <PaymentItem
            key={`${payment.title}-${payment.url}`}
            payment={payment}
            language={language}
            t={t}
          />
        ))}
      </section>
    </main>
  );
}
