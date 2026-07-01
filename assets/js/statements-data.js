(function () {
  'use strict';

  const ui = window.__ui || {};
  const CACHE_KEY = 'bichcheongmo:statements-json:v1';
  let refreshPromise = null;
  
  /**
   * 성명 데이터 구조 정의 및 파싱 유틸리티
   * 
   * Story 1.1: 성명 데이터 구조 정의 및 기본 파싱
   * Epic 1: 성명 콘텐츠 표시 및 탐색
   */

  /**
   * 성명 데이터의 필수 필드
   * @typedef {Object} statementRequiredFields
   * @property {string} title - 성명 제목
   * @property {string|Date} date - 성명 날짜
   * @property {string} summary - 성명 요약
   * @property {string} body - 성명 본문
   * @property {string} slug - 성명 슬러그 또는 ID (고유 식별자)
   * @property {boolean} published - 공개 여부
   */

  /**
   * 성명 데이터의 선택적 필드
   * @typedef {Object} statementOptionalFields
   * @property {string} [image] - 성명 이미지 URL
   * @property {Array<string>} [attachments] - 첨부 자료 URL 배열
   * @property {string} [category] - 성명 카테고리
   * @property {Object} [metadata] - 추가 메타데이터
   */

  /**
   * 완전한 성명 데이터 구조
   * @typedef {statementRequiredFields & statementOptionalFields} statementData
   */

  /**
   * 성명 데이터 파싱 결과
   * @typedef {Object} ParseResult
   * @property {statementData|null} data - 파싱된 성명 데이터 (성공 시)
   * @property {Array<string>} errors - 에러 메시지 배열
   * @property {Array<string>} warnings - 경고 메시지 배열
   * @property {boolean} isValid - 데이터 유효성 여부
   */

  /**
   * 날짜를 표준 형식으로 변환
   * Story 2.4: 잘못된 형식 데이터 처리 강화
   * 
   * @param {string|Date|number} dateInput - 날짜 입력값
   * @returns {Date|null} 변환된 Date 객체 또는 null
   */
  function parseDate(dateInput) {
    if (!dateInput) return null;
    
    try {
      // 이미 Date 객체인 경우
      if (dateInput instanceof Date) {
        return isNaN(dateInput.getTime()) ? null : dateInput;
      }
      
      // 숫자 타임스탬프인 경우
      if (typeof dateInput === 'number') {
        const date = new Date(dateInput);
        return isNaN(date.getTime()) ? null : date;
      }
      
      // 문자열인 경우 (ISO 형식 또는 기타 형식)
      if (typeof dateInput === 'string') {
        // 빈 문자열 체크
        if (dateInput.trim() === '') return null;
        
        // ISO 형식 문자열 처리
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
          // ISO 형식이 아닌 경우 시도
          console.warn(`Invalid date format: "${dateInput}", attempting alternative parsing`);
          return null;
        }
        return date;
      }
      
      return null;
    } catch (error) {
      // Story 2.4: 예외 처리 강화
      console.warn('Date parsing error:', error.message, 'Input:', dateInput);
      return null;
    }
  }

  /**
   * 슬러그 생성 (제목에서)
   * @param {string} title - 성명 제목
   * @returns {string} 생성된 슬러그
   */
  function generateSlug(title) {
    if (!title) return '';
    
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // 특수문자 제거
      .replace(/[\s_-]+/g, '-') // 공백, 언더스코어, 하이픈을 하이픈으로 통일
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
  }

  /**
   * 성명 데이터 파싱 및 검증
   * Story 2.4: 잘못된 형식 데이터 처리 강화
   * 
   * @param {Object} rawData - 노션에서 가져온 원시 데이터
   * @returns {ParseResult} 파싱 결과
   */
  function parseStatementData(rawData) {
    const result = {
      data: null,
      errors: [],
      warnings: [],
      isValid: false
    };

    // Story 2.4: 잘못된 형식 데이터 처리
    if (!rawData) {
      result.errors.push('성명 데이터가 없습니다.');
      return result;
    }
    
    if (typeof rawData !== 'object' || Array.isArray(rawData)) {
      result.errors.push('성명 데이터가 유효한 객체가 아닙니다.');
      return result;
    }

    try {
      // 필수 필드 검증 및 추출 (안전한 추출)
      const title = (rawData.title && typeof rawData.title === 'string') 
        ? rawData.title 
        : (rawData.name && typeof rawData.name === 'string' ? rawData.name : '');
      
      const dateInput = rawData.date || rawData.created_time || rawData.last_edited_time;
      
      const summary = (rawData.summary && typeof rawData.summary === 'string')
        ? rawData.summary
        : (rawData.description && typeof rawData.description === 'string' ? rawData.description : '');
      
      const body = (rawData.body && typeof rawData.body === 'string')
        ? rawData.body
        : (rawData.content && typeof rawData.content === 'string' ? rawData.content : '');
      
      const slug = (rawData.slug && typeof rawData.slug === 'string')
        ? rawData.slug
        : (rawData.id && typeof rawData.id === 'string' ? rawData.id : generateSlug(title));
      
      // Story 2.4: published 필드 안전하게 처리
      // 보안: opt-in 공개 정책. 공개 여부가 없으면 비공개로 처리한다.
      let published = false; // 기본값: 비공개
      if (rawData.published !== undefined) {
        if (typeof rawData.published === 'boolean') {
          published = rawData.published;
        } else if (typeof rawData.published === 'string') {
          // 문자열인 경우 변환
          published = rawData.published.toLowerCase() === 'true' || rawData.published === '1';
        }
      } else if (rawData.public !== undefined) {
        if (typeof rawData.public === 'boolean') {
          published = rawData.public;
        } else if (typeof rawData.public === 'string') {
          published = rawData.public.toLowerCase() === 'true' || rawData.public === '1';
        }
      }

    // 필수 필드 검증
    if (!title || title.trim() === '') {
      result.errors.push('성명 제목이 필수입니다.');
    }

    const parsedDate = parseDate(dateInput);
    if (!parsedDate) {
      result.errors.push('성명 날짜가 유효하지 않습니다.');
    }

    if (!summary || summary.trim() === '') {
      result.warnings.push('성명 요약이 없습니다. 기본값을 사용합니다.');
    }

    if (!body || body.trim() === '') {
      result.warnings.push('성명 본문이 없습니다.');
    }

    if (!slug || slug.trim() === '') {
      result.errors.push('성명 슬러그 또는 ID가 필수입니다.');
    }

    // 에러가 있으면 파싱 중단
    if (result.errors.length > 0) {
      return result;
    }

      // 선택적 필드 추출 (안전하게)
      const image = (rawData.image && typeof rawData.image === 'string') 
        ? rawData.image 
        : (rawData.cover && typeof rawData.cover === 'string' ? rawData.cover : null);
      
      let attachments = [];
      if (Array.isArray(rawData.attachments)) {
        attachments = rawData.attachments.filter(item => typeof item === 'string');
      } else if (rawData.attachments && typeof rawData.attachments === 'string') {
        attachments = [rawData.attachments];
      }
      
      const category = (rawData.category && typeof rawData.category === 'string')
        ? rawData.category
        : (rawData.type && typeof rawData.type === 'string' ? rawData.type : null);
      
      const metadata = (rawData.metadata && typeof rawData.metadata === 'object' && !Array.isArray(rawData.metadata))
        ? rawData.metadata
        : {};

      // 파싱된 데이터 구성 (id는 상세 조회 시 slug 대체 매칭용)
      result.data = {
        // 필수 필드
        title: String(title).trim(),
        date: parsedDate,
        summary: String(summary).trim() || String(title).trim(), // 요약이 없으면 제목 사용
        body: String(body).trim() || String(summary).trim() || String(title).trim(), // 본문이 없으면 요약 또는 제목 사용
        slug: String(slug).trim(),
        published: Boolean(published),
        id: (rawData.id && typeof rawData.id === 'string') ? rawData.id : null,
        // 선택적 필드
        image: image,
        attachments: attachments,
        category: category,
        metadata: {
          ...metadata,
          createdAt: rawData.created_time || parsedDate,
          updatedAt: rawData.last_edited_time || parsedDate
        }
      };

      result.isValid = true;
      return result;
    } catch (error) {
      // Story 2.4: 예외 처리 강화
      result.errors.push(`데이터 파싱 중 오류 발생: ${error.message}`);
      console.error('statement data parsing error:', error, 'Raw data:', rawData);
      return result;
    }
  }

  /**
   * 여러 성명 데이터를 일괄 파싱
   * @param {Array<Object>} rawDataArray - 원시 데이터 배열
   * @returns {Array<statementData>} 파싱된 성명 데이터 배열 (공개된 성명만)
   */
  function parseStatements(rawDataArray) {
    if (!Array.isArray(rawDataArray)) {
      console.error('성명 데이터가 배열이 아닙니다.');
      return [];
    }

    const parsedstatements = [];
    const errors = [];

    rawDataArray.forEach((rawData, index) => {
      const result = parseStatementData(rawData);
      
      if (result.isValid && result.data) {
        // 공개된 성명만 포함
        if (result.data.published) {
          parsedstatements.push(result.data);
        }
      } else {
        errors.push(`성명 ${index + 1} 파싱 실패: ${result.errors.join(', ')}`);
      }

      // 경고 로깅
      if (result.warnings.length > 0) {
        console.warn(`성명 ${index + 1} 경고:`, result.warnings);
      }
    });

    // 에러 로깅
    if (errors.length > 0) {
      console.error('성명 파싱 에러:', errors);
    }

    return parsedstatements;
  }

  /**
   * 성명 데이터를 날짜순으로 정렬 (최신 우선)
   * @param {Array<statementData>} statements - 성명 데이터 배열
   * @returns {Array<statementData>} 정렬된 성명 데이터 배열
   */
  function sortStatementsByDate(statements) {
    if (!Array.isArray(statements)) {
      return [];
    }

    return [...statements].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : 0;
      const dateB = b.date instanceof Date ? b.date.getTime() : 0;
      return dateB - dateA; // 최신 우선 (내림차순)
    });
  }

  /**
   * 슬러그로 성명 찾기 (공백·하이픈 정규화, id 폴백)
   * @param {Array<statementData>} statements - 성명 데이터 배열
   * @param {string} slug - 찾을 슬러그 (URL에서 온 값)
   * @returns {statementData|null} 찾은 성명 데이터 또는 null
   */
  function findStatementBySlug(statements, slug) {
    if (!Array.isArray(statements) || slug == null) {
      return null;
    }
    const normalized = String(slug).trim();
    if (!normalized) return null;
    const normalizedNoHyphen = normalized.replace(/-/g, '');

    for (let i = 0; i < statements.length; i++) {
      const s = statements[i];
      const sSlug = String(s.slug || '').trim();
      const sSlugNoHyphen = sSlug.replace(/-/g, '');
      if (sSlug === normalized || sSlugNoHyphen === normalizedNoHyphen) return s;
      const sId = (s.id || '').toString().replace(/-/g, '');
      if (sId && (sId === normalizedNoHyphen || sId === normalized || sId.startsWith(normalizedNoHyphen) || normalizedNoHyphen.startsWith(sId))) return s;
    }
    return null;
  }

  /**
   * 성명 데이터 페이로드 정규화
   * payload가 배열이면 그대로, 객체면 payload.statements 사용
   * 
   * @param {Array|Object} payload - 원시 데이터 (배열 또는 객체)
   * @returns {Object} { statements: Array, metadata: Object|null } 형태
   */
  function normalizeStatementsPayload(payload) {
    // payload가 배열이면 그대로, 객체면 payload.statements 사용
    const statements = Array.isArray(payload) ? payload : (payload?.statements ?? []);
    const metadata = Array.isArray(payload) ? null : (payload?._metadata ?? null);

    return { statements, metadata };
  }

  /**
   * 캐시된 statements.json 페이로드 읽기
   * @returns {Object|null} 캐시된 페이로드 또는 null
   */
  function readCachedStatementsPayload() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      return parsed && parsed.payload ? parsed.payload : null;
    } catch (error) {
      console.warn('성명 캐시를 읽을 수 없습니다:', error);
      return null;
    }
  }

  /**
   * statements.json 페이로드 캐시 저장
   * @param {Object|Array} payload - 저장할 페이로드
   */
  function writeCachedStatementsPayload(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        storedAt: new Date().toISOString(),
        payload
      }));
    } catch (error) {
      console.warn('성명 캐시를 저장할 수 없습니다:', error);
    }
  }

  /**
   * statements.json 최신 페이로드 fetch
   * @returns {Promise<Object>} { statements: Array, metadata: Object|null } 형태
   */
  async function fetchFreshStatementsJson() {
    const res = await fetch('./data/statements.json', { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`Failed to fetch statements.json: ${res.status}`);
    }
    const payload = await res.json();
    writeCachedStatementsPayload(payload);
    return normalizeStatementsPayload(payload);
  }

  /**
   * 캐시 표시 후 백그라운드 최신화
   */
  function refreshStatementsJsonInBackground() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = fetchFreshStatementsJson()
      .then((normalized) => {
        window.dispatchEvent(new CustomEvent('bichcheongmo:statements-data-refreshed', {
          detail: normalized
        }));
        return normalized;
      })
      .catch((error) => {
        console.warn('성명 데이터 백그라운드 갱신 실패:', error);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  }

  /**
   * statements.json 파일을 fetch하고 정규화된 데이터 반환
   * 캐시된 공개 JSON을 먼저 사용하고 최신 데이터는 백그라운드에서 확인
   * 
   * @returns {Promise<Object>} { statements: Array, metadata: Object|null } 형태
   */
  async function fetchStatementsJson() {
    const cachedPayload = readCachedStatementsPayload();
    if (cachedPayload) {
      refreshStatementsJsonInBackground();
      return normalizeStatementsPayload(cachedPayload);
    }

    return fetchFreshStatementsJson();
  }

  // Public API
  ui.statements = ui.statements || {};
  ui.statements.data = {
    parseStatementData: parseStatementData,
    parseStatements: parseStatements,
    sortStatementsByDate: sortStatementsByDate,
    findStatementBySlug: findStatementBySlug,
    generateSlug: generateSlug,
    parseDate: parseDate,
    normalizeStatementsPayload: normalizeStatementsPayload,
    fetchStatementsJson: fetchStatementsJson,
    refreshStatementsJsonInBackground: refreshStatementsJsonInBackground
  };

  // 전역 API (window.statementsData) - 하위 호환성 및 편의성
  window.statementsData = window.statementsData || {};
  window.statementsData.load = async function () {
    const { statements, metadata } = await fetchStatementsJson();
    // 필요하면 전역 캐시
    window.statementsData._metadata = metadata;
    window.statementsData._items = statements;
    return statements;
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.statements.data;
  }
})();



