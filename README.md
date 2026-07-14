# 빛청모 / Shining Us

성소수자 공조 단체용 정적 웹사이트입니다. Vite와 React로 화면을 구성하고, Notion 데이터베이스에서 활동공유, 성명, 지출내역 데이터를 동기화해 정적 JSON과 이미지/PDF 자산으로 배포합니다.

## 실행 명령

```bash
npm install
npm run dev
npm run build
npm run preview
```

- `npm run dev`: Vite 개발 서버 실행
- `npm run build`: 이미지 최적화 후 Vite 빌드 및 정적 파일 복사
- `npm run preview`: 빌드 결과 미리보기
- `npm run sync:activities`: Notion 활동공유 데이터 동기화
- `npm run sync:statements`: Notion 성명 데이터 동기화
- `npm run sync:payments`: Notion 지출내역 데이터 동기화
- `npm run optimize:assets`: 원본 이미지를 반응형 WebP 파일로 변환

## 제외 기준

아래 트리는 `.gitignore` 대상인 `node_modules/`, `dist/`, `_site/`, `.env*`, 로컬 키/토큰, 로컬 DB, 로그, IDE 설정, `docs/`, `AGENTS.md`, `workers/wrangler.toml` 등을 제외한 프로젝트 파일 기준입니다. 이미지처럼 동일 규칙으로 반복되는 파일은 파일명을 모두 나열하지 않고 패턴과 현재 개수를 함께 표기합니다.

## 프로젝트 트리

