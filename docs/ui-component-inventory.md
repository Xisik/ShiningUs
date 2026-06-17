# UI Component Inventory

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Component Overview

이 프로젝트는 순수 HTML/CSS/JavaScript로 구현된 정적 웹사이트입니다. 프레임워크 없이 바닐라 JavaScript와 모듈화된 CSS를 사용합니다.

## Component Categories

### Layout Components

- **Site Header** (`site-header`)
  - 로고/브랜드 링크
  - 네비게이션 메뉴
  - 모바일 메뉴 토글
  - 테마 전환 버튼

- **Container** (`container`)
  - 최대 너비 제한 (1245px)
  - 중앙 정렬

### Navigation Components

- **Navigation Menu** (`nav`, `nav-link`)
  - 홈, 단체 소개, 활동 공유, 문의하기 링크
  - 모바일 반응형 메뉴

### Content Components

- **Hero Section** (`hero`)
  - Namari 스타일의 큰 타이포그래피와 섹션 리드 문구

- **Thumbnail Slide** (`slides`, `slide-track`, `slide`)
  - 메인 페이지 상단 썸네일 자동 슬라이드
  - JavaScript 모듈: `07_thumbnail_silde.js`

- **Grid Layout** (`grid`)
  - 카드 그리드 레이아웃

- **Card** (`card`)
  - 카드 컴포넌트
  - 버튼 포함

### Interactive Components

- **Button** (`btn`, `btn-primary`)
  - 기본 버튼 스타일
  - 주요 액션 버튼

- **Modal** (`modal`)
  - 모달 다이얼로그 (JavaScript 모듈: `20_modal.js`)

- **Toast** (`toast`)
  - 토스트 알림 (JavaScript 모듈: `10_toast.js`)

- **Disclosure** (`disclosure`)
  - 접기/펼치기 컴포넌트 (JavaScript 모듈: `30_disclosure.js`)

### Utility Components

- **Theme Toggle** (`theme-toggle`)
  - 라이트/다크 모드 전환 (JavaScript 모듈: `40_theme.js`)
  - localStorage를 통한 테마 저장

- **Mobile Menu Toggle** (`menu-toggle`)
  - 모바일 메뉴 토글 (JavaScript 모듈: `50_mobile_menu.js`)

## Design System

현재 디자인 시스템은 `namari-gh-pages/`의 Namari Landing Page v1.1.0을 기준으로 흰 배경, 금색 포인트(`#d2b356`), 얇은 라인, 넓은 섹션 간격, fade-in reveal 애니메이션을 사용합니다. 기존 라이트/다크 테마 전환, 모바일 메뉴, 모달, 토스트, disclosure 기능은 동일한 클래스와 JavaScript 모듈로 유지됩니다.

### CSS Architecture

모듈화된 CSS 구조:

1. **00_tokens.css** - 디자인 토큰 (CSS 변수)
   - 색상 시스템
   - 간격 시스템
   - 그림자 시스템
   - 그리드 시스템

2. **00_tokens.dark.css** - 다크 모드 토큰

3. **01_base.css** - 기본 스타일 (리셋, 타이포그래피)

4. **02_layout.css** - 레이아웃 스타일

5. **03_components.css** - 컴포넌트 스타일

6. **04_modal.css** - 모달 스타일

7. **05_toast.css** - 토스트 알림 스타일

8. **06_animations.css** - Namari 스타일 기반 애니메이션

9. **07_thumbnail_slide.css** - 메인 썸네일 슬라이드 스타일

### JavaScript Architecture

모듈화된 JavaScript 구조:

- **00_dom.js** - DOM 유틸리티 함수
- **10_toast.js** - 토스트 알림 기능
- **20_modal.js** - 모달 기능
- **30_disclosure.js** - 접기/펼치기 기능
- **40_theme.js** - 테마 전환 기능
- **50_mobile_menu.js** - 모바일 메뉴 기능
- **07_thumbnail_silde.js** - 메인 썸네일 자동 슬라이드
- **99_main.js** - 메인 초기화

## State Management

프레임워크 기반 상태 관리 없음. 다음을 사용:

- **localStorage** - 테마 설정 저장
- **DOM 상태** - UI 상태 관리 (모달 열림/닫힘, 메뉴 토글 등)

## Accessibility

- ARIA 레이블 사용 (`aria-label`, `aria-controls`, `aria-expanded`)
- 시맨틱 HTML 사용
- 키보드 네비게이션 지원

## Browser Support

- 모던 브라우저 (CSS 변수, ES6 지원)
- 반응형 디자인 (모바일/데스크톱)



