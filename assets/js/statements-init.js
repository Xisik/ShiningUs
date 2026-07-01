(function () {
  'use strict';

  const ui = window.__ui;
  if (!ui || !ui.statements) {
    console.error('성명 모듈이 로드되지 않았습니다.');
    return;
  }

  const { parseStatements, sortStatementsByDate, findStatementBySlug } = ui.statements.data;
  const { renderStatementList, showLoadingState, showErrorState } = ui.statements.list;
  const { renderStatementDetail } = ui.statements.detail || {};
  const { initRouter, getStatementSlugFromUrl, showNotFoundError, updateUrl } = ui.statements.router || {};
  const { setListPageSEO, setDetailPageSEO, initSEO } = ui.statements.seo || {};
  const { initLinks, enhanceStatementDetailLinks } = ui.statements.links || {};
  const $ = ui.$ || ((sel) => document.querySelector(sel));

  // 성명 데이터 캐시
  let cachedStatements = null;
  let cachedMetadata = null;

  function cacheStatementsResult(result) {
    const parsed = parseStatements(result.statements);
    cachedStatements = parsed;
    cachedMetadata = result.metadata;
    return parsed;
  }

  /**
   * 성명 상세 페이지 렌더링
   * 
   * Story 1.3: 성명 상세 페이지 구현
   * Story 1.4: 고유 URL 및 라우팅
   * 
   * @param {string|null} slug - 성명 slug (null이면 목록 표시)
   */
  function renderRoute(slug) {
    const container = $('#statement-list');
    if (!container) {
      console.error('성명 컨테이너를 찾을 수 없습니다.');
      return;
    }

    // 목록 페이지
    if (!slug) {
      // SEO 설정 (목록 페이지)
      if (setListPageSEO) {
        setListPageSEO();
      }

      // 캐시된 데이터가 있으면 사용
      if (cachedStatements) {
        const sorted = sortStatementsByDate(cachedStatements);
        renderStatementList(sorted, container);
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
      loadStatementsData()
        .then(result => {
          const parsed = cacheStatementsResult(result);
          
          const sorted = sortStatementsByDate(parsed);
          renderStatementList(sorted, container);
          
          // Story 2.4: 동기화 상태 및 마지막 업데이트 시각 표시
          // success 상태가 아닐 때만 표시
          if (result.metadata && result.metadata.syncStatus !== 'success') {
            const lastUpdated = result.metadata.lastUpdated ? new Date(result.metadata.lastUpdated) : null;
            showSyncStatus(result.metadata, lastUpdated);
          }
        })
        .catch(error => {
          console.error('성명 목록 로드 실패:', error);
          const lastUpdated = cachedMetadata && cachedMetadata.lastUpdated ? new Date(cachedMetadata.lastUpdated) : null;
          showErrorState(container, error.message || '성명 목록을 불러올 수 없습니다.', lastUpdated);
        });
      return;
    }

    // 상세 페이지
    // 로딩 상태 표시
    if (ui.statements.list && ui.statements.list.showLoadingState) {
      ui.statements.list.showLoadingState(container, 'detail');
    }

    // 캐시된 데이터가 있으면 사용
    if (cachedStatements) {
      const statement = findStatementBySlug(cachedStatements, slug);
      if (statement && renderStatementDetail) {
        // SEO 설정 (상세 페이지)
        if (setDetailPageSEO) {
          setDetailPageSEO(statement);
        }
        renderStatementDetail(statement, container);
        // 외부 링크 처리
        if (enhanceStatementDetailLinks) {
          enhanceStatementDetailLinks();
        }
      } else {
        // 성명이 하나도 없을 때는 목록(빈 상태)으로 보여 주고 URL 정리
        if (cachedStatements.length === 0 && updateUrl) {
          updateUrl(null, true);
          renderRoute(null);
          return;
        }
        // 성명을 찾을 수 없음 (목록은 있으나 해당 slug 없음)
        if (showNotFoundError) {
          showNotFoundError(container, '요청하신 성명을 찾을 수 없습니다.');
        } else if (ui.statements.detail && ui.statements.detail.showErrorState) {
          ui.statements.detail.showErrorState(container, '요청하신 성명을 찾을 수 없습니다.');
        }
        if (setListPageSEO) {
          setListPageSEO();
        }
      }
      return;
    }

    // 데이터 로드
    loadStatementsData()
      .then(result => {
        const parsed = cacheStatementsResult(result);
        
        const statement = findStatementBySlug(parsed, slug);
        
        if (statement && renderStatementDetail) {
          // SEO 설정 (상세 페이지)
          if (setDetailPageSEO) {
            setDetailPageSEO(statement);
          }
          renderStatementDetail(statement, container);
          // 외부 링크 처리
          if (enhanceStatementDetailLinks) {
            enhanceStatementDetailLinks();
          }
        } else {
          // 성명이 하나도 없을 때는 목록(빈 상태)으로 보여 주고 URL 정리
          if (parsed.length === 0 && updateUrl) {
            updateUrl(null, true);
            renderRoute(null);
            return;
          }
          // 성명을 찾을 수 없음 (목록은 있으나 해당 slug 없음)
          if (showNotFoundError) {
            showNotFoundError(container, '요청하신 성명을 찾을 수 없습니다.');
          } else if (ui.statements.detail && ui.statements.detail.showErrorState) {
            ui.statements.detail.showErrorState(container, '요청하신 성명을 찾을 수 없습니다.');
          }
          if (setListPageSEO) {
            setListPageSEO();
          }
        }
      })
      .catch(error => {
        console.error('성명 상세 로드 실패:', error);
        if (ui.statements.detail && ui.statements.detail.showErrorState) {
          ui.statements.detail.showErrorState(container, error.message || '성명 상세 내용을 불러올 수 없습니다.');
        }
        // SEO는 목록 페이지로 설정
        if (setListPageSEO) {
          setListPageSEO();
        }
      });
  }


  /**
   * 성명 데이터 로드
   * 
   * Story 2.1: 노션 데이터 소스 연결 및 인증 설정
   * Story 2.2: 노션 데이터 가져오기 및 변환
   * Story 2.4: 에러 처리 및 폴백 메커니즘
   * 
   * GitHub Actions에서 노션 데이터를 동기화하여 생성한 JSON 파일을 로드합니다.
   * 클라이언트 사이드에서는 인증 정보 없이 공개 JSON 파일만 읽습니다.
   * 
   * @returns {Promise<Object>} { statements: Array, metadata: Object } 형태의 데이터
   */
  function loadStatementsData() {
    const { fetchStatementsJson, normalizeStatementsPayload } = ui.statements.data || {};
    
    // 정규화 함수가 있으면 사용 (statements-data.js에서 제공)
    if (fetchStatementsJson) {
      return fetchStatementsJson()
        .catch(error => {
          console.error('성명 데이터 로드 실패:', error);
          // 에러 발생 시 테스트 데이터 사용 (폴백)
          console.warn('테스트 데이터를 사용합니다.');
          return getTestData().then(testData => {
            // 테스트 데이터도 정규화 함수로 처리
            const normalized = normalizeStatementsPayload ? 
              normalizeStatementsPayload(testData) : 
              { statements: testData, metadata: null };
            return {
              statements: normalized.statements,
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
    const url = './data/statements.json';
    
    return fetch(url, { cache: 'no-cache' })
      .then(response => {
        if (!response.ok) {
          // JSON 파일이 없거나 에러인 경우 테스트 데이터 사용 (폴백)
          console.warn('성명 데이터 파일을 찾을 수 없습니다. 테스트 데이터를 사용합니다.');
          return getTestData().then(testData => ({
            statements: testData,
            metadata: {
              lastUpdated: null,
              syncStatus: 'fallback',
              errorMessage: 'Data file not found, using test data'
            }
          }));
        }
        return response.json().then(data => {
          // 정규화 함수 사용
          if (normalizeStatementsPayload) {
            return normalizeStatementsPayload(data);
          }
          
          // Story 2.4: 새로운 형식 (메타데이터 포함) 또는 기존 형식 (배열) 지원
          if (data.statements && data._metadata) {
            // 새로운 형식
            return {
              statements: data.statements,
              metadata: data._metadata
            };
          } else if (Array.isArray(data)) {
            // 기존 형식 (배열)
            return {
              statements: data,
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
        console.error('성명 데이터 로드 실패:', error);
        // 에러 발생 시 테스트 데이터 사용 (폴백)
        console.warn('테스트 데이터를 사용합니다.');
        return getTestData().then(testData => ({
          statements: testData,
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
   * 실제 노션 데이터가 준비되면 이 함수는 사용되지 않습니다.
   * 
   * @returns {Promise<Array>} 빈 배열 반환
   */
  function getTestData() {
    return Promise.resolve([]);
  }

  /**
   * 동기화 상태 표시 (Story 2.4: 에러 처리 및 폴백 메커니즘)
   * @param {Object} metadata - 메타데이터
   * @param {Date} lastUpdated - 마지막 업데이트 시각
   */
  function showSyncStatus(metadata, lastUpdated) {
    // 디버깅: 메타데이터 상태 로그
    if (metadata) {
      console.log('Sync status check:', {
        syncStatus: metadata.syncStatus,
        statementsCount: metadata.statementsCount,
        lastUpdated: metadata.lastUpdated,
        errorMessage: metadata.errorMessage
      });
    }
    
    // success 상태이거나 메타데이터가 없으면 표시하지 않음
    if (!metadata || !metadata.syncStatus || metadata.syncStatus === 'success') {
      return;
    }
    
    const { formatDateKorean } = ui.statements.list || {};
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
      const slug = getStatementSlugFromUrl ? getStatementSlugFromUrl() : null;
      renderRoute(slug);
    }
  }

  window.addEventListener('bichcheongmo:statements-data-refreshed', (event) => {
    if (!event.detail) return;
    cacheStatementsResult(event.detail);
    const slug = getStatementSlugFromUrl ? getStatementSlugFromUrl() : null;
    renderRoute(slug);
  });

  // DOM 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


