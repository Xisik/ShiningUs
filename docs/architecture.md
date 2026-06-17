# Architecture Documentation

**Date:** 2026-01-12  
**Project:** bichcheongmo  
**Type:** Static Web Site

## Executive Summary

bichcheongmo는 성소수자 공조 단체를 위한 정적 웹사이트입니다. 순수 HTML, CSS, JavaScript로 구현되었으며, 프레임워크나 빌드 도구 없이 직접 서빙되는 정적 사이트 아키텍처를 사용합니다.

## Architecture Pattern

**Static Site Architecture**

- 클라이언트 사이드 렌더링 없음
- 서버 사이드 렌더링 없음
- 순수 정적 HTML/CSS/JS 파일 제공
- GitHub Pages를 통한 정적 호스팅

## Technology Stack

### Frontend

| Category | Technology | Version | Purpose |
|---------|------------|---------|---------|
| **Markup** | HTML5 | 5.0 | 페이지 구조 |
| **Styling** | CSS3 | 3.0 | Namari 기반 스타일링, 디자인 시스템 |
| **Scripting** | Vanilla JavaScript | ES5/ES6 | 인터랙티브 기능 |

자세한 내용은 [technology-stack.md](./technology-stack.md) 참조.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         GitHub Pages (Hosting)          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     Static Files (HTML/CSS/JS)    │  │
│  │                                   │  │
│  │  ┌──────────┐  ┌──────────────┐ │  │
│  │  │ HTML     │  │ CSS Modules   │ │  │
│  │  │ Pages    │  │ (Token-based)  │ │  │
│  │  └──────────┘  └──────────────┘ │  │
│  │                                   │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │ JavaScript Modules           │ │  │
│  │  │ (Vanilla JS, Modular)        │ │  │
│  │  └──────────────────────────────┘ │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     Browser (Client)               │  │
│  │  - HTML Parsing                    │  │
│  │  - CSS Rendering                   │  │
│  │  - JavaScript Execution            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Component Architecture

**CSS Architecture (Namari-inspired Token-based Design System)**

```
00_tokens.css (Design Tokens)
    ↓
00_tokens.dark.css (Dark Mode Tokens)
    ↓
01_base.css (Base Styles)
    ↓
02_layout.css (Layout)
    ↓
03_components.css (Components)
    ↓
04_modal.css, 05_toast.css, 06_animations.css, 07_thumbnail_slide.css (Special Components)
```

**JavaScript Architecture (Modular)**

```
00_dom.js (Utilities)
    ↓
10_toast.js, 20_modal.js, 30_disclosure.js, 40_theme.js, 50_mobile_menu.js (Features)
    ↓
99_main.js (Initialization)
```

## Data Architecture

**데이터베이스 없음**

- 정적 사이트이므로 데이터베이스 불필요
- 모든 콘텐츠는 HTML 파일에 직접 포함
- 클라이언트 사이드 상태만 사용:
  - `localStorage` - 테마 설정 저장
  - DOM 상태 - UI 상태 관리

## API Design

**API 없음**

- 백엔드 API 없음
- 외부 API 통합 없음
- 모든 기능은 클라이언트 사이드에서 처리

## Component Overview

### Layout Components

- **Site Header** - 로고, 네비게이션, 테마 토글
- **Container** - 콘텐츠 래퍼 (Namari 기준 최대 너비 제한)
- **Grid Layout** - 카드 그리드 레이아웃
- **Thumbnail Slide** - 메인 페이지 상단 자동 슬라이드

### Interactive Components

- **Modal** - 모달 다이얼로그
- **Toast** - 토스트 알림
- **Disclosure** - 접기/펼치기
- **Theme Toggle** - 라이트/다크 모드 전환
- **Mobile Menu** - 모바일 네비게이션

자세한 내용은 [ui-component-inventory.md](./ui-component-inventory.md) 참조.

## Source Tree

