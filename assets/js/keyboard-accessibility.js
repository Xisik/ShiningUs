/**
 * 키보드 접근성 모듈
 * 
 * Story 3.1: 키보드 접근성 구현
 * Epic 3: 접근성 및 사용성
 * 
 * 키보드만으로 모든 기능에 접근할 수 있도록 지원합니다.
 */

(function () {
  'use strict';

  const ui = window.__ui || {};

  /**
   * Skip to content 링크 추가
   * Story 3.1: 키보드 사용자가 메인 콘텐츠로 바로 이동할 수 있도록
   */
  function initSkipLink() {
    // Skip link가 이미 있으면 추가하지 않음
    if (document.getElementById('skip-to-content')) {
      return;
    }

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-content';
    skipLink.href = '#main-content';
    skipLink.textContent = '본문으로 건너뛰기';
    skipLink.className = 'skip-link';
    
    // 스타일 적용
    skipLink.style.cssText = `
      position: absolute;
      top: -100px;
      left: 0;
      background: var(--text-primary, #000);
      color: var(--text-secondary, #fff);
      padding: 1rem;
      text-decoration: none;
      z-index: 1000;
      border: 0.2rem solid var(--text-primary, #000);
    `;

    skipLink.addEventListener('focus', function() {
      this.style.top = '0';
    });

    skipLink.addEventListener('blur', function() {
      this.style.top = '-100px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * 메인 콘텐츠에 ID 추가 (skip link용)
   */
  function ensureMainContentId() {
    const main = document.querySelector('main');
    if (main && !main.id) {
      main.id = 'main-content';
    }
  }

  /**
   * 버튼과 링크에 Enter/Space 키 지원 추가
   * Story 3.1: Enter 또는 Space 키로 요소를 활성화할 수 있도록
   */
  function enhanceKeyboardActivation() {
    // 모든 버튼과 링크에 키보드 이벤트 추가
    document.addEventListener('keydown', function(e) {
      const target = e.target;
      
      // 버튼 또는 역할이 버튼인 요소
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        // Space 키로 활성화 (기본 동작 방지)
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          target.click();
        }
        // Enter 키는 기본 동작 사용 (form 내부가 아닌 경우)
        if (e.key === 'Enter' && target.type !== 'submit' && target.type !== 'button') {
          // 기본 동작 사용
        }
      }
      
      // 링크에 Space 키 지원 (일부 브라우저에서 기본 동작이 없음)
      if (target.tagName === 'A' && (e.key === ' ' || e.key === 'Spacebar')) {
        // 기본 스크롤 동작 방지
        if (!target.href || target.href === '#' || target.href.includes('#')) {
          e.preventDefault();
          target.click();
        }
      }
    });
  }

  /**
   * 모달 내부 포커스 트랩 관리
   * Story 3.1: 키보드 트랩이 발생하지 않도록 (모든 요소에서 탈출 가능)
   */
  function enhanceModalKeyboardAccessibility() {
    document.addEventListener('keydown', function(e) {
      const modal = document.querySelector('.modal.is-open');
      if (!modal) return;

      // ESC 키로 모달 닫기 (이미 구현되어 있지만 확실히)
      if (e.key === 'Escape') {
        const closeBtn = modal.querySelector('[data-close-modal]');
        if (closeBtn) {
          closeBtn.click();
        }
      }

      // Tab 키 트랩 방지: 모달 내부에서만 포커스 순환
      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift+Tab: 첫 번째 요소에서 마지막으로
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // Tab: 마지막 요소에서 첫 번째로
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  /**
   * 활동 카드 키보드 접근성 개선
   * Story 3.1: 활동 목록과 상세 페이지 모두 키보드로 완전히 탐색 가능
   */
  function enhanceActivityCardAccessibility() {
    // 동적으로 추가되는 활동 카드도 처리할 수 있도록 MutationObserver 사용
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            // 활동 카드 링크에 키보드 접근성 개선
            const activityLinks = node.querySelectorAll ? node.querySelectorAll('.activity-link') : [];
            activityLinks.forEach(function(link) {
              // tabindex가 없으면 추가 (이미 포커스 가능하지만 명시적으로)
              if (!link.hasAttribute('tabindex')) {
                link.setAttribute('tabindex', '0');
              }
            });
          }
        });
      });
    });

    const container = document.getElementById('activities-list');
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * 논리적인 포커스 순서 보장
   * Story 3.1: 포커스 순서가 논리적이고 직관적
   */
  function ensureLogicalTabOrder() {
    // tabindex가 잘못 설정된 요소 확인 및 수정
    document.querySelectorAll('[tabindex]').forEach(function(el) {
      const tabindex = parseInt(el.getAttribute('tabindex'), 10);
      
      // tabindex > 0은 피해야 함 (논리적 순서 방해)
      if (tabindex > 0) {
        console.warn('Element with tabindex > 0 found:', el);
        // 필요시 0으로 변경하거나 제거
        if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
          el.setAttribute('tabindex', '0');
        }
      }
    });
  }

  /**
   * 초기화 함수
   */
  function init() {
    // DOM 로드 완료 후 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initSkipLink();
        ensureMainContentId();
        enhanceKeyboardActivation();
        enhanceModalKeyboardAccessibility();
        enhanceActivityCardAccessibility();
        ensureLogicalTabOrder();
      });
    } else {
      initSkipLink();
      ensureMainContentId();
      enhanceKeyboardActivation();
      enhanceModalKeyboardAccessibility();
      enhanceActivityCardAccessibility();
      ensureLogicalTabOrder();
    }
  }

  // Public API
  ui.keyboard = {
    init: init,
    initSkipLink: initSkipLink,
    enhanceKeyboardActivation: enhanceKeyboardActivation,
    enhanceModalKeyboardAccessibility: enhanceModalKeyboardAccessibility
  };

  // 자동 초기화
  init();

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.keyboard;
  }
})();

