# Deployment Configuration

**Date:** 2026-01-12  
**Project:** bichcheongmo

## Deployment Platform

**GitHub Pages**

- 정적 사이트 호스팅
- 커스텀 도메인: `www.bichcheongmo.org` (CNAME 파일 설정)

## Deployment Process

### Automated Deployment

1. `main` 브랜치에 코드 푸시
2. GitHub Actions가 `node scripts/prepare-pages.js` 실행
3. `_site/` 배포 산출물을 GitHub Pages 아티팩트로 업로드
4. GitHub Pages가 자동으로 사이트 배포

### Custom Domain Setup

- **CNAME 파일:** `www.bichcheongmo.org` 설정
- DNS 설정 필요 (GitHub Pages 가이드 참조)

## Build Process

**정적 배포 산출물 준비**

- 번들러는 사용하지 않음
- `scripts/prepare-pages.js`가 `_site/`를 생성함
- `_site/`에는 루트 HTML, CNAME, 공개 JSON, 실제 참조되는 정적 자산만 포함됨
- `scripts/`, `docs/`, `.github/`, `package*.json` 등 운영/개발 파일은 Pages 산출물에서 제외됨

## Environment Configuration

**GitHub Actions Secrets**

- 정적 사이트 런타임에는 환경 변수가 없음
- Notion 동기화 워크플로는 GitHub Actions Secrets를 사용함
- 필요한 Secrets: `NOTION_API_KEY`, `ACTIVITIES_DATABASE_ID`, `STATEMENTS_DATABASE_ID`, `PAYMENTS_DATABASE_ID`

## CI/CD

**GitHub Actions**

- Pages 배포 워크플로: `.github/workflows/pages-deploy.yml`
- Notion 활동 동기화: `.github/workflows/sync-notion.yml`
- Notion 성명 동기화: `.github/workflows/sync-notion-statements.yml`

## Deployment Checklist

- [x] CNAME 파일 설정 완료
- [x] GitHub Pages 활성화
- [ ] DNS 설정 확인 (필요시)
- [ ] HTTPS 인증서 확인 (GitHub Pages 자동)

## Rollback Strategy

GitHub에서 이전 커밋으로 되돌리기:

1. GitHub 저장소에서 이전 커밋 선택
2. 해당 커밋으로 되돌리기
3. GitHub Actions가 `_site/`를 다시 생성하고 GitHub Pages 자동 재배포

## Monitoring

- GitHub Pages 기본 모니터링
- 추가 모니터링 도구 없음