```
bichcheongmo/
├── index.html              # 메인 페이지
├── about.html              # 단체 소개
├── activities.html         # 활동 공유
├── contact.html            # 문의하기
├── assets/
│   ├── css/               # 스타일시트 모듈
│   ├── js/                 # JavaScript 모듈
│   ├── img/                # 이미지
│   └── font/               # 폰트
├── namari-gh-pages/        # Namari 템플릿 원본 참고 자료
└── docs/                   # 문서
```

자세한 내용은 [source-tree-analysis.md](./source-tree-analysis.md) 참조.

## Development Workflow

### Local Development

1. 로컬 HTTP 서버 실행 (Python, Node.js 등)
2. 브라우저에서 `http://localhost:8000` 접속
3. 파일 수정 후 브라우저 새로고침

### Build Process

**정적 배포 산출물 준비**

- 번들러는 사용하지 않음
- `scripts/prepare-pages.js`가 `_site/` 배포 산출물을 생성함
- 실제 참조되는 HTML/CSS/JS/이미지/폰트와 공개 JSON만 GitHub Pages에 업로드됨

자세한 내용은 [development-guide.md](./development-guide.md) 참조.

## Deployment Architecture

### Deployment Platform

**GitHub Pages**

- 정적 사이트 호스팅
- 커스텀 도메인: `www.bichcheongmo.org`
- 자동 배포 (Git 푸시 시)

### Deployment Process

1. GitHub 저장소에 코드 푸시
2. GitHub Actions가 `_site/` 배포 산출물 생성
3. GitHub Pages 자동 배포
4. DNS를 통한 커스텀 도메인 연결

자세한 내용은 [deployment-configuration.md](./deployment-configuration.md) 참조.

## Security Considerations

### Client-Side Security

- XSS 방지: 입력 검증 (필요시)
- HTTPS: GitHub Pages 자동 제공
- Content Security Policy: 각 HTML에 메타 CSP 적용

### Data Privacy

- 사용자 데이터 수집 없음
- 쿠키 사용 없음 (localStorage만 사용)
- 외부 서비스 연동 없음

## Performance Considerations

### Optimization Strategies

- **정적 파일 서빙**: CDN 없이 직접 서빙 (GitHub Pages)
- **이미지 최적화**: 필요시 이미지 압축
- **폰트 최적화**: 커스텀 폰트 사용 (한 파일)
- **CSS 모듈화**: 필요한 CSS만 로드
- **JavaScript 모듈화**: 필요한 기능만 로드

### Caching

- 브라우저 캐싱: GitHub Pages 기본 설정
- 캐시 무효화: 파일명 변경 또는 쿼리 파라미터

## Browser Support

- 모던 브라우저 (CSS 변수, ES6 지원)
- Chrome, Firefox, Safari, Edge 최신 버전
- 모바일 브라우저 지원

## Accessibility

- 시맨틱 HTML 사용
- ARIA 레이블 사용
- 키보드 네비게이션 지원
- 반응형 디자인 (모바일/데스크톱)

## Future Considerations

### Potential Enhancements

- **빌드 도구 도입**: 필요시 (현재는 불필요)
- **CSS 프리프로세서**: 필요시 (Sass, Less 등)
- **JavaScript 프레임워크**: 필요시 (React, Vue 등)
- **백엔드 API**: 필요시 (콘텐츠 관리, 폼 제출 등)
- **데이터베이스**: 필요시 (사용자 데이터, 콘텐츠 관리 등)

### Scalability

현재 아키텍처는 소규모 정적 사이트에 적합합니다. 다음 경우 확장 고려:

- 동적 콘텐츠 필요 시 → 백엔드 API 추가
- 사용자 인증 필요 시 → 인증 시스템 추가
- 실시간 기능 필요 시 → WebSocket 또는 서버 이벤트 추가

## Related Documentation

- [Technology Stack](./technology-stack.md)
- [UI Component Inventory](./ui-component-inventory.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Development Guide](./development-guide.md)
- [Deployment Configuration](./deployment-configuration.md)
- [Project Overview](./project-overview.md)

---

_Generated using BMAD Method `document-project` workflow_



