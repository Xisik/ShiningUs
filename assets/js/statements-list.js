(function () {
  'use strict';

  const ui = window.__ui || {};
  
  /**
   * 성명 목록 렌더링 모듈
   * 
   * Story 1.2: 성명 목록 페이지 구현
   * Epic 1: 성명 콘텐츠 표시 및 탐색
   */

  /**
   * 날짜를 한국어 형식으로 포맷팅
   * @param {Date} date - 포맷팅할 날짜
   * @returns {string} 포맷팅된 날짜 문자열 (예: "2026년 1월 12일")
   */
  function formatDateKorean(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-based이므로 +1
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
  }

  /**
   * 성명 카드 HTML 생성
   * @param {Object} statement - 성명 데이터
   * @returns {string} 성명 카드 HTML
   */
  function createStatementCard(statement) {
    if (!statement) {
      return '';
    }

    const { title, date, summary, slug } = statement;
    const formattedDate = formatDateKorean(date);
    const safeSlug = escapeHtml(slug);
    const idSlug = String(slug == null ? '' : slug).replace(/[^a-zA-Z0-9_-]/g, '-');
    
    // 상세 페이지 링크 (Story 1.4에서 구현 예정, 현재는 #으로)
    const detailUrl = `./poli-statements.html?statement=${encodeURIComponent(slug)}`;

    // Story 3.3: 스크린 리더 접근성 - ARIA 레이블 및 시맨틱 구조
    return `
      <article class="card statement-card" data-statement-slug="${safeSlug}" aria-labelledby="statement-title-${idSlug}">
        <header class="statement-header">
          <h3 class="statement-title" id="statement-title-${idSlug}">
            <a href="${detailUrl}" class="statement-link" aria-label="${escapeHtml(title)} - 상세 보기">${escapeHtml(title)}</a>
          </h3>
          <time class="statement-date" datetime="${date.toISOString()}" aria-label="성명 날짜: ${formattedDate}">
            ${formattedDate}
          </time>
        </header>
        <div class="statement-summary" aria-label="성명 요약">
          <p>${escapeHtml(summary)}</p>
        </div>
      </article>
    `;
  }

  /**
   * HTML 이스케이프 (XSS 방지)
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  function escapeHtml(text) {
    if (typeof text !== 'string') {
      return String(text);
    }

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function t(text) {
    return ui.i18n && ui.i18n.t ? ui.i18n.t(text) : text;
  }

  /**
   * 빈 상태 메시지 HTML 생성
   * Story 3.3: 스크린 리더 접근성 - 빈 상태 알림
   * @returns {string} 빈 상태 메시지 HTML
   */
  function createEmptyState() {
    return `
      <div class="card content" role="status" aria-live="polite" aria-label="${escapeHtml(t('성명 목록이 비어있음'))}">
        <p>${escapeHtml(t('아직 등록된 성명이 없습니다.'))}</p>
        <p class="small">${escapeHtml(t('곧 새로운 성명을 공유할 예정입니다.'))}</p>
      </div>
    `;
  }

  /**
   * 로딩 상태 메시지 HTML 생성
   * Story 3.3: 스크린 리더 접근성 - 로딩 상태 알림
   * @returns {string} 로딩 상태 메시지 HTML
   */
  function createLoadingState(mode) {
    const isDetail = mode === 'detail';
    const ariaLabel = isDetail ? '성명 상세 로딩 중' : '성명 목록 로딩 중';
    const title = isDetail
      ? '성명 상세 내용을 준비하고 있습니다.'
      : 'Notion에서 성명 자료를 정리하고 있습니다.';
    const description = isDetail
      ? '선택한 성명 내용을 불러오는 중입니다.'
      : '잠시만 기다려주세요. 곧 최신 성명을 보여드릴게요.';

    return `
      <div class="card content loading-state" role="status" aria-live="polite" aria-label="${escapeHtml(t(ariaLabel))}">
        <p class="loading-title">${escapeHtml(t(title))}</p>
        <p class="small">${escapeHtml(t(description))}</p>
      </div>
    `;
  }

  /**
   * 에러 상태 메시지 HTML 생성
   * Story 3.3: 스크린 리더 접근성 - 에러 상태 알림
   * @param {string} message - 에러 메시지
   * @param {Date} [lastUpdated] - 마지막 업데이트 시각
   * @returns {string} 에러 상태 메시지 HTML
   */
  function createErrorState(message, lastUpdated) {
    let lastUpdatedText = '';
    if (lastUpdated) {
      const formattedDate = formatDateKorean(lastUpdated);
      lastUpdatedText = `<p class="small">마지막 업데이트: ${formattedDate}</p>`;
    }

    return `
      <div class="card content" role="alert" aria-live="assertive" aria-label="오류 발생">
        <p>${escapeHtml(t('성명 목록을 불러오는 중 오류가 발생했습니다.'))}</p>
        ${message ? `<p class="small">${escapeHtml(message)}</p>` : ''}
        ${lastUpdatedText}
        <p class="small">${escapeHtml(t('잠시 후 다시 시도해주세요.'))}</p>
      </div>
    `;
  }

  /**
   * 성명 목록을 DOM에 렌더링
   * Story 3.3: 스크린 리더 접근성 - 목록 구조 명확화
   * @param {Array<Object>} statements - 성명 데이터 배열
   * @param {HTMLElement|string} container - 렌더링할 컨테이너 요소 또는 선택자
   * @returns {boolean} 렌더링 성공 여부
   */
  function renderStatementList(statements, container) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (!containerEl) {
      console.error('성명 목록 컨테이너를 찾을 수 없습니다.');
      return false;
    }

    // Story 3.3: 컨테이너에 ARIA 속성 추가 (article 요소들이 이미 시맨틱하므로 role="list"는 불필요)
    // article 요소는 자체적으로 시맨틱하므로 role을 추가하지 않음
    if (!containerEl.hasAttribute('aria-label')) {
      containerEl.setAttribute('aria-label', '성명 목록');
    }

    // 기존 내용 제거
    containerEl.innerHTML = '';

    // 성명이 없는 경우
    if (!Array.isArray(statements) || statements.length === 0) {
      containerEl.innerHTML = createEmptyState();
      return true;
    }

    // Story 3.3: 성명 개수 알림
    containerEl.setAttribute('aria-label', `성명 목록, 총 ${statements.length}개`);

    // 성명 목록 렌더링
    const statementsHtml = statements
      .map(statement => createStatementCard(statement))
      .join('');

    containerEl.innerHTML = statementsHtml;

    return true;
  }

  /**
   * 로딩 상태 표시
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   */
  function showLoadingState(container, mode) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = createLoadingState(mode);
    }
  }

  /**
   * 에러 상태 표시
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   * @param {string} message - 에러 메시지
   * @param {Date} [lastUpdated] - 마지막 업데이트 시각
   */
  function showErrorState(container, message, lastUpdated) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = createErrorState(message, lastUpdated);
    }
  }

  /**
   * 빈 상태 표시
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   */
  function showEmptyState(container) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = createEmptyState();
    }
  }

  // Public API
  ui.statements = ui.statements || {};
  ui.statements.list = {
    renderStatementList: renderStatementList,
    showLoadingState: showLoadingState,
    showErrorState: showErrorState,
    showEmptyState: showEmptyState,
    formatDateKorean: formatDateKorean,
    createStatementCard: createStatementCard,
    escapeHtml: escapeHtml
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.statements.list;
  }
})();



