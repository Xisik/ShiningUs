(function () {
  'use strict';

  const ui = window.__ui || {};
  const CACHE_KEY = 'bichcheongmo:activities-json:v1';
  let refreshPromise = null;
  
  /**
   * 활동 데이터 구조 정의 및 파싱 유틸리티
   * 
   * Story 1.1: 활동 데이터 구조 정의 및 기본 파싱
   * Epic 1: 활동 콘텐츠 표시 및 탐색
   */

  /**
   * 활동 데이터의 필수 필드
   * @typedef {Object} ActivityRequiredFields
   * @property {string} title - 활동 제목
   * @property {string|Date} date - 활동 날짜
   * @property {string} summary - 활동 요약
   * @property {string} body - 활동 본문
   * @property {string} slug - 활동 슬러그 또는 ID (고유 식별자)
   * @property {boolean} published - 공개 여부
   */

  /**
   * 활동 데이터의 선택적 필드
   * @typedef {Object} ActivityOptionalFields
   * @property {string} [image] - 활동 이미지 URL
   * @property {Array<string>} [attachments] - 첨부 자료 URL 배열
   * @property {string} [category] - 활동 카테고리
   * @property {Object} [metadata] - 추가 메타데이터
   */

  /**
   * 완전한 활동 데이터 구조
   * @typedef {ActivityRequiredFields & ActivityOptionalFields} ActivityData
   */

  /**
   * 활동 데이터 파싱 결과
   * @typedef {Object} ParseResult
   * @property {ActivityData|null} data - 파싱된 활동 데이터 (성공 시)
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
   * @param {string} title - 활동 제목
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
   * 활동 데이터 파싱 및 검증
   * Story 2.4: 잘못된 형식 데이터 처리 강화
   * 
   * @param {Object} rawData - 노션에서 가져온 원시 데이터
   * @returns {ParseResult} 파싱 결과
   */
  function parseActivityData(rawData) {
    const result = {
      data: null,
      errors: [],
      warnings: [],
      isValid: false
    };

    // Story 2.4: 잘못된 형식 데이터 처리
    if (!rawData) {
      result.errors.push('활동 데이터가 없습니다.');
      return result;
    }
    
    if (typeof rawData !== 'object' || Array.isArray(rawData)) {
      result.errors.push('활동 데이터가 유효한 객체가 아닙니다.');
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
      result.errors.push('활동 제목이 필수입니다.');
    }

    const parsedDate = parseDate(dateInput);
    if (!parsedDate) {
      result.errors.push('활동 날짜가 유효하지 않습니다.');
    }

    if (!summary || summary.trim() === '') {
      result.warnings.push('활동 요약이 없습니다. 기본값을 사용합니다.');
    }

    if (!body || body.trim() === '') {
      result.warnings.push('활동 본문이 없습니다.');
    }

    if (!slug || slug.trim() === '') {
      result.errors.push('활동 슬러그 또는 ID가 필수입니다.');
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

      // 파싱된 데이터 구성
      result.data = {
        // 필수 필드
        title: String(title).trim(),
        date: parsedDate,
        summary: String(summary).trim() || String(title).trim(), // 요약이 없으면 제목 사용
        body: String(body).trim() || String(summary).trim() || String(title).trim(), // 본문이 없으면 요약 또는 제목 사용
        slug: String(slug).trim(),
        published: Boolean(published),
        
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
      console.error('Activity data parsing error:', error, 'Raw data:', rawData);
      return result;
    }
  }

  /**
   * 여러 활동 데이터를 일괄 파싱
   * @param {Array<Object>} rawDataArray - 원시 데이터 배열
   * @returns {Array<ActivityData>} 파싱된 활동 데이터 배열 (공개된 활동만)
   */
  function parseActivities(rawDataArray) {
    if (!Array.isArray(rawDataArray)) {
      console.error('활동 데이터가 배열이 아닙니다.');
      return [];
    }

    const parsedActivities = [];
    const errors = [];

    rawDataArray.forEach((rawData, index) => {
      const result = parseActivityData(rawData);
      
      if (result.isValid && result.data) {
        // 공개된 활동만 포함
        if (result.data.published) {
          parsedActivities.push(result.data);
        }
      } else {
        errors.push(`활동 ${index + 1} 파싱 실패: ${result.errors.join(', ')}`);
      }

      // 경고 로깅
      if (result.warnings.length > 0) {
        console.warn(`활동 ${index + 1} 경고:`, result.warnings);
      }
    });

    // 에러 로깅
    if (errors.length > 0) {
      console.error('활동 파싱 에러:', errors);
    }

    return parsedActivities;
  }

  /**
   * 활동 데이터를 날짜순으로 정렬 (최신 우선)
   * @param {Array<ActivityData>} activities - 활동 데이터 배열
   * @returns {Array<ActivityData>} 정렬된 활동 데이터 배열
   */
  function sortActivitiesByDate(activities) {
    if (!Array.isArray(activities)) {
      return [];
    }

    return [...activities].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : 0;
      const dateB = b.date instanceof Date ? b.date.getTime() : 0;
      return dateB - dateA; // 최신 우선 (내림차순)
    });
  }

  /**
   * 슬러그로 활동 찾기
   * @param {Array<ActivityData>} activities - 활동 데이터 배열
   * @param {string} slug - 찾을 슬러그
   * @returns {ActivityData|null} 찾은 활동 데이터 또는 null
   */
  function findActivityBySlug(activities, slug) {
    if (!Array.isArray(activities) || !slug) {
      return null;
    }

    return activities.find(activity => activity.slug === slug) || null;
  }

  /**
   * 활동 데이터 페이로드 정규화
   * payload가 배열이면 그대로, 객체면 payload.activities 사용
   * 
   * @param {Array|Object} payload - 원시 데이터 (배열 또는 객체)
   * @returns {Object} { activities: Array, metadata: Object|null } 형태
   */
  function normalizeActivitiesPayload(payload) {
    // payload가 배열이면 그대로, 객체면 payload.activities 사용
    const activities = Array.isArray(payload) ? payload : (payload?.activities ?? []);
    const metadata = Array.isArray(payload) ? null : (payload?._metadata ?? null);

    return { activities, metadata };
  }

  /**
   * 캐시된 activities.json 페이로드 읽기
   * @returns {Object|null} 캐시된 페이로드 또는 null
   */
  function readCachedActivitiesPayload() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      return parsed && parsed.payload ? parsed.payload : null;
    } catch (error) {
      console.warn('활동 캐시를 읽을 수 없습니다:', error);
      return null;
    }
  }

  /**
   * activities.json 페이로드 캐시 저장
   * @param {Object|Array} payload - 저장할 페이로드
   */
  function writeCachedActivitiesPayload(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        storedAt: new Date().toISOString(),
        payload
      }));
    } catch (error) {
      console.warn('활동 캐시를 저장할 수 없습니다:', error);
    }
  }

  /**
   * activities.json 최신 페이로드 fetch
   * @returns {Promise<Object>} { activities: Array, metadata: Object|null } 형태
   */
  async function fetchFreshActivitiesJson() {
    const res = await fetch('./data/activities.json', { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`Failed to fetch activities.json: ${res.status}`);
    }
    const payload = await res.json();
    writeCachedActivitiesPayload(payload);
    return normalizeActivitiesPayload(payload);
  }

  /**
   * 캐시 표시 후 백그라운드 최신화
   */
  function refreshActivitiesJsonInBackground() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = fetchFreshActivitiesJson()
      .then((normalized) => {
        window.dispatchEvent(new CustomEvent('bichcheongmo:activities-data-refreshed', {
          detail: normalized
        }));
        return normalized;
      })
      .catch((error) => {
        console.warn('활동 데이터 백그라운드 갱신 실패:', error);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  }

  /**
   * activities.json 파일을 fetch하고 정규화된 데이터 반환
   * 캐시된 공개 JSON을 먼저 사용하고 최신 데이터는 백그라운드에서 확인
   * 
   * @returns {Promise<Object>} { activities: Array, metadata: Object|null } 형태
   */
  async function fetchActivitiesJson() {
    const cachedPayload = readCachedActivitiesPayload();
    if (cachedPayload) {
      refreshActivitiesJsonInBackground();
      return normalizeActivitiesPayload(cachedPayload);
    }

    return fetchFreshActivitiesJson();
  }

  // Public API
  ui.activities = ui.activities || {};
  ui.activities.data = {
    parseActivityData: parseActivityData,
    parseActivities: parseActivities,
    sortActivitiesByDate: sortActivitiesByDate,
    findActivityBySlug: findActivityBySlug,
    generateSlug: generateSlug,
    parseDate: parseDate,
    normalizeActivitiesPayload: normalizeActivitiesPayload,
    fetchActivitiesJson: fetchActivitiesJson,
    refreshActivitiesJsonInBackground: refreshActivitiesJsonInBackground
  };

  // 전역 API (window.ActivitiesData) - 하위 호환성 및 편의성
  window.ActivitiesData = window.ActivitiesData || {};
  window.ActivitiesData.load = async function () {
    const { activities, metadata } = await fetchActivitiesJson();
    // 필요하면 전역 캐시
    window.ActivitiesData._metadata = metadata;
    window.ActivitiesData._items = activities;
    return activities;
  };

  // Export for testing (if needed)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui.activities.data;
  }
})();