```text
.
├── .github/
│   └── workflows/
│       ├── pages-deploy.yml
│       ├── sync-notion.yml
│       ├── sync-notion-payments.yml
│       └── sync-notion-statements.yml
├── assets/
│   ├── css/
│   │   ├── animations.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   ├── react-app.css
│   │   ├── thumbnail-slide.css
│   │   ├── tokens.css
│   │   └── tokens-dark.css
│   ├── img/
│   │   ├── activities/
│   │   │   └── {notion-page-id}.png|jpeg (12 files)
│   │   ├── generated/
│   │   │   ├── activities/
│   │   │   │   └── {notion-page-id}-{360|720|1080|1440}.webp (48 files)
│   │   │   ├── statements/
│   │   │   │   └── {notion-page-id}-{360|720|1080|1440}.webp (4 files)
│   │   │   ├── donate-developers-{360|720|1080|1440}.webp
│   │   │   ├── logo-{360|720|1080|1440}.webp
│   │   │   └── thumbnail_{00|01|02}-{360|720|1080|1440}.webp
│   │   ├── statements/
│   │   │   └── {notion-page-id}.png (1 file)
│   │   ├── logo.jpg
│   │   ├── thumbnail_00.png
│   │   ├── thumbnail_01.png
│   │   └── thumbnail_02.png
│   └── payment/
│       └── {notion-file-id}.pdf (1 file)
├── data/
│   ├── .gitkeep
│   ├── activities.json
│   ├── payments.json
│   └── statements.json
├── scripts/
│   ├── copy-vite-static.js
│   ├── debug-notion.js
│   ├── debug-statements.js
│   ├── notion-client.js
│   ├── notion-file-utils.js
│   ├── notion-transformer.js
│   ├── optimize-assets.js
│   ├── sync-notion.js
│   ├── sync-notion-statements.js
│   └── sync-payments.js
├── src/
│   ├── components/
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── data/
│   │   └── branches.js
│   ├── hooks/
│   │   └── useJsonResource.js
│   ├── i18n/
│   │   └── messages.js
│   ├── lib/
│   │   └── content.js
│   ├── pages/
│   │   ├── CollectionPage.jsx
│   │   ├── FeedbackPage.jsx
│   │   ├── PaymentsPage.jsx
│   │   ├── RegionPage.jsx
│   │   └── StaticPages.jsx
│   ├── router/
│   │   └── useHashRoute.js
│   ├── state/
│   │   ├── LanguageContext.jsx
│   │   └── ThemeContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── workers/
│   ├── feedback-worker.js
│   └── wrangler.toml.example
├── .gitignore
├── CNAME
├── LICENSE
├── README.md
├── THIRD_PARTY_NOTICES.md
├── favicon.ico
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

## 디렉터리와 파일 역할

### `.github/workflows/`

- `pages-deploy.yml`: GitHub Pages 배포 워크플로입니다. 빌드 명령을 실행하고 생성된 `dist/` 결과물을 Pages에 게시합니다.
- `sync-notion.yml`: 활동공유 Notion 데이터베이스를 주기적으로 동기화해 `data/activities.json`과 관련 활동 이미지를 갱신합니다.
- `sync-notion-statements.yml`: 성명 Notion 데이터베이스를 동기화해 `data/statements.json`과 성명 이미지를 갱신합니다.
- `sync-notion-payments.yml`: 지출내역 Notion 데이터베이스를 동기화해 `data/payments.json`과 PDF 첨부 파일을 갱신합니다.

### `assets/`

정적 배포에 포함되는 CSS, 이미지, PDF 자산입니다. `npm run build` 과정에서 `scripts/copy-vite-static.js`가 `dist/assets/`로 복사합니다.

- `assets/css/animations.css`: 화면 전환, 등장 효과, 모션 관련 스타일입니다.
- `assets/css/base.css`: HTML 기본 요소, 폰트, 본문 배경, 접근성 기본값 등 전역 스타일입니다.
- `assets/css/components.css`: 버튼, 카드, 링크, 입력 요소처럼 여러 페이지에서 재사용되는 컴포넌트 스타일입니다.
- `assets/css/layout.css`: 헤더, 내비게이션, 컨테이너, 그리드, 반응형 레이아웃 스타일입니다.
- `assets/css/react-app.css`: React 전환 이후의 페이지별 UI 보정과 앱 전용 스타일입니다.
- `assets/css/thumbnail-slide.css`: 메인 화면 썸네일 슬라이드 영역 스타일입니다.
- `assets/css/tokens.css`: 라이트 테마 색상, 간격, 그림자 등 디자인 토큰입니다.
- `assets/css/tokens-dark.css`: 다크 테마에서 덮어쓰는 디자인 토큰입니다.
- `assets/img/logo.jpg`: 사이트 로고, 파비콘 대체 이미지, OG 이미지의 기준 원본입니다.
- `assets/img/thumbnail_00.png`, `thumbnail_01.png`, `thumbnail_02.png`: 홈 화면 슬라이드 원본 이미지입니다.
- `assets/img/activities/`: Notion 활동공유 항목의 원본 이미지 저장소입니다. 파일명은 Notion 페이지 ID를 기반으로 합니다.
- `assets/img/statements/`: Notion 성명 항목의 원본 이미지 저장소입니다.
- `assets/img/generated/`: `scripts/optimize-assets.js`가 원본 이미지를 360, 720, 1080, 1440px WebP로 변환한 결과입니다. 런타임에서는 `<picture>`와 `srcset`으로 이 파일들을 우선 사용하고 원본을 fallback으로 둡니다.
- `assets/payment/`: 지출내역 페이지에서 다운로드하는 PDF 파일 저장소입니다. `data/payments.json`의 `url` 또는 `file` 값과 연결됩니다.

### `data/`

Notion 동기화 결과를 프론트엔드가 직접 fetch하는 정적 JSON 저장소입니다.

- `data/.gitkeep`: 데이터 파일이 비어 있을 때도 디렉터리를 유지하기 위한 파일입니다.
- `data/activities.json`: 활동공유 목록과 본문 데이터입니다. 현재 `activities` 항목 15개와 `_metadata` 동기화 정보가 들어 있습니다.
- `data/statements.json`: 성명 목록과 본문 데이터입니다. 현재 `statements` 항목 1개와 `_metadata` 동기화 정보가 들어 있습니다.
- `data/payments.json`: 지출내역 PDF 목록 데이터입니다. 현재 `payments` 항목 1개와 `_metadata` 동기화 정보가 들어 있습니다.

### `scripts/`

로컬 개발, GitHub Actions, 빌드 과정에서 사용하는 Node.js 유틸리티입니다.

- `notion-client.js`: Notion API v1 요청 래퍼입니다. 인증 헤더, 버전 헤더, 30초 타임아웃, 429 재시도, 데이터베이스 페이지네이션을 처리합니다.
- `notion-transformer.js`: Notion 페이지와 블록을 사이트 표준 데이터 구조로 변환합니다. 제목, 날짜, 공개 상태, 카테고리, 파일 URL, 본문 Markdown 변환을 담당합니다.
- `notion-file-utils.js`: Notion 또는 허용된 원격 호스트의 파일을 안전하게 내려받고, 참조되지 않는 로컬 파일을 정리하는 공통 유틸리티입니다.
- `sync-notion.js`: 활동공유 데이터베이스를 읽어 `data/activities.json`을 생성하고 활동 이미지를 `assets/img/activities/`에 저장합니다.
- `sync-notion-statements.js`: 성명 데이터베이스를 읽어 `data/statements.json`을 생성하고 성명 이미지를 `assets/img/statements/`에 저장합니다.
- `sync-payments.js`: 지출내역 데이터베이스를 읽어 `data/payments.json`을 생성하고 PDF 파일을 `assets/payment/`에 저장합니다.
- `debug-notion.js`: 활동공유 Notion 데이터베이스 접근 권한, 필드 구성, 페이지 데이터를 점검하는 로컬 디버깅 스크립트입니다.
- `debug-statements.js`: 성명 Notion 데이터베이스 접근 권한과 필드 구성을 점검하는 로컬 디버깅 스크립트입니다.
- `optimize-assets.js`: `assets/img/` 아래의 PNG/JPEG 원본을 찾아 `assets/img/generated/`에 반응형 WebP 파일을 생성합니다. `generated/` 내부 파일은 입력 대상에서 제외합니다.
- `copy-vite-static.js`: Vite 빌드 후 `CNAME`, 라이선스, 데이터, 이미지, PDF를 `dist/`로 복사하고 기존 정적 URL용 리다이렉트 HTML을 생성합니다.

### `src/`

React 애플리케이션의 런타임 코드입니다.

- `src/main.jsx`: React 루트 생성 지점입니다. `index.html`의 `#root`에 `App`을 마운트합니다.
- `src/App.jsx`: 해시 라우트를 해석해 페이지 컴포넌트를 선택하고, 문서 제목을 갱신하며, 테마/언어 Provider와 공통 레이아웃을 연결합니다.
- `src/components/Layout.jsx`: 사이트 헤더, 로고, 내비게이션, 모바일 메뉴, 언어 전환, 테마 전환을 담당합니다.
- `src/components/Footer.jsx`: 사이트 하단 공통 푸터를 렌더링합니다.
- `src/data/branches.js`: 지역 지부 페이지에서 사용하는 지부 ID, 이름, SNS 링크, 연락처 데이터입니다.
- `src/hooks/useJsonResource.js`: 정적 JSON 파일을 fetch하고 상태(`loading`, `success`, `error`)와 캐시 데이터를 관리하는 공통 훅입니다.
- `src/i18n/messages.js`: 내비게이션과 공통 UI 문구의 한국어/영어 번역 테이블입니다.
- `src/lib/content.js`: 활동공유/성명 데이터 정규화, 날짜 포맷, Markdown 일부 변환, 반응형 이미지 `srcset` 생성 로직입니다.
- `src/pages/StaticPages.jsx`: 홈, 단체소개, 문의하기, 후원하기, 정치위원회 같은 정적 페이지 컴포넌트입니다.
- `src/pages/CollectionPage.jsx`: 활동공유와 성명 목록/상세 페이지를 공통으로 렌더링합니다. `data/activities.json`, `data/statements.json`을 읽고 공개 항목만 날짜 역순으로 표시합니다.
- `src/pages/PaymentsPage.jsx`: `data/payments.json`을 읽어 지출내역 PDF 목록과 다운로드 링크를 표시합니다.
- `src/pages/RegionPage.jsx`: `src/data/branches.js`의 지역 지부 정보를 아코디언 형태로 표시합니다.
- `src/pages/FeedbackPage.jsx`: 사이트 피드백 입력 폼입니다. `VITE_FEEDBACK_ENDPOINT`, `VITE_TURNSTILE_SITE_KEY`가 설정된 경우 Cloudflare Turnstile 인증 후 Worker API로 제출합니다.
- `src/router/useHashRoute.js`: `#/path` 기반 라우팅을 처리하고 URL 생성 헬퍼를 제공합니다. GitHub Pages 정적 배포에서 서버 라우팅 없이 페이지 전환이 가능하게 합니다.
- `src/state/LanguageContext.jsx`: 현재 언어를 `localStorage`에 저장하고 `t(key)` 번역 헬퍼를 제공합니다.
- `src/state/ThemeContext.jsx`: 라이트/다크 테마를 `localStorage`와 `document.documentElement.dataset.theme`에 반영합니다.

