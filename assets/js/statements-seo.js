(function () {
  'use strict';

  const ui = window.__ui || {};

  function t(text) {
    return ui.i18n && ui.i18n.t ? ui.i18n.t(text) : text;
  }

  function getLocale() {
    return ui.i18n && ui.i18n.getLanguage && ui.i18n.getLanguage() === 'en'
      ? 'en_US'
      : 'ko_KR';
  }
  
  /**
   * 성명 페이지 SEO 최적화 모듈
   * 
   * Story 1.5: SEO 최적화 (메타 태그 및 정적 생성) - MVP 범위
   * Epic 1: 성명 콘텐츠 표시 및 탐색
   * 
   * GitHub Pages 정적 호스팅 환경에서 클라이언트 사이드 SEO 최적화
   */

  /**
   * 메타 태그 생성 또는 업데이트
   * @param {string} name - 메타 태그 name 속성
   * @param {string} content - 메타 태그 content
   * @param {string} [property] - property 속성 (Open Graph용)
   */
  function setMetaTag(name, content, property) {
    if (!content) return;

    const selector = property 
      ? `meta[property="${property}"]` 
      : `meta[name="${name}"]`;
    
    let meta = document.querySelector(selector);
    
    if (!meta) {
      meta = document.createElement('meta');
      if (property) {
        meta.setAttribute('property', property);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  }

  /**
   * 링크 태그 생성 또는 업데이트
   * @param {string} rel - rel 속성
   * @param {string} href - href 속성
   */
  function setLinkTag(rel, href) {
    if (!href) return;

    const selector = `link[rel="${rel}"]`;
    let link = document.querySelector(selector);
    
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    
    link.setAttribute('href', href);
  }

  /**
   * 구조화된 데이터 (JSON-LD) 추가
   * @param {Object} data - 구조화된 데이터 객체
   */
  function setStructuredData(data) {
    // 기존 구조화된 데이터 제거
    const existing = document.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }

    if (!data) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * 성명 목록 페이지 SEO 설정
   */
  function setListPageSEO() {
    const title = '성명 | Statements';
    const description = t('빛청모의 다양한 성명과 소식을 공유하는 공간입니다.');
    const url = window.location.origin + window.location.pathname;
    const image = window.location.origin + '/assets/img/logo.jpg';

    // 기본 메타 태그
    document.title = title;
    setMetaTag('description', description);
    setMetaTag('keywords', '빛청모, 성소수자, 공조, 성명, 커뮤니티');

    // Open Graph 태그
    setMetaTag(null, 'website', 'og:type');
    setMetaTag(null, title, 'og:title');
    setMetaTag(null, description, 'og:description');
    setMetaTag(null, url, 'og:url');
    setMetaTag(null, image, 'og:image');
    setMetaTag(null, getLocale(), 'og:locale');

    // Twitter Card 태그
    setMetaTag('twitter:card', 'summary');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', image);

    // 구조화된 데이터 (Organization)
    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': t('빛청모'),
      'url': window.location.origin,
      'logo': image,
      'description': description
    });
  }

  /**
   * 성명 상세 페이지 SEO 설정
   * @param {Object} statement - 성명 데이터
   */
  function setDetailPageSEO(statement) {
    if (!statement) {
      setListPageSEO();
      return;
    }

    const { title, summary, body, slug, date, image } = statement;
    const siteTitle = '성명 | Statements';
    const pageTitle = `${title} | ${siteTitle}`;
    const description = summary || body.substring(0, 160) || t('빛청모의 성명을 확인하세요.');
    const url = window.location.origin + window.location.pathname + `?statement=${encodeURIComponent(slug)}`;
    const ogImage = image || window.location.origin + '/assets/img/logo.jpg';
    const publishedDate = date instanceof Date ? date.toISOString() : new Date().toISOString();

    // 페이지 제목
    document.title = pageTitle;

    // 기본 메타 태그
    setMetaTag('description', description);
    setMetaTag('keywords', `빛청모, 성명, ${title}`);

    // Open Graph 태그
    setMetaTag(null, 'article', 'og:type');
    setMetaTag(null, pageTitle, 'og:title');
    setMetaTag(null, description, 'og:description');
    setMetaTag(null, url, 'og:url');
    setMetaTag(null, ogImage, 'og:image');
    setMetaTag(null, getLocale(), 'og:locale');
    setMetaTag(null, publishedDate, 'article:published_time');

    // Twitter Card 태그
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', pageTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // Canonical URL
    setLinkTag('canonical', url);

    // 구조화된 데이터 (Article)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': title,
      'description': description,
      'datePublished': publishedDate,
      'author': {
        '@type': 'Organization',
        'name': t('빛청모')
      },
      'publisher': {
        '@type': 'Organization',
        'name': t('빛청모'),
        'logo': {
          '@type': 'ImageObject',
          'url': window.location.origin + '/assets/img/logo.jpg'
        }
      }
    };

    if (image) {
      structuredData.image = {
        '@type': 'ImageObject',
        'url': image.startsWith('http') ? image : window.location.origin + image
      };
    }

    if (date instanceof Date) {
      structuredData.dateModified = date.toISOString();
    }

    setStructuredData(structuredData);
  }

  /**
   * SEO 태그 초기화 (기본값)
   */
  function initSEO() {
    // 기본 SEO 설정 (목록 페이지)
    setListPageSEO();
  }

  // Public API
  ui.statements = ui.statements || {};
  ui.statements.seo = {
    setListPageSEO: setListPageSEO,
    setDetailPageSEO: setDetailPageSEO,
    initSEO: initSEO,
    setMetaTag: setMetaTag,
    setLinkTag: setLinkTag,
    setStructuredData: setStructuredData
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.statements.seo;
  }
})();




