# 노션 성명서 연동 설정 가이드

이 문서는 노션 데이터베이스에서 성명서 데이터를 가져와 자동으로 동기화하는 방법을 설명합니다.

## 빠른 시작

### 1. 노션 데이터베이스 생성

1. 노션에서 새 데이터베이스를 생성합니다.
2. 다음 필드를 포함해야 합니다:

   **필수 필드:**
   - **제목** 또는 **Title** (Title 타입) - 성명 제목
   - **날짜** 또는 **Date** (Date 타입) - 성명 날짜
   - **요약** 또는 **Summary** (Text 또는 Rich Text 타입) - 성명 요약
   - **본문** 또는 **Body** (Text 또는 Rich Text 타입) - 성명 본문
     - 또는 본문은 페이지 블록 콘텐츠로 작성 가능 (마크다운 지원)
   - **공개 여부**, **게시 상태**, **발행 상태**, **Published** 등 (Checkbox/Status/Select 타입) - 공개/비공개
     - 기본값: false (공개 필드가 없거나 알 수 없는 값이면 비공개로 처리)
   
   **참고**: 슬러그는 제목에서 자동으로 생성되므로 별도 필드가 필요하지 않습니다.

   **선택적 필드:**
   - **이미지** 또는 **Image** (Files 타입) - 성명 이미지

### 2. 노션 통합 생성 (활동공유와 동일한 통합 사용 가능)

활동공유와 동일한 노션 통합을 사용하거나, 별도의 통합을 생성할 수 있습니다.

1. [노션 통합 페이지](https://www.notion.so/my-integrations)로 이동
2. 기존 통합 사용 또는 "새 통합" 클릭
3. 통합 이름 입력 (예: "bichcheongmo-sync")
4. 워크스페이스 선택
5. "제출" 클릭
6. **Internal Integration Token** 복사

### 3. 데이터베이스에 통합 연결 ⚠️ 중요!

**이 단계가 가장 중요합니다. 이 단계를 건너뛰면 "Could not find database" 에러가 발생합니다.**

#### 방법 1: 연결(Connections) 메뉴 사용 (권장)

1. 노션 성명서 데이터베이스 페이지로 이동
2. 우측 상단 **"..."** 메뉴 클릭
3. **"연결"** 또는 **"Connections"** 선택
4. 생성한 통합 이름을 검색하여 선택
5. 연결 완료 확인

#### 방법 2: 공유(Share) 메뉴 사용

1. 노션 성명서 데이터베이스 페이지로 이동
2. 우측 상단 **"공유"** 또는 **"Share"** 버튼 클릭
3. 통합 이름을 검색하여 추가
4. **"Can view"** 또는 **"Can edit"** 권한 부여
5. 저장

#### 데이터베이스 ID 확인

- 데이터베이스 URL에서 확인 가능
- URL 형식: `https://www.notion.so/{workspace}/{database_id}?v=...`
- `database_id`는 32자리 16진수 문자열 (하이픈 포함 시 36자)
- 예: `307324da-d966-80bc-ae26-d1ee149772c4`

### 4. GitHub Secrets 설정

1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. 다음 Secret 추가:
   - `NOTION_STATEMENTS_DATABASE_ID`: 노션 성명서 데이터베이스 ID
   - (활동공유와 다른 통합을 사용하는 경우) `NOTION_STATEMENTS_API_KEY`: 별도 API 키
   - (활동공유와 동일한 통합을 사용하는 경우) 기존 `NOTION_API_KEY` 사용

**참고**: `NOTION_STATEMENTS_DATABASE_ID`가 설정되지 않으면 `NOTION_DATABASE_ID`를 사용합니다.

### 5. 수동 테스트

#### 디버깅 스크립트 실행 (권장)

먼저 디버깅 스크립트로 연결 상태를 확인하세요:

```bash
# Windows PowerShell
$env:NOTION_API_KEY="your_api_key"
$env:NOTION_STATEMENTS_DATABASE_ID="your_database_id"
node scripts/debug-statements.js

# Mac/Linux
export NOTION_API_KEY="your_api_key"
export NOTION_STATEMENTS_DATABASE_ID="your_database_id"
node scripts/debug-statements.js
```

디버깅 스크립트가 성공하면 동기화 스크립트도 성공할 것입니다.

#### 동기화 스크립트 실행

```bash
# Windows PowerShell
$env:NOTION_API_KEY="your_api_key"
$env:NOTION_STATEMENTS_DATABASE_ID="your_database_id"
node scripts/sync-notion-statements.js

# Mac/Linux
export NOTION_API_KEY="your_api_key"
export NOTION_STATEMENTS_DATABASE_ID="your_database_id"
node scripts/sync-notion-statements.js
```

### 6. GitHub Actions 자동 동기화

`.github/workflows/sync-notion-statements.yml` 파일이 자동으로 설정되어 있습니다.

- **자동 실행**: 매 5-7분마다 자동으로 동기화
- **수동 실행**: GitHub Actions 탭에서 "Sync Notion Statements" 워크플로우를 수동으로 실행 가능

## 필드명 매핑

시스템은 다음 필드명을 자동으로 인식합니다:
- 제목: `제목`, `Title`, `title` (슬러그는 제목에서 자동 생성)
- 날짜: `날짜`, `Date`, `date`
- 요약: `요약`, `Summary`, `summary`
- 본문: `본문`, `Body`, `body` (또는 페이지 블록 콘텐츠)
- 공개 여부: `공개여부`, `공개 여부`, `공개상태`, `공개 상태`, `게시여부`, `게시 여부`, `게시상태`, `게시 상태`, `발행여부`, `발행 여부`, `발행상태`, `발행 상태`, `상태`, `Status`, `status`, `Published`, `published`, `Public`, `public`, `Publish`, `publish`
- 이미지: `이미지`, `Image`, `image`

## 문제 해결

### "Could not find database" 에러

이 에러는 **통합이 데이터베이스에 연결되지 않았을 때** 발생합니다.

**해결 방법:**

1. **노션에서 데이터베이스 확인**
   - 데이터베이스 페이지로 이동
   - 우측 상단 "..." 메뉴 → "연결" 확인
   - 통합이 연결되어 있는지 확인
   - 연결되어 있지 않으면 통합을 추가

2. **데이터베이스 ID 확인**
   - URL에서 데이터베이스 ID 추출
   - GitHub Secrets의 `NOTION_STATEMENTS_DATABASE_ID`와 일치하는지 확인
   - 하이픈 포함/제외 여부 확인 (둘 다 가능)

3. **디버깅 스크립트 실행**
   ```bash
   node scripts/debug-statements.js
   ```
   - 스크립트가 자세한 에러 메시지와 해결 방법을 제공합니다

### 데이터가 동기화되지 않는 경우

- GitHub Actions 로그에서 에러 메시지 확인
- 노션 데이터베이스 필드명이 올바른지 확인
- 필수 필드(제목, 날짜)가 모든 페이지에 있는지 확인
- `NOTION_STATEMENTS_DATABASE_ID` Secret이 올바르게 설정되었는지 확인
- **디버깅 스크립트 실행**: `node scripts/debug-statements.js`

### 인증 오류가 발생하는 경우

- `NOTION_API_KEY`가 올바른지 확인
- 통합이 데이터베이스에 연결되어 있는지 확인
- 데이터베이스 권한 확인
- 노션 통합 페이지에서 토큰 재생성: https://www.notion.so/my-integrations

## 관련 문서

- [노션 연동 설정 가이드](./notion-setup.md) - 활동공유용 설정 가이드
- [노션 템플릿 가이드](./notion-template-guide.md) - 운영자용 템플릿 가이드
