(function () {
  'use strict';

  const ui = window.__ui;
  if (!ui || !ui.activities) {
    console.error('활동 모듈이 로드되지 않았습니다.');
    return;
  }

  const { parseActivities, sortActivitiesByDate, findActivityBySlug } = ui.activities.data;
  const { renderActivityList, showLoadingState, showErrorState } = ui.activities.list;
  const { renderActivityDetail } = ui.activities.detail || {};
  const { initRouter, getActivitySlugFromUrl, showNotFoundError } = ui.activities.router || {};
  const { setListPageSEO, setDetailPageSEO, initSEO } = ui.activities.seo || {};
  const { initLinks, enhanceActivityDetailLinks } = ui.activities.links || {};
  const $ = ui.$ || ((sel) => document.querySelector(sel));

  // 활동 데이터 캐시
  let cachedActivities = null;
  let cachedMetadata = null;

  function cacheActivitiesResult(result) {
    const parsed = parseActivities(result.activities);
    cachedActivities = parsed;
    cachedMetadata = result.metadata;
    return parsed;
  }

  /**
   * 활동 상세 페이지 렌더링
   * 
   * Story 1.3: 활동 상세 페이지 구현
   * Story 1.4: 고유 URL 및 라우팅
   * 
   * @param {string|null} slug - 활동 slug (null이면 목록 표시)
   */
  function renderRoute(slug) {
    const container = $('#activities-list');
    if (!container) {
      console.error('활동 컨테이너를 찾을 수 없습니다.');
      return;
    }

    // 목록 페이지
    if (!slug) {
      // SEO 설정 (목록 페이지)
      if (setListPageSEO) {
        setListPageSEO();
      }

      // 캐시된 데이터가 있으면 사용
      if (cachedActivities) {
        const sorted = sortActivitiesByDate(cachedActivities);
        renderActivityList(sorted, container);
        // Story 2.4: 마지막 업데이트 시각 표시
        if (cachedMetadata && cachedMetadata.syncStatus !== 'success') {
          const lastUpdated = cachedMetadata.lastUpdated ? new Date(cachedMetadata.lastUpdated) : null;
          showSyncStatus(cachedMetadata, lastUpdated);
        }
        return;
      }

      // 로딩 상태 표시
      showLoadingState(container, 'list');

      // 데이터 로드
      loadActivitiesData()
        .then(result => {
          const parsed = cacheActivitiesResult(result);
          
          const sorted = sortActivitiesByDate(parsed);
          renderActivityList(sorted, container);
          
          // Story 2.4: 동기화 상태 및 마지막 업데이트 시각 표시
          if (result.metadata) {
            const lastUpdated = result.metadata.lastUpdated ? new Date(result.metadata.lastUpdated) : null;
            showSyncStatus(result.metadata, lastUpdated);
          }
        })
        .catch(error => {
          console.error('활동 목록 로드 실패:', error);
          const lastUpdated = cachedMetadata && cachedMetadata.lastUpdated ? new Date(cachedMetadata.lastUpdated) : null;
          showErrorState(container, error.message || '활동 목록을 불러올 수 없습니다.', lastUpdated);
        });
      return;
    }

    // 상세 페이지
    // 로딩 상태 표시
    if (ui.activities.list && ui.activities.list.showLoadingState) {
      ui.activities.list.showLoadingState(container, 'detail');
    }

    // 캐시된 데이터가 있으면 사용
    if (cachedActivities) {
      const activity = findActivityBySlug(cachedActivities, slug);
      if (activity && renderActivityDetail) {
        // SEO 설정 (상세 페이지)
        if (setDetailPageSEO) {
          setDetailPageSEO(activity);
        }
        renderActivityDetail(activity, container);
        // 외부 링크 처리
        if (enhanceActivityDetailLinks) {
          enhanceActivityDetailLinks();
        }
      } else {
        // 활동을 찾을 수 없음
        if (showNotFoundError) {
          showNotFoundError(container, '요청하신 활동을 찾을 수 없습니다.');
        } else if (ui.activities.detail && ui.activities.detail.showErrorState) {
          ui.activities.detail.showErrorState(container, '요청하신 활동을 찾을 수 없습니다.');
        }
        // SEO는 목록 페이지로 설정
        if (setListPageSEO) {
          setListPageSEO();
        }
      }
      return;
    }

    // 데이터 로드
    loadActivitiesData()
      .then(result => {
        const parsed = cacheActivitiesResult(result);
        
        const activity = findActivityBySlug(parsed, slug);
        
        if (activity && renderActivityDetail) {
          // SEO 설정 (상세 페이지)
          if (setDetailPageSEO) {
            setDetailPageSEO(activity);
          }
          renderActivityDetail(activity, container);
          // 외부 링크 처리
          if (enhanceActivityDetailLinks) {
            enhanceActivityDetailLinks();
          }
        } else {
          // 활동을 찾을 수 없음
          if (showNotFoundError) {
            showNotFoundError(container, '요청하신 활동을 찾을 수 없습니다.');
          } else if (ui.activities.detail && ui.activities.detail.showErrorState) {
            ui.activities.detail.showErrorState(container, '요청하신 활동을 찾을 수 없습니다.');
          }
          // SEO는 목록 페이지로 설정
          if (setListPageSEO) {
            setListPageSEO();
          }
        }
      })
      .catch(error => {
        console.error('활동 상세 로드 실패:', error);
        if (ui.activities.detail && ui.activities.detail.showErrorState) {
          ui.activities.detail.showErrorState(container, error.message || '활동 상세 내용을 불러올 수 없습니다.');
        }
        // SEO는 목록 페이지로 설정
        if (setListPageSEO) {
          setListPageSEO();
        }
      });
  }


  /**
   * 활동 데이터 로드
   * 
   * Story 2.1: 노션 데이터 소스 연결 및 인증 설정
   * Story 2.2: 노션 데이터 가져오기 및 변환
   * Story 2.4: 에러 처리 및 폴백 메커니즘
   * 
   * GitHub Actions에서 노션 데이터를 동기화하여 생성한 JSON 파일을 로드합니다.
   * 클라이언트 사이드에서는 인증 정보 없이 공개 JSON 파일만 읽습니다.
   * 
   * @returns {Promise<Object>} { activities: Array, metadata: Object } 형태의 데이터
   */
  function loadActivitiesData() {
    const { fetchActivitiesJson, normalizeActivitiesPayload } = ui.activities.data || {};
    
    // 정규화 함수가 있으면 사용 (activities-data.js에서 제공)
    if (fetchActivitiesJson) {
      return fetchActivitiesJson()
        .catch(error => {
          console.error('활동 데이터 로드 실패:', error);
          // 에러 발생 시 테스트 데이터 사용 (폴백)
          console.warn('테스트 데이터를 사용합니다.');
          return getTestData().then(testData => {
            // 테스트 데이터도 정규화 함수로 처리
            const normalized = normalizeActivitiesPayload ? 
              normalizeActivitiesPayload(testData) : 
              { activities: testData, metadata: null };
            return {
              activities: normalized.activities,
              metadata: normalized.metadata || {
                lastUpdated: null,
                syncStatus: 'fallback',
                errorMessage: `Data load failed: ${error.message}`
              }
            };
          });
        });
    }
    
    // 하위 호환성: 정규화 함수가 없으면 기존 방식 사용
    const url = './data/activities.json';
    
    return fetch(url, { cache: 'no-cache' })
      .then(response => {
        if (!response.ok) {
          // JSON 파일이 없거나 에러인 경우 테스트 데이터 사용 (폴백)
          console.warn('활동 데이터 파일을 찾을 수 없습니다. 테스트 데이터를 사용합니다.');
          return getTestData().then(testData => ({
            activities: testData,
            metadata: {
              lastUpdated: null,
              syncStatus: 'fallback',
              errorMessage: 'Data file not found, using test data'
            }
          }));
        }
        return response.json().then(data => {
          // 정규화 함수 사용
          if (normalizeActivitiesPayload) {
            return normalizeActivitiesPayload(data);
          }
          
          // Story 2.4: 새로운 형식 (메타데이터 포함) 또는 기존 형식 (배열) 지원
          if (data.activities && data._metadata) {
            // 새로운 형식
            return {
              activities: data.activities,
              metadata: data._metadata
            };
          } else if (Array.isArray(data)) {
            // 기존 형식 (배열)
            return {
              activities: data,
              metadata: {
                lastUpdated: null,
                syncStatus: 'unknown',
                errorMessage: null
              }
            };
          } else {
            // 잘못된 형식
            console.error('Invalid data format:', data);
            throw new Error('Invalid data format');
          }
        });
      })
      .catch(error => {
        console.error('활동 데이터 로드 실패:', error);
        // 에러 발생 시 테스트 데이터 사용 (폴백)
        console.warn('테스트 데이터를 사용합니다.');
        return getTestData().then(testData => ({
          activities: testData,
          metadata: {
            lastUpdated: null,
            syncStatus: 'fallback',
            errorMessage: `Data load failed: ${error.message}`
          }
        }));
      });
  }

  /**
   * 테스트 데이터 반환 (폴백용)
   * 
   * Story 2.2에서 실제 노션 데이터가 준비되면 이 함수는 사용되지 않습니다.
   * 
   * @returns {Promise<Array>} 테스트 데이터 배열
   */
  function getTestData() {
    return new Promise((resolve) => {
      // 약간의 지연 후 테스트 데이터 반환 (시뮬레이션)
      setTimeout(() => {
        // 테스트 데이터 (Story 2.2에서 실제 노션 데이터로 교체)
        const testData = [
          {
            title: '2026년 1월 정기 모임',
            date: '2026-01-15',
            summary: '월간 정기 모임을 진행했습니다. 다양한 주제에 대해 논의하고 정보를 공유했습니다.',
            body: `이번 모임에서는 다음과 같은 주제들을 다뤘습니다:

## 주요 논의 사항

- 커뮤니티 내 **상호 지원** 방안
- 향후 활동 계획 수립
- 새로운 회원 환영 프로그램

## 활동 내용

모임 중에는 참석자들이 각자의 경험을 공유하고, 서로에게 도움이 되는 정보를 나누는 시간을 가졌습니다. 특히 **안전한 공간**에서의 대화가 중요하다는 점에 모두가 공감했습니다.

더 자세한 내용은 [문의하기 페이지](./contact.html)를 통해 연락주시기 바랍니다.`,
            slug: '2026-01-regular-meeting',
            published: true,
            category: '모임'
          },
          {
            title: '커뮤니티 상담 서비스 시작',
            date: '2026-01-10',
            summary: '성소수자 커뮤니티를 위한 상담 서비스를 시작했습니다.',
            body: `성소수자 커뮤니티를 위한 상담 서비스를 시작하게 되었습니다.

## 서비스 개요

이 서비스는 다음과 같은 특징을 가지고 있습니다:

- **비밀 보장**: 모든 상담 내용은 철저히 비밀로 보장됩니다
- **무료 제공**: 경제적 부담 없이 이용하실 수 있습니다
- **전문 상담**: 경험이 풍부한 상담사가 도와드립니다

## 이용 방법

상담을 원하시는 분은 [문의하기 페이지](./contact.html)를 통해 연락주시기 바랍니다.`,
            slug: '2026-01-counseling-service',
            published: true,
            category: '서비스'
          },
          {
            title: '2025년 12월 연말 모임',
            date: '2025-12-28',
            summary: '연말을 맞아 단체 회원들과 함께 모임을 가졌습니다.',
            body: `연말을 맞아 단체 회원들과 함께 뜻깊은 모임을 가졌습니다.

## 모임 내용

이번 연말 모임에서는:

- 올해 활동을 돌아보는 시간
- 내년 계획에 대한 논의
- 회원들 간의 친목 도모

등의 시간을 가졌습니다.

모든 참석자분들께 감사드립니다!`,
            slug: '2025-12-year-end-meeting',
            published: true,
            category: '모임'
          }
        ];

        // 실제 구현에서는 여기서 노션 API 호출 또는 JSON 파일 로드
        // const response = await fetch('./data/activities.json');
        // const data = await response.json();
        // resolve(data);

        resolve(testData);
      }, 300); // 시뮬레이션 지연
    });
  }

  /**
   * 동기화 상태 표시 (Story 2.4: 에러 처리 및 폴백 메커니즘)
   * @param {Object} metadata - 메타데이터
   * @param {Date} lastUpdated - 마지막 업데이트 시각
   */
  function showSyncStatus(metadata, lastUpdated) {
    if (!metadata || metadata.syncStatus === 'success') {
      return; // 성공 시 표시하지 않음
    }
    
    const { formatDateKorean } = ui.activities.list || {};
    const toast = ui.toast || {};
    
    let message = '';
    if (metadata.syncStatus === 'partial') {
      message = '일부 데이터를 불러오지 못했습니다.';
    } else if (metadata.syncStatus === 'error' || metadata.syncStatus === 'fallback') {
      message = '최신 데이터를 불러오지 못했습니다. 캐시된 데이터를 표시합니다.';
    }
    
    if (lastUpdated && formatDateKorean) {
      const formattedDate = formatDateKorean(lastUpdated);
      message += ` (마지막 업데이트: ${formattedDate})`;
    }
    
    if (message && toast.show) {
      toast.show(message, 'warning', 5000);
    } else if (message) {
      console.warn('Sync status:', message);
    }
  }

  /**
   * 메인 초기화 함수
   * 
   * Story 1.4: 고유 URL 및 라우팅
   * Story 1.5: SEO 최적화
   * Story 1.6: 네비게이션 및 외부 링크
   * 라우터를 초기화하고 초기 라우트를 렌더링합니다.
   */
  function init() {
    // 링크 처리 초기화 (네비게이션 및 외부 링크)
    if (initLinks) {
      initLinks();
    }

    // SEO 초기화 (기본값)
    if (initSEO) {
      initSEO();
    }

    // 라우터가 있으면 사용
    if (initRouter) {
      // 라우터 초기화 (라우트 변경 시 renderRoute 호출)
      initRouter(renderRoute);
    } else {
      // 라우터가 없으면 기존 방식 사용 (하위 호환성)
      const slug = getActivitySlugFromUrl ? getActivitySlugFromUrl() : null;
      renderRoute(slug);
    }
  }

  window.addEventListener('bichcheongmo:activities-data-refreshed', (event) => {
    if (!event.detail) return;
    cacheActivitiesResult(event.detail);
    const slug = getActivitySlugFromUrl ? getActivitySlugFromUrl() : null;
    renderRoute(slug);
  });

  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

