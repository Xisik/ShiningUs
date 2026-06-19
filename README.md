# bichcheongmo

빛청모 공식 웹사이트 저장소입니다. 정적 HTML, CSS, Vanilla JavaScript로 구성되어 있으며 GitHub Pages를 통해 배포됩니다.

## 개요

빛청모는 성소수자 개인을 지원하고 커뮤니티를 세우며, 회원 활동을 통해 성소수자에게 실질적인 연대와 지원을 제공하는 공조단체입니다.

이 저장소는 단체 소개, 활동 공유, 문의, 후원, 지역지부, 정치위원회, 성명 페이지를 관리합니다.

## 주요 페이지

- `index.html` - 메인 페이지
- `about.html` - 단체 소개
- `activities.html` - 활동 공유 목록 및 상세 보기
- `contact.html` - 문의하기
- `donate.html` - 후원하기
- `region.html` - 지역지부 소개
- `poli.html` - 정치위원회
- `poli-statements.html` - 정치위원회 성명 목록 및 상세 보기

## 프로젝트 구조

```text
bichcheongmo/
├── assets/
│   ├── css/        # 디자인 토큰, 레이아웃, 컴포넌트 스타일
│   ├── font/       # 웹 폰트
│   ├── img/        # 로고 및 콘텐츠 이미지
│   └── js/         # 공통 UI, 활동/성명 데이터 렌더링 로직
├── data/           # 활동 및 성명 JSON 데이터
├── docs/           # 개발, 배포, Notion 연동 문서
├── namari-gh-pages/ # Namari 템플릿 원본 참고 자료
├── scripts/        # Notion 동기화 및 디버깅 스크립트
├── .github/
│   └── workflows/  # GitHub Pages 배포 및 Notion 동기화 워크플로
└── *.html          # 정적 페이지 진입점
```

## 실행 및 확인

이 프로젝트는 별도 빌드 과정 없이 정적 파일로 동작합니다. 로컬에서 확인하려면 저장소 루트에서 정적 서버를 실행합니다.

```bash
npx serve .
```

또는 Python이 설치되어 있으면 다음 명령을 사용할 수 있습니다.

```bash
python -m http.server 8000
```

## Notion 데이터 동기화

활동, 성명, 지출내역 데이터는 Notion API를 통해 JSON 파일로 동기화됩니다.

- 활동 데이터: `data/activities.json`
- 성명 데이터: `data/statements.json`
- 지출내역 데이터: `data/payments.json`
- 활동 동기화: `node scripts/sync-notion.js`
- 성명 동기화: `node scripts/sync-notion-statements.js`
- 지출내역 동기화: `node scripts/sync-payments.js`

필요한 환경 변수는 GitHub Actions Secrets 또는 로컬 환경 변수로 설정합니다.

- `NOTION_API_KEY`
- `ACTIVITIES_DATABASE_ID`
- `STATEMENTS_DATABASE_ID`
- `PAYMENTS_DATABASE_ID`

## 배포

`main` 브랜치에 push되면 GitHub Actions의 Pages 배포 워크플로가 `scripts/prepare-pages.js`를 실행하여 `_site/` 배포 산출물을 만들고, 해당 디렉터리만 GitHub Pages 아티팩트로 업로드합니다.

커스텀 도메인은 `CNAME` 파일에서 관리합니다.

## 정리 내역

- 독립 Discord 리다이렉트 페이지인 `discord/` 디렉터리를 제거했습니다.
- 저장소 기능과 무관한 Cursor/BMAD 명령 파일인 `.cursor/` 디렉터리를 제거하고 `.gitignore`에 추가했습니다.
- HTML에서 로드되지 않는 브라우저 콘솔용 테스트 보조 파일을 제거했습니다.

## 라이선스

이 저장소의 소스 코드는 GNU General Public License v3.0 또는 이후 버전(`GPL-3.0-or-later`)에 따라 배포됩니다. 자세한 조건과 보증 부인은 [`LICENSE`](./LICENSE)를 확인하세요.

현재 UI 스타일과 애니메이션은 `namari-gh-pages/`에 포함된 Namari Landing Page v1.1.0의 색상, 여백, 섹션 제목, 버튼, reveal 모션을 참고해 조정했습니다. Namari 패키지 안의 MIT 표기 컴포넌트와 기존 YoRHa(`metakirby5/yorha`) 참고 사항은 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)에 보존되어 있습니다.