### `workers/`

Cloudflare Workers 기반 피드백 저장 API 관련 파일입니다.

- `feedback-worker.js`: 피드백 POST 요청을 검증하고 Turnstile 토큰을 확인한 뒤 저장소에 기록하는 Worker 코드입니다.
- `wrangler.toml.example`: 실제 `workers/wrangler.toml`을 만들 때 참고하는 설정 예시입니다. 실제 파일은 환경별 비밀값을 포함할 수 있어 `.gitignore` 대상입니다.

### 루트 파일

- `.gitignore`: 의존성, 빌드 산출물, 환경 변수, 키/토큰, 로컬 DB, IDE 설정, 로그 등 커밋하지 않을 파일 패턴을 정의합니다.
- `CNAME`: GitHub Pages에서 사용할 커스텀 도메인 설정 파일입니다.
- `LICENSE`: 프로젝트 라이선스입니다. `package.json` 기준 GPL-3.0-or-later입니다.
- `README.md`: 프로젝트 개요, 실행 방법, 구조 설명 문서입니다.
- `THIRD_PARTY_NOTICES.md`: 서드파티 라이선스와 고지 문서입니다.
- `favicon.ico`: 브라우저 탭과 북마크에서 사용하는 아이콘 파일입니다.
- `index.html`: Vite 앱의 HTML 진입점입니다. 메타 태그, OG/Twitter 카드, Google 사이트 인증, React 마운트 노드를 포함합니다.
- `package.json`: 패키지 메타데이터, npm 스크립트, 런타임/개발 의존성 목록입니다.
- `package-lock.json`: npm 의존성 버전 잠금 파일입니다. 재현 가능한 설치를 위해 유지합니다.
- `vite.config.js`: React 플러그인, 상대 경로 `base`, `dist` 출력 디렉터리를 설정하는 Vite 구성입니다.
