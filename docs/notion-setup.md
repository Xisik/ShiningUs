# 노션 연동 설정 가이드

이 문서는 노션 데이터 소스를 설정하고 GitHub Actions와 연동하는 방법을 설명합니다.

## Story 2.1: 노션 데이터 소스 연결 및 인증 설정

### 1. 노션 데이터베이스 생성

1. 노션에서 새 데이터베이스를 생성합니다.
2. 다음 필드를 포함해야 합니다 (한글 또는 영문 필드명 모두 지원):

   **필수 필드:**
   - **제목** 또는 **Title** (Title 타입) - 활동 제목
   - **날짜** 또는 **Date** (Date 타입) - 활동 날짜
   - **요약** 또는 **Summary** (Text 또는 Rich Text 타입) - 활동 요약
   - **본문** 또는 **Body** (Text 또는 Rich Text 타입) - 활동 본문
     - 또는 본문은 페이지 블록 콘텐츠로 작성 가능 (마크다운 지원)
   - **슬러그** 또는 **Slug** (Text 타입) - URL 슬러그 (고유 식별자)
     - 없으면 자동으로 페이지 ID 기반 생성
   - **공개 여부**, **게시 상태**, **발행 상태**, **Published** 등 (Checkbox/Status/Select 타입) - 공개/비공개
     - 기본값: false (공개 필드가 없거나 알 수 없는 값이면 비공개로 처리)

   **선택적 필드:**
   - **카테고리** 또는 **Category** (Select 타입) - 활동 카테고리
   - **이미지** 또는 **Image** (Files 타입) - 활동 이미지

### 2. 노션 통합 생성

1. [노션 통합 페이지](https://www.notion.so/my-integrations)로 이동
2. "새 통합" 클릭
3. 통합 이름 입력 (예: "bichcheongmo-sync")
4. 워크스페이스 선택
5. "제출" 클릭
6. **Internal Integration Token** 복사 (이것이 `NOTION_API_KEY`입니다)

### 3. 데이터베이스에 통합 연결

1. 노션 데이터베이스 페이지로 이동
2. 우측 상단 "..." 메뉴 클릭
3. "연결" → 생성한 통합 선택
4. 데이터베이스 ID 확인:
   - 데이터베이스 URL에서 확인 가능
   - URL 형식: `https://www.notion.so/{workspace}/{database_id}?v=...`
   - `database_id`는 32자리 16진수 문자열

### 4. GitHub Secrets 설정

1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. 다음 Secrets 추가:
   - `NOTION_API_KEY`: 노션 통합 토큰
   - `ACTIVITIES_DATABASE_ID`: 노션 활동내역 데이터베이스 ID

### 5. GitHub Actions 워크플로우 확인

`.github/workflows/sync-notion.yml` 파일이 올바르게 설정되어 있는지 확인합니다.

### 6. 테스트

1. GitHub Actions 탭으로 이동
2. "Sync Notion Activities" 워크플로우 선택
3. "Run workflow" 클릭하여 수동 실행
4. 실행 로그 확인

## 보안 주의사항

⚠️ **중요**: 
- 노션 API 키는 절대 클라이언트 사이드 코드에 포함하지 마세요
- GitHub Secrets에만 저장하세요
- 공개 저장소에 커밋하지 마세요

## 문제 해결

### 워크플로우가 실행되지 않는 경우
- GitHub Actions가 활성화되어 있는지 확인
- `.github/workflows/` 디렉토리가 올바른 위치에 있는지 확인

### 인증 오류가 발생하는 경우
- `NOTION_API_KEY`가 올바른지 확인
- 통합이 데이터베이스에 연결되어 있는지 확인
- 데이터베이스 권한 확인

### 데이터가 동기화되지 않는 경우
- 워크플로우 로그에서 에러 메시지 확인
- 노션 데이터베이스 필드명이 올바른지 확인 (한글/영문 모두 지원)
- 필수 필드(제목, 날짜)가 모든 페이지에 있는지 확인

### 필드명 매핑

시스템은 다음 필드명을 자동으로 인식합니다:
- 제목: `제목`, `Title`, `title`
- 날짜: `날짜`, `Date`, `date`
- 요약: `요약`, `Summary`, `summary`
- 본문: `본문`, `Body`, `body` (또는 페이지 블록 콘텐츠)
- 슬러그: `슬러그`, `Slug`, `slug`
- 공개 여부: `공개여부`, `공개 여부`, `공개상태`, `공개 상태`, `게시여부`, `게시 여부`, `게시상태`, `게시 상태`, `발행여부`, `발행 여부`, `발행상태`, `발행 상태`, `상태`, `Status`, `status`, `Published`, `published`, `Public`, `public`, `Publish`, `publish`
- 카테고리: `카테고리`, `Category`, `category`
- 이미지: `이미지`, `Image`, `image`

## 관련 문서

- [노션 활동 템플릿 가이드](./notion-template-guide.md) - 운영자용 템플릿 가이드

## 구현 완료

✅ Story 2.1: 노션 데이터 소스 연결 및 인증 설정
✅ Story 2.2: 노션 데이터 가져오기 및 변환
✅ Story 2.3: 자동 동기화 메커니즘 구현
✅ Story 2.4: 에러 처리 및 폴백 메커니즘
✅ Story 2.5: 운영자 경험 개선

노션 API 클라이언트와 데이터 변환기가 구현되었습니다.

