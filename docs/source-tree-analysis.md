# Source Tree Analysis

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Project Structure

```
bichcheongmo/
├── index.html              # 메인 페이지 (홈)
├── about.html              # 단체 소개 페이지
├── activities.html          # 활동 공유 페이지
├── contact.html             # 문의하기 페이지
├── donate.html              # 후원하기 페이지
├── region.html              # 지역지부 페이지
├── poli.html                # 정치위원회 페이지
├── poli-statements.html     # 정치위원회 성명 페이지
├── README.md                # 프로젝트 설명
├── LICENSE                  # GNU GPL v3.0-or-later 라이선스
├── THIRD_PARTY_NOTICES.md   # Namari/YoRHa 등 제3자 저작권 및 MIT 라이선스 고지
├── CNAME                    # GitHub Pages 커스텀 도메인 설정
├── favicon.ico              # 파비콘
│
├── assets/                  # 정적 에셋 디렉토리
│   ├── css/                 # 스타일시트
│   │   ├── 00_tokens.css           # 디자인 토큰 (CSS 변수)
│   │   ├── 00_tokens.dark.css      # 다크 모드 토큰
│   │   ├── 01_base.css             # 기본 스타일 (리셋, 타이포그래피)
│   │   ├── 02_layout.css           # 레이아웃 스타일
│   │   ├── 03_components.css       # 컴포넌트 스타일
│   │   ├── 04_modal.css            # 모달 스타일
│   │   ├── 05_toast.css            # 토스트 알림 스타일
│   │   ├── 06_animations.css       # Namari 스타일 기반 애니메이션
│   │   └── 07_thumbnail_slide.css  # 메인 썸네일 슬라이드
│   │
│   ├── js/                  # JavaScript 모듈
│   │   ├── 00_dom.js               # DOM 유틸리티 함수
│   │   ├── 10_toast.js             # 토스트 알림 기능
│   │   ├── 20_modal.js             # 모달 기능
│   │   ├── 30_disclosure.js        # 접기/펼치기 기능
│   │   ├── 40_theme.js             # 테마 전환 기능
│   │   ├── 50_mobile_menu.js       # 모바일 메뉴 기능
│   │   ├── 07_thumbnail_silde.js   # 메인 썸네일 자동 슬라이드
│   │   └── 99_main.js              # 메인 초기화
│   │
│   ├── img/                 # 이미지 파일
│   │   └── logo.jpg                # 로고 이미지
│   │
│   └── font/                # 폰트 파일
│       └── 0xProtoNerdFontPropo-Regular.ttf
│
├── namari-gh-pages/         # Namari Landing Page v1.1.0 원본 참고 자료
│
└── docs/                    # 문서 디렉토리 (생성됨)
    ├── project-scan-report.json
    ├── technology-stack.md
    ├── ui-component-inventory.md
    ├── deployment-configuration.md
    └── source-tree-analysis.md (이 파일)
```

## Critical Directories

### `/` (Root)
- **Purpose:** 프로젝트 루트, HTML 페이지 진입점
- **Key Files:**
  - `index.html` - 메인 진입점
  - `about.html`, `activities.html`, `contact.html` - 주요 페이지
  - `CNAME` - GitHub Pages 도메인 설정

### `/assets/css/`
- **Purpose:** 스타일시트 모듈
- **Architecture:** 토큰 기반 디자인 시스템
- **Loading Order:** 숫자 접두사로 로딩 순서 제어
  - `00_*` - 토큰 (가장 먼저 로드)
  - `01_*` - 기본 스타일
  - `02_*` - 레이아웃
  - `03_*` - 컴포넌트
  - `04_*`, `05_*` - 특수 컴포넌트

### `/assets/js/`
- **Purpose:** JavaScript 모듈
- **Architecture:** 기능별 모듈화
- **Loading Order:** 숫자 접두사로 로딩 순서 제어
  - `00_*` - 유틸리티 (가장 먼저 로드)
  - `10_*`, `20_*`, `30_*`, `40_*`, `50_*` - 기능 모듈
  - `99_*` - 메인 초기화 (가장 마지막 로드)

### `/assets/img/`
- **Purpose:** 이미지 에셋
- **Key Files:**
  - `logo.jpg` - 사이트 로고

### `/assets/font/`
- **Purpose:** 커스텀 폰트
- **Key Files:**
  - `0xProtoNerdFontPropo-Regular.ttf` - 커스텀 폰트

## Entry Points

### Primary Entry Point
- **`index.html`** - 메인 페이지, 사이트 진입점

### Secondary Entry Points
- **`about.html`** - 단체 소개 페이지
- **`activities.html`** - 활동 공유 페이지
- **`contact.html`** - 문의하기 페이지

## File Naming Conventions

### CSS Files
- 숫자 접두사로 로딩 순서 제어 (`00_`, `01_`, `02_`, ...)
- 설명적 이름 (`tokens`, `base`, `layout`, `components`)

### JavaScript Files
- 숫자 접두사로 로딩 순서 제어 (`00_`, `10_`, `20_`, ...)
- 기능별 이름 (`dom`, `toast`, `modal`, `theme`, `mobile_menu`)
- `99_main.js` - 메인 초기화 (항상 마지막)

### HTML Files
- 소문자, 하이픈 없음 (`index.html`, `about.html`)

## Integration Points

### CSS Integration
- 모든 HTML 파일에서 동일한 CSS 파일 세트 로드
- 순서 중요: 토큰 → 기본 → 레이아웃 → 컴포넌트

### JavaScript Integration
- 모든 HTML 파일에서 동일한 JavaScript 파일 세트 로드
- 순서 중요: 유틸리티 → 기능 모듈 → 메인 초기화

### Asset Integration
- 상대 경로로 에셋 참조 (`./assets/...`)
- 이미지: `./assets/img/logo.jpg`
- 폰트: CSS에서 `@font-face`로 로드

## Build & Distribution

**정적 배포 산출물 준비**
- `scripts/prepare-pages.js`가 `_site/` 배포 산출물을 만들고, 참조된 정적 자산과 공개 JSON만 배포됨
- GitHub Pages에서 직접 서빙
- 번들러는 사용하지 않음

## Excluded Directories

다음 디렉토리는 프로젝트 코드가 아님:
- `_bmad/` - BMAD 도구 디렉토리
- `_bmad-output/` - BMAD 출력 디렉토리
- `.git/` - Git 저장소 메타데이터



