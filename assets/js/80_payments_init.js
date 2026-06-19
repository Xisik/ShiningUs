(function () {
  'use strict';

  const ui = window.__ui || {};
  const $ = ui.$ || ((sel) => document.querySelector(sel));

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text == null ? '' : text);
    return div.innerHTML;
  }

  function t(text) {
    return ui.i18n && ui.i18n.t ? ui.i18n.t(text) : text;
  }

  function getFileName(file) {
    return String(file || '').split('/').pop();
  }

  function createTitleFromText(text) {
    return String(text || '')
      .replace(/\.pdf$/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();
  }

  function createTitleFromFile(file) {
    return createTitleFromText(getFileName(file));
  }

  function createPaymentHref(fileName) {
    return encodeURI(`./assets/payment/${fileName}`);
  }

  function getPaymentHref(payment) {
    if (payment && payment.url) {
      return encodeURI(payment.url);
    }

    const fileName = getFileName(payment && payment.file);
    return fileName ? createPaymentHref(fileName) : '';
  }

  function getPaymentFileLabel(payment) {
    return payment && payment.fileName
      ? payment.fileName
      : getFileName((payment && payment.file) || (payment && payment.url));
  }

  function getPaymentTitle(payment) {
    const explicitTitle = payment && payment.title ? createTitleFromText(payment.title) : '';
    return explicitTitle || createTitleFromFile(getPaymentFileLabel(payment));
  }

  function createPaymentCard(payment) {
    const fileLabel = getPaymentFileLabel(payment);
    const href = getPaymentHref(payment);

    if (!fileLabel || !/\.pdf$/i.test(fileLabel) || !href) {
      return '';
    }

    const title = getPaymentTitle(payment);
    const safeTitle = escapeHtml(title);
    const safeHref = escapeHtml(href);
    const safeFileLabel = escapeHtml(fileLabel);

    return `
      <article class="card payment-card">
        <header class="payment-header">
          <h2 class="payment-title">${safeTitle}</h2>
        </header>
        <a
          class="btn btn-primary payment-download"
          href="${safeHref}"
          download
          aria-label="${safeTitle} PDF 다운로드"
        >
          ${safeFileLabel}
        </a>
      </article>
    `;
  }

  function getCreatedTime(payment) {
    const time = Date.parse(payment && payment.createdAt);
    return Number.isNaN(time) ? 0 : time;
  }

  function getValidPayments(payments) {
    return Array.isArray(payments)
      ? payments.filter(payment => payment && /\.pdf$/i.test(getPaymentFileLabel(payment)) && getPaymentHref(payment))
      : [];
  }

  function renderPayments(payments, container) {
    const validPayments = getValidPayments(payments);

    if (validPayments.length === 0) {
      container.innerHTML = `
        <div class="card content" role="status" aria-live="polite" aria-label="${escapeHtml(t('지출내역 목록이 비어있음'))}">
          <p>${escapeHtml(t('아직 등록된 지출내역이 없습니다.'))}</p>
        </div>
      `;
      return;
    }

    container.setAttribute('aria-label', `${t('지출내역 목록')}, 총 ${validPayments.length}개`);
    container.innerHTML = validPayments
      .slice()
      .sort((a, b) => getCreatedTime(b) - getCreatedTime(a) || getPaymentFileLabel(a).localeCompare(getPaymentFileLabel(b), 'ko'))
      .map(createPaymentCard)
      .join('');
  }

  function showError(container) {
    container.innerHTML = `
      <div class="card content" role="alert" aria-live="assertive" aria-label="${escapeHtml(t('오류 발생'))}">
        <p>${escapeHtml(t('지출내역 목록을 불러오는 중 오류가 발생했습니다.'))}</p>
        <p class="small">${escapeHtml(t('잠시 후 다시 시도해주세요.'))}</p>
      </div>
    `;
  }

  function init() {
    const container = $('#payments-list');

    if (!container) {
      return;
    }

    const bundledPayload = ui.payments && ui.payments.data;
    const bundledPayments = bundledPayload && bundledPayload.payments;

    if (Array.isArray(bundledPayments) && bundledPayments.length > 0) {
      renderPayments(bundledPayments, container);
    }

    fetch('./data/payments.json', { cache: 'no-cache' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load payments.json: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const payments = Array.isArray(data) ? data : data.payments;
        renderPayments(payments, container);
      })
      .catch(error => {
        if (Array.isArray(bundledPayments)) {
          console.warn('지출내역 JSON 로드 실패, 번들된 목록을 사용합니다:', error);
          renderPayments(bundledPayments, container);
        } else {
          console.error('지출내역 목록 로드 실패:', error);
          showError(container);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
