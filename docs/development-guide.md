# Development Guide

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Prerequisites

**필수 요구사항 없음**

이 프로젝트는 순수 정적 웹사이트이므로:
- Node.js 불필요
- 패키지 매니저 불필요
- 빌드 도구 불필요
- 데이터베이스 불필요

**권장:**
- 텍스트 에디터 (VS Code, Sublime Text 등)
- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- Git (버전 관리)

## Local Development Setup

### 1. 저장소 클론

```bash
git clone <repository-url>
cd bichcheongmo
```

### 2. 로컬 서버 실행

정적 파일이므로 간단한 HTTP 서버로 실행 가능:

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (http-server):**
```bash
npx http-server -p 8000
```

**VS Code Live Server 확장:**
- VS Code에서 `index.html` 우클릭 → "Open with Live Server"

### 3. 브라우저에서 확인

```
http://localhost:8000
```

## Project Structure

```
bichcheongmo/
├── index.html          # 메인 페이지
├── about.html          # 단체 소개
├── activities.html     # 활동 공유
├── contact.html        # 문의하기
├── assets/
│   ├── css/           # 스타일시트
│   ├── js/             # JavaScript
│   ├── img/            # 이미지
│   └── font/           # 폰트
└── docs/               # 문서
```

## Development Workflow

### 파일 수정

1. HTML 파일 수정: `index.html`, `about.html`, `activities.html`, `contact.html`
2. CSS 수정: `assets/css/` 디렉토리의 파일들
3. JavaScript 수정: `assets/js/` 디렉토리의 파일들

### 파일 로딩 순서

**CSS 로딩 순서 (중요):**
```html
<link rel="stylesheet" href="./assets/css/00_tokens.css" />
<link rel="stylesheet" href="./assets/css/00_tokens.dark.css" />
<link rel="stylesheet" href="./assets/css/01_base.css" />
<link rel="stylesheet" href="./assets/css/02_layout.css" />
<link rel="stylesheet" href="./assets/css/03_components.css" />
<link rel="stylesheet" href="./assets/css/04_modal.css" />
<link rel="stylesheet" href="./assets/css/05_toast.css" />
<link rel="stylesheet" href="./assets/css/06_animations.css" />
<link rel="stylesheet" href="./assets/css/07_thumbnail_slide.css" />
```

**JavaScript 로딩 순서 (중요):**
```html
<script src="./assets/js/00_dom.js"></script>
<script src="./assets/js/05_scroll_reveal.js" defer></script>
<script src="./assets/js/30_disclosure.js"></script>
<script src="./assets/js/10_toast.js"></script>
<script src="./assets/js/20_modal.js"></script>
<!-- page-specific data/router modules load here when needed -->
<script src="./assets/js/99_main.js"></script>
<script src="./assets/js/45_i18n.js"></script>
<script src="./assets/js/40_theme.js"></script>
<script src="./assets/js/50_mobile_menu.js"></script>
<script src="./assets/js/06_motion.js"></script>
<script src="./assets/js/07_thumbnail_silde.js"></script>
```

### 테스트

**수동 테스트:**
- 브라우저에서 직접 확인
- 다양한 브라우저에서 테스트 (Chrome, Firefox, Safari, Edge)
- 모바일 반응형 테스트 (브라우저 개발자 도구)

**자동화된 테스트 없음:**
- 테스트 프레임워크 없음
- GitHub Actions는 Pages 배포와 Notion 동기화에 사용됨

## Build Process

**배포 산출물 준비**

- 정적 사이트이므로 번들링/압축은 없음
- 배포 전 `node scripts/prepare-pages.js`가 `_site/` 디렉터리를 생성함
- `_site/`에는 HTML, CNAME, 공개 JSON, 실제 참조되는 정적 자산만 포함됨

## Common Development Tasks

### 새 페이지 추가

1. HTML 파일 생성 (예: `new-page.html`)
2. 기본 구조 복사 (다른 HTML 파일 참고)
3. 네비게이션에 링크 추가 (`index.html`의 `<nav>` 섹션)

### 스타일 수정

1. `assets/css/00_tokens.css` - 디자인 토큰 수정
2. `assets/css/03_components.css` - 컴포넌트 스타일 수정
3. 브라우저 새로고침으로 확인

### JavaScript 기능 추가

1. 새 JavaScript 파일 생성 (예: `60_new-feature.js`)
2. HTML에 스크립트 태그 추가 (로딩 순서 고려)
3. `99_main.js`에서 초기화 (필요시)

### 이미지 추가

1. `assets/img/` 디렉토리에 이미지 추가
2. HTML에서 상대 경로로 참조: `./assets/img/image.jpg`

## Code Style

### HTML
- 들여쓰기: 2 spaces
- 시맨틱 HTML 사용
- ARIA 레이블 사용 (접근성)

### CSS
- 들여쓰기: 2 spaces
- CSS 변수 사용 (토큰 기반)
- BEM 명명 규칙 (일부)

### JavaScript
- ES5/ES6 문법
- IIFE 패턴 사용 (전역 스코프 오염 방지)
- 모듈화된 구조

## Browser Support

- 모던 브라우저 (CSS 변수, ES6 지원)
- Chrome, Firefox, Safari, Edge 최신 버전
- 모바일 브라우저 지원

## Troubleshooting

### 스타일이 적용되지 않음
- CSS 파일 로딩 순서 확인
- 브라우저 캐시 클리어
- 파일 경로 확인 (상대 경로)

### JavaScript가 작동하지 않음
- JavaScript 파일 로딩 순서 확인
- 브라우저 콘솔에서 에러 확인
- `99_main.js`가 마지막에 로드되는지 확인

### 로컬 서버에서 CORS 에러
- HTTP 서버 사용 (file:// 프로토콜 대신)
- Python/Node.js HTTP 서버 사용

## Deployment

자세한 내용은 [deployment-configuration.md](./deployment-configuration.md) 참조.

**간단 요약:**
1. GitHub에 코드 푸시
2. GitHub Pages 자동 배포
3. 커스텀 도메인: `www.bichcheongmo.org`

## Resources

- **참고:** `namari-gh-pages/`의 Namari Landing Page v1.1.0을 현재 UI 스타일과 애니메이션 기준으로 참고하며, 기존 FlySkyPie의 `yorha.css` 참고 이력도 보존합니다.
- **프로젝트 라이선스:** GNU General Public License v3.0 or later (`GPL-3.0-or-later`)
- **제3자 고지:** Namari 패키지의 MIT 표기 컴포넌트와 YoRHa(`metakirby5/yorha`)의 MIT 라이선스 고지는 [`../THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md)에 보존되어 있습니다.
- **저장소:** GitHub



