(function () {
  'use strict';

  const ui = window.__ui || {};
  
  /**
   * 성명 페이지 라우팅 모듈
   * 
   * Story 1.4: 고유 URL 및 라우팅
   * Epic 1: 성명 콘텐츠 표시 및 탐색
   * 
   * GitHub Pages 정적 호스팅 환경에서 동작하는 클라이언트 사이드 라우팅
   */

  /**
   * URL에서 성명 slug 추출
   * @param {string} [url] - 파싱할 URL (기본값: 현재 URL)
   * @returns {string|null} statement slug 또는 null
   */
  function getStatementSlugFromUrl(url) {
    const targetUrl = url || window.location.href;
    try {
      const urlObj = new URL(targetUrl, window.location.href);
      
      // 쿼리 파라미터 방식: ?statement=slug
      let slug = urlObj.searchParams.get('statement');
      if (slug != null) {
        try {
          slug = decodeURIComponent(slug);
        } catch (_) {}
        return slug ? String(slug).trim() : null;
      }
      
      // 해시 라우팅 방식: #/statement/slug (선택적)
      const hash = urlObj.hash;
      if (hash && hash.startsWith('#/statement/')) {
        try {
          slug = decodeURIComponent(hash.substring(12));
        } catch (_) {}
        return slug ? String(slug).trim() : null;
      }
      
      return null;
    } catch (e) {
      console.error('URL 파싱 오류:', e);
      return null;
    }
  }

  /**
   * 성명 상세 페이지 URL 생성
   * @param {string} slug - 성명 slug
   * @param {boolean} [useHash=false] - 해시 라우팅 사용 여부
   * @returns {string} 성명 상세 페이지 URL
   */
  function createStatementUrl(slug, useHash = false) {
    if (!slug) {
      return './poli-statements.html';
    }

    if (useHash) {
      return `./poli-statements.html#/statement/${encodeURIComponent(slug)}`;
    } else {
      return `./poli-statements.html?statement=${encodeURIComponent(slug)}`;
    }
  }

  /**
   * 성명 목록 페이지 URL
   * @returns {string} 성명 목록 페이지 URL
   */
  function createListUrl() {
    return './poli-statements.html';
  }

  /**
   * History API를 사용하여 URL 업데이트 (페이지 리로드 없이)
   * @param {string} slug - 성명 slug (null이면 목록 페이지)
   * @param {boolean} [replace=false] - replaceState 사용 여부 (뒤로가기 히스토리에 추가하지 않음)
   */
  function updateUrl(slug, replace = false) {
    const url = slug ? createStatementUrl(slug) : createListUrl();
    const title = slug ? `성명 상세 - ${slug}` : '성명공유';
    
    if (replace) {
      window.history.replaceState({ slug: slug, page: slug ? 'detail' : 'list' }, title, url);
    } else {
      window.history.pushState({ slug: slug, page: slug ? 'detail' : 'list' }, title, url);
    }
    
    // title 업데이트는 SEO 모듈에서 처리 (더 상세한 정보 제공)
    // document.title은 SEO 모듈에서 업데이트됨
  }

  /**
   * 라우터 초기화
   * @param {Function} onRouteChange - 라우트 변경 시 호출될 콜백 함수 (slug: string|null)
   */
  function initRouter(onRouteChange) {
    if (typeof onRouteChange !== 'function') {
      console.error('라우터 콜백 함수가 필요합니다.');
      return;
    }

    // 초기 라우트 처리
    const initialSlug = getStatementSlugFromUrl();
    onRouteChange(initialSlug);

    // popstate 이벤트 리스너 (뒤로가기/앞으로가기)
    window.addEventListener('popstate', (event) => {
      const state = event.state;
      if (state && state.slug !== undefined) {
        onRouteChange(state.slug);
      } else {
        // state가 없으면 URL에서 추출
        const slug = getStatementSlugFromUrl();
        onRouteChange(slug);
      }
    });

    // 링크 클릭 이벤트 처리 (페이지 리로드 방지)
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a.statement-link, a[href*="poli-statements.html"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.includes('poli-statements.html')) return;

      // 외부 링크나 다른 동작이 필요한 경우는 제외
      if (link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      // 성명 상세 링크인 경우
      const slug = getStatementSlugFromUrl(href);
      if (slug !== null) {
        event.preventDefault();
        updateUrl(slug, false);
        onRouteChange(slug);
        
        // 스크롤을 상단으로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href === './poli-statements.html' || href === 'poli-statements.html') {
        // 목록 페이지 링크인 경우
        event.preventDefault();
        updateUrl(null, false);
        onRouteChange(null);
        
        // 스크롤을 상단으로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /**
   * 현재 라우트 정보 반환
   * @returns {Object} { slug: string|null, page: 'list'|'detail' }
   */
  function getCurrentRoute() {
    const slug = getStatementSlugFromUrl();
    return {
      slug: slug,
      page: slug ? 'detail' : 'list'
    };
  }

  /**
   * 라우트 이동
   * @param {string|null} slug - 이동할 성명 slug (null이면 목록 페이지)
   * @param {Function} onRouteChange - 라우트 변경 시 호출될 콜백 함수
   */
  function navigateTo(slug, onRouteChange) {
    if (typeof onRouteChange !== 'function') {
      console.error('라우터 콜백 함수가 필요합니다.');
      return;
    }

    updateUrl(slug, false);
    onRouteChange(slug);
    
    // 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 잘못된 URL 접근 시 에러 페이지 표시
   * Story 3.3: 스크린 리더 접근성 - 에러 상태 알림
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   * @param {string} [message] - 에러 메시지
   */
  function showNotFoundError(container, message) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (containerEl) {
      containerEl.innerHTML = `
        <div class="card content" role="alert" aria-live="assertive" aria-label="성명을 찾을 수 없음">
          <h2>성명을 찾을 수 없습니다</h2>
          <p>요청하신 성명이 존재하지 않거나 삭제되었을 수 있습니다.</p>
          ${message ? `<p class="small">${escapeHtml(message)}</p>` : ''}
          <a href="./poli-statements.html" class="btn" aria-label="성명 목록으로 돌아가기">목록으로 돌아가기</a>
        </div>
      `;
    }
  }

  /**
   * HTML 이스케이프
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

  // Public API
  ui.statements = ui.statements || {};
  ui.statements.router = {
    initRouter: initRouter,
    navigateTo: navigateTo,
    getCurrentRoute: getCurrentRoute,
    getStatementSlugFromUrl: getStatementSlugFromUrl,
    createStatementUrl: createStatementUrl,
    createListUrl: createListUrl,
    updateUrl: updateUrl,
    showNotFoundError: showNotFoundError
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.statements.router;
  }
})();


