# Project Documentation Index

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Project Overview

- **Type:** Monolith (단일 프로젝트)
- **Primary Language:** HTML, CSS, JavaScript
- **Architecture:** Static Site Architecture

## Quick Reference

- **Tech Stack:** HTML5, CSS3, Vanilla JavaScript
- **Entry Point:** `index.html`
- **Architecture Pattern:** Static Site Architecture
- **Deployment:** GitHub Pages (`www.bichcheongmo.org`)

## Generated Documentation

### Core Documentation

- [Project Overview](./project-overview.md) - 프로젝트 개요 및 요약
- [Architecture](./architecture.md) - 상세 아키텍처 문서
- [Source Tree Analysis](./source-tree-analysis.md) - 디렉토리 구조 분석
- [Technology Stack](./technology-stack.md) - 기술 스택 상세 정보

### Development & Operations

- [Development Guide](./development-guide.md) - 개발 가이드 및 워크플로우
- [Deployment Configuration](./deployment-configuration.md) - 배포 설정 및 프로세스

### Component & Design

- [UI Component Inventory](./ui-component-inventory.md) - UI 컴포넌트 목록 및 설명

## Existing Documentation

- [README.md](../README.md) - 프로젝트 설명
- [LICENSE](../LICENSE) - GNU General Public License v3.0 or later (`GPL-3.0-or-later`)
- [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) - Namari/YoRHa 등 제3자 저작권 및 MIT 라이선스 고지

## Getting Started

### Local Development

1. 저장소 클론
2. 로컬 HTTP 서버 실행:
   ```bash
   python -m http.server 8000
   # 또는
   npx http-server -p 8000
   ```
3. 브라우저에서 `http://localhost:8000` 접속

자세한 내용은 [Development Guide](./development-guide.md) 참조.

### Project Structure

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
└── docs/                   # 문서 (이 디렉토리)
```

자세한 내용은 [Source Tree Analysis](./source-tree-analysis.md) 참조.

## Documentation Navigation

### For Developers

- 시작하기: [Development Guide](./development-guide.md)
- 아키텍처 이해: [Architecture](./architecture.md)
- 컴포넌트 사용: [UI Component Inventory](./ui-component-inventory.md)

### For Deployment

- 배포 가이드: [Deployment Configuration](./deployment-configuration.md)
- 배포 플랫폼: GitHub Pages

### For Understanding the Project

- 프로젝트 개요: [Project Overview](./project-overview.md)
- 기술 스택: [Technology Stack](./technology-stack.md)
- 소스 구조: [Source Tree Analysis](./source-tree-analysis.md)

## Key Features

- **정적 웹사이트**: 프레임워크 없이 순수 HTML/CSS/JS
- **토큰 기반 디자인 시스템**: CSS 변수를 통한 일관된 디자인
- **다크 모드 지원**: 라이트/다크 모드 전환 기능
- **반응형 디자인**: 모바일/데스크톱 지원
- **접근성**: 시맨틱 HTML, ARIA 레이블 사용

## Technology Summary

- **HTML5**: 표준 HTML5, 한국어 지원
- **CSS3**: CSS 변수 기반 디자인 시스템, 다크 모드 지원
- **Vanilla JavaScript**: 프레임워크 없는 순수 JavaScript
- **GitHub Pages**: 정적 호스팅, 자동 배포

자세한 내용은 [Technology Stack](./technology-stack.md) 참조.

## Architecture Summary

**Static Site Architecture**

- 클라이언트 사이드 렌더링 없음
- 서버 사이드 렌더링 없음
- 순수 정적 HTML/CSS/JS 파일 제공
- GitHub Pages를 통한 정적 호스팅

자세한 내용은 [Architecture](./architecture.md) 참조.

## Next Steps

프로젝트 문서화가 완료되었습니다. 다음 단계:

1. **프로젝트 검토**: 생성된 문서를 검토하고 필요한 수정 사항 확인
2. **브라운필드 PRD 작성**: 새로운 기능 계획 시 이 문서를 참조
3. **개발 시작**: [Development Guide](./development-guide.md)를 따라 로컬 개발 환경 설정

## Documentation Metadata

- **Generated:** 2026-01-12
- **Workflow:** document-project
- **Scan Level:** Quick Scan
- **Mode:** Initial Scan

---

_This is the primary entry point for AI-assisted development. All documentation is located in the `docs/` directory._



