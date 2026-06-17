# Technology Stack

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Technology Summary

| Category | Technology | Version | Justification |
|---------|------------|---------|---------------|
| **Markup** | HTML5 | 5.0 | 표준 HTML5, 한국어 지원 (lang="ko") |
| **Styling** | CSS3 | 3.0 | Namari 기반 CSS 변수 디자인 시스템, 다크 모드 지원 |
| **Scripting** | Vanilla JavaScript | ES5/ES6 | 프레임워크 없는 순수 JavaScript |
| **Build Tool** | Node.js script | - | `scripts/prepare-pages.js`로 GitHub Pages 배포 산출물 준비 |
| **Package Manager** | npm | - | Notion 동기화 스크립트 의존성 관리 |
| **Deployment** | GitHub Pages | - | CNAME 파일로 커스텀 도메인 설정 |

## Architecture Pattern

**Static Site Architecture**
- 클라이언트 사이드 렌더링 없음
- 서버 사이드 렌더링 없음
- 순수 정적 HTML/CSS/JS 파일 제공
- GitHub Pages를 통한 정적 호스팅

## Design System

**Namari-inspired CSS Token-based Design System**
- `namari-gh-pages/`의 Namari Landing Page v1.1.0을 참고한 CSS 변수 디자인 토큰 관리
- 라이트/다크 모드 지원
- 금색 포인트(`#d2b356`), 얇은 라인, 넓은 섹션 간격, reveal 애니메이션 사용
- 모듈화된 CSS 구조:
  - `00_tokens.css` - 디자인 토큰
  - `00_tokens.dark.css` - 다크 모드 토큰
  - `01_base.css` - 기본 스타일
  - `02_layout.css` - 레이아웃
  - `03_components.css` - 컴포넌트
  - `04_modal.css` - 모달
  - `05_toast.css` - 토스트 알림
  - `06_animations.css` - Namari 스타일 기반 애니메이션
  - `07_thumbnail_slide.css` - 메인 썸네일 슬라이드

## JavaScript Architecture

**Modular Vanilla JS**
- 모듈화된 JavaScript 파일:
  - `00_dom.js` - DOM 유틸리티
  - `10_toast.js` - 토스트 알림
  - `20_modal.js` - 모달
  - `30_disclosure.js` - 접기/펼치기
  - `40_theme.js` - 테마 전환
  - `50_mobile_menu.js` - 모바일 메뉴
  - `07_thumbnail_silde.js` - 메인 썸네일 자동 슬라이드
  - `99_main.js` - 메인 초기화

## Localization

- **Primary Language:** 한국어 (ko)
- **Character Encoding:** UTF-8

## Browser Support

- 모던 브라우저 (CSS 변수, ES6 지원)
- 반응형 디자인 (viewport meta tag)



