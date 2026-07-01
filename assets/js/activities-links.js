(function () {
  'use strict';

  const ui = window.__ui || {};
  
  /**
   * 활동 페이지 링크 처리 모듈
   * 
   * Story 1.6: 네비게이션 및 외부 링크
   * Epic 1: 활동 콘텐츠 표시 및 탐색
   * 
   * 외부 링크와 내부 네비게이션 링크를 적절히 처리합니다.
   */

  /**
   * URL이 외부 링크인지 확인
   * @param {string} url - 확인할 URL
   * @returns {boolean} 외부 링크 여부
   */
  function isExternalLink(url) {
    if (!url) return false;

    try {
      const urlObj = new URL(url, window.location.href);
      return urlObj.origin !== window.location.origin;
    } catch (e) {
      // 상대 경로는 내부 링크
      return false;
    }
  }

  /**
   * 링크에 외부 링크 속성 추가
   * @param {HTMLElement} link - 링크 요소
   */
  function enhanceExternalLink(link) {
    if (!link || link.tagName !== 'A') return;

    const href = link.getAttribute('href');
    if (!href) return;

    // 이미 target이 설정되어 있으면 건너뛰기
    if (link.hasAttribute('target')) return;

    // 외부 링크인 경우
    if (isExternalLink(href)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      // Story 3.3: 스크린 리더 접근성 - 외부 링크 aria-label 개선
      if (!link.getAttribute('aria-label')) {
        const linkText = link.textContent.trim() || link.getAttribute('title') || '링크';
        link.setAttribute('aria-label', `${linkText}, 새 창에서 열림`);
      }
    }
  }

  /**
   * 컨테이너 내의 모든 외부 링크에 속성 추가
   * @param {HTMLElement|string} container - 컨테이너 요소 또는 선택자
   */
  function enhanceExternalLinks(container) {
    const $ = ui.$ || ((sel) => document.querySelector(sel));
    const $all = ui.$all || ((sel, root) => Array.from((root || document).querySelectorAll(sel)));
    const containerEl = typeof container === 'string' ? $(container) : container;

    if (!containerEl) return;

    const links = $all('a[href]', containerEl);
    links.forEach(link => enhanceExternalLink(link));
  }

  /**
   * 네비게이션 링크가 라우터에 의해 가로채지 않도록 보호
   * activities.html이 아닌 다른 페이지로의 링크는 정상적으로 작동해야 함
   */
  function protectNavigationLinks() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // activities.html이 아닌 다른 페이지로의 링크는 라우터가 처리하지 않음
      if (href.includes('activities.html')) {
        // activities.html 내부 링크는 라우터가 처리
        return;
      }

      // 외부 링크는 새 탭에서 열리도록 처리
      if (isExternalLink(href)) {
        enhanceExternalLink(link);
        return;
      }

      // 다른 내부 페이지로의 링크는 정상적으로 작동 (라우터가 가로채지 않음)
      // Ctrl/Cmd 키를 누른 경우도 정상 작동
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
    });
  }

  /**
   * 활동 상세 페이지 본문의 링크 처리
   * 마크다운에서 생성된 링크도 외부 링크 속성을 추가
   */
  function enhanceActivityDetailLinks() {
    const container = document.querySelector('.activity-detail-body');
    if (container) {
      enhanceExternalLinks(container);
    }
  }

  /**
   * 링크 처리 초기화
   */
  function initLinks() {
    // 네비게이션 링크 보호
    protectNavigationLinks();

    // 기존 외부 링크 강화
    enhanceExternalLinks(document);

    // 활동 상세 페이지 본문의 링크 강화 (MutationObserver로 동적 콘텐츠 감지)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.classList && node.classList.contains('activity-detail-body')) {
              enhanceExternalLinks(node);
            } else if (node.querySelector) {
              const detailBody = node.querySelector('.activity-detail-body');
              if (detailBody) {
                enhanceExternalLinks(detailBody);
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Public API
  ui.activities = ui.activities || {};
  ui.activities.links = {
    initLinks: initLinks,
    enhanceExternalLinks: enhanceExternalLinks,
    enhanceExternalLink: enhanceExternalLink,
    isExternalLink: isExternalLink,
    enhanceActivityDetailLinks: enhanceActivityDetailLinks
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.activities.links;
  }
})();


