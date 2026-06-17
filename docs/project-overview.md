# bichcheongmo - Project Overview

**Date:** 2026-01-12  
**Type:** Static Web Site  
**Architecture:** Static Site Architecture

## Executive Summary

bichcheongmo는 성소수자 공조 단체를 위한 정적 웹사이트입니다. 순수 HTML, CSS, JavaScript로 구현되었으며, GitHub Actions에서 `_site/` 배포 산출물을 준비한 뒤 GitHub Pages로 서빙됩니다.

## Project Classification

- **Repository Type:** Monolith (단일 프로젝트)
- **Project Type(s):** Static Web Site
- **Primary Language(s):** HTML, CSS, JavaScript
- **Architecture Pattern:** Static Site Architecture

## Technology Stack Summary

| Category | Technology | Version | Justification |
|---------|------------|---------|---------------|
| **Markup** | HTML5 | 5.0 | 표준 HTML5, 한국어 지원 |
| **Styling** | CSS3 | 3.0 | CSS 변수 기반 디자인 시스템, 다크 모드 지원 |
| **Scripting** | Vanilla JavaScript | ES5/ES6 | 프레임워크 없는 순수 JavaScript |
| **Build Tool** | Node.js script | - | `scripts/prepare-pages.js`로 Pages 배포 산출물 준비 |
| **Package Manager** | npm | - | Notion 동기화 스크립트 의존성 관리 |
| **Deployment** | GitHub Pages | - | 정적 호스팅, 커스텀 도메인 지원 |

자세한 내용은 [technology-stack.md](./technology-stack.md) 참조.

## Key Features

- **정적 웹사이트**: 프레임워크 없이 순수 HTML/CSS/JS
- **Namari 기반 디자인 시스템**: CSS 변수로 Namari 스타일의 색상, 여백, 버튼, reveal 모션 관리
- **다크 모드 지원**: 라이트/다크 모드 전환 기능
- **반응형 디자인**: 모바일/데스크톱 지원
- **접근성**: 시맨틱 HTML, ARIA 레이블 사용
- **모듈화된 구조**: CSS와 JavaScript 모듈화

## Architecture Highlights

- **Static Site Architecture**: 서버 사이드 렌더링 없음
- **Namari-inspired Token System**: CSS 변수 기반 디자인 토큰과 Namari 스타일 애니메이션
- **Modular JavaScript**: 기능별 모듈화된 JavaScript 구조
- **GitHub Pages 배포**: 정적 호스팅, 자동 배포

## Development Overview

### Prerequisites

**필수 요구사항 없음**

- Node.js 불필요
- 패키지 매니저 불필요
- 빌드 도구 불필요

**권장:**
- 텍스트 에디터
- 모던 웹 브라우저
- Git

### Getting Started

1. 저장소 클론
2. 로컬 HTTP 서버 실행 (Python, Node.js 등)
3. 브라우저에서 `http://localhost:8000` 접속

자세한 내용은 [development-guide.md](./development-guide.md) 참조.

### Key Commands

**로컬 개발 서버:**
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

**배포:**
- GitHub에 코드 푸시
- GitHub Pages 자동 배포

## Repository Structure

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

## Documentation Map

For detailed information, see:

- [index.md](./index.md) - Master documentation index
- [architecture.md](./architecture.md) - Detailed architecture
- [source-tree-analysis.md](./source-tree-analysis.md) - Directory structure
- [development-guide.md](./development-guide.md) - Development workflow
- [technology-stack.md](./technology-stack.md) - Technology details
- [ui-component-inventory.md](./ui-component-inventory.md) - UI components
- [deployment-configuration.md](./deployment-configuration.md) - Deployment info

---

_Generated using BMAD Method `document-project` workflow_



