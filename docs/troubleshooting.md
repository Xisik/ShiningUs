# 문제 해결 가이드

## 활동이 표시되지 않는 경우

### 1. GitHub Actions 확인

먼저 GitHub Actions가 실행되었는지 확인하세요:

1. GitHub 저장소로 이동
2. "Actions" 탭 클릭
3. "Sync Notion Activities" 워크플로우 확인
4. 최근 실행 기록 확인
5. 실패한 경우 로그 확인

**워크플로우가 실행되지 않는 경우:**
- 수동으로 실행: Actions 탭에서 "Run workflow" 버튼 클릭
- 스케줄 확인: 5분, 6분, 7분마다 자동 실행되도록 설정되어 있음 (GitHub Actions 스케줄 실행의 불확실성 보완)

**노션 DB 변경 후 즉시 동기화하려면:**
1. **GitHub Actions에서 수동 실행 (권장)**
   - GitHub 저장소 → "Actions" 탭
   - "Sync Notion Activities" 워크플로우 선택
   - "Run workflow" 버튼 클릭
   - 브랜치 선택 (보통 `main`)
   - "Run workflow" 클릭

2. **API를 통한 수동 트리거 (고급)**
   ```bash
   # Personal Access Token 필요 (repo 권한)
   curl -X POST \
     -H "Accept: application/vnd.github.v3+json" \
     -H "Authorization: token YOUR_GITHUB_TOKEN" \
     https://api.github.com/repos/OWNER/REPO/dispatches \
     -d '{"event_type":"sync-notion"}'
   ```

**참고:**
- GitHub Actions의 스케줄 실행은 정확하지 않을 수 있습니다 (최대 5-10분 지연 가능)
- 노션 DB를 변경한 후 즉시 반영하려면 수동 실행을 권장합니다
- 자동 동기화는 평균 5-7분 내에 완료됩니다

### 2. 노션 필드 확인

활동이 표시되려면 다음 필수 필드가 있어야 합니다:

#### 필수 필드

1. **제목 필드** (다음 중 하나)
   - "제목"
   - "Title"
   - "이름"
   - "Name"
   - 타입: **Title** (노션의 기본 제목 필드)

2. **날짜 필드** (다음 중 하나)
   - "날짜"
   - "Date"
   - "일자"
   - 타입: **Date**

#### 선택적 필드

- **요약**: "요약", "Summary", "설명", "Description"
- **본문**: "본문", "Body", "내용", "Content" (또는 페이지 블록 콘텐츠)
- **공개 여부**: "공개 여부", "게시 상태", "발행 상태", "상태", "Published", "Public" (Checkbox, Status, Select, 텍스트)
  - 없으면 기본값: **비공개**
- **슬러그**: "슬러그", "Slug" (없으면 자동 생성)
- **카테고리**: "카테고리", "Category"
- **이미지**: "이미지", "Image"

### 3. 로컬 디버깅

로컬에서 문제를 진단하려면:

```bash
# Windows PowerShell
$env:NOTION_API_KEY="your_api_key"
$env:NOTION_DATABASE_ID="your_database_id"
node scripts/debug-notion.js

# Windows CMD
set NOTION_API_KEY=your_api_key
set NOTION_DATABASE_ID=your_database_id
node scripts/debug-notion.js

# Mac/Linux
NOTION_API_KEY=your_api_key NOTION_DATABASE_ID=your_database_id node scripts/debug-notion.js
```

이 스크립트는 다음을 확인합니다:
- 데이터베이스에서 페이지를 가져올 수 있는지
- 각 페이지의 필드명과 값
- 필수 필드가 있는지
- 공개 여부 설정

### 4. 일반적인 문제

#### 문제: "데이터베이스에서 페이지를 찾을 수 없습니다"

**해결 방법:**
1. 노션 데이터베이스에 최소 하나의 페이지가 있는지 확인
2. 노션 통합(Integration)이 데이터베이스에 연결되어 있는지 확인
   - 노션 데이터베이스 → "연결" → 통합 선택
3. GitHub Secrets의 `NOTION_DATABASE_ID`가 올바른지 확인
   - 데이터베이스 URL에서 ID 추출: `https://www.notion.so/.../{database_id}?v=...`

#### 문제: "활동이 건너뛰어졌습니다: 필수 필드 누락"

**해결 방법:**
1. 노션 페이지에 "제목" 필드가 있는지 확인 (Title 타입)
2. "날짜" 필드가 올바르게 설정되어 있는지 확인 (Date 타입)
3. 필드명이 정확한지 확인 (대소문자와 공백은 무시됨)

#### 문제: "활동이 표시되지 않음" (필드는 모두 있음)

**해결 방법:**
1. "공개 여부" 필드 확인
   - 체크박스: 체크되어 있어야 공개
   - Status/Select/Text: "공개", "공개됨", "게시", "게시됨", "발행", "발행됨", "Published", "Public", "Live", "Done", "완료" 등이어야 공개
   - "비공개", "초안", "미공개", "미게시", "숨김", "Draft", "Hidden" 등은 비공개
   - 필드가 없으면 기본적으로 비공개
2. `data/activities.json` 파일 확인
   - 빈 배열 `[]`이면 데이터가 없음
   - GitHub Actions 로그 확인

#### 문제: "API request failed: 400 Bad Request"

**해결 방법:**
1. API 키가 올바른지 확인
2. 데이터베이스 ID가 올바른지 확인
3. 노션 통합이 데이터베이스에 접근 권한이 있는지 확인

### 5. 데이터 확인

`data/activities.json` 파일을 확인하여 데이터가 올바르게 저장되었는지 확인:

```json
{
  "metadata": {
    "lastSyncedAt": "2026-01-15T10:30:00.000Z",
    "syncStatus": "success",
    "errorMessage": null,
    "activityCount": 1
  },
  "activities": [
    {
      "title": "활동 제목",
      "date": "2026-01-15T00:00:00.000Z",
      "summary": "활동 요약",
      "body": "활동 본문",
      "slug": "activity-slug",
      "published": true,
      ...
    }
  ]
}
```

---

## 정치위원회(성명서) 노션 연동이 안 될 때

정치위원회 성명은 **활동공유와 별도의 노션 데이터베이스**를 사용합니다. 성명이 안 보이면 아래를 순서대로 확인하세요.

### 1. GitHub Secrets 확인

저장소 **Settings → Secrets and variables → Actions**에서 다음이 있는지 확인:

| Secret 이름 | 설명 |
|------------|------|
| `NOTION_API_KEY` | 노션 통합 토큰 (활동공유와 동일한 통합 사용 가능) |
| `NOTION_STATEMENTS_DATABASE_ID` | **성명서 전용** 노션 데이터베이스 ID |

- `NOTION_STATEMENTS_DATABASE_ID`가 없으면 `NOTION_DATABASE_ID`(활동공유용 DB)를 쓰게 됩니다.  
  **성명서 전용 DB를 쓰려면 반드시 `NOTION_STATEMENTS_DATABASE_ID`를 추가하세요.**
- 데이터베이스 ID는 노션 DB 페이지 URL에서 확인:  
  `https://www.notion.so/.../{이 부분이 database_id}?v=...`

### 2. Sync Notion Statements 워크플로우 확인

1. GitHub 저장소 → **Actions** 탭
2. **"Sync Notion Statements"** 워크플로우 선택
3. 최근 실행이 **성공(녹색)** 인지 확인
4. 실패했다면 로그에서 다음 확인:
   - `NOTION_API_KEY` / `NOTION_STATEMENTS_DATABASE_ID` 누락 → Secrets 설정
   - `Could not find database` → 노션에서 통합 연결(아래 3번)
   - `Found 0 pages` → DB에 페이지가 없거나, 통합이 연결되지 않음
   - `Successfully transformed 0 statements` → 페이지는 있지만 필수 필드(제목/날짜) 누락

**즉시 동기화:** Actions → "Sync Notion Statements" → **Run workflow** → Run workflow

### 3. 노션에서 성명서 DB에 통합 연결

**가장 흔한 원인입니다.** 통합을 만들기만 하고 DB에 연결하지 않으면 데이터를 가져올 수 없습니다.

1. **성명서용** 노션 데이터베이스 페이지로 이동
2. 우측 상단 **"..."** → **연결(Connections)** 선택
3. 사용 중인 통합(예: bichcheongmo-sync) 검색 후 **연결**
4. 연결 후 GitHub Actions에서 "Sync Notion Statements"를 한 번 수동 실행

### 4. 성명서 DB 필드 확인

각 성명 **페이지**에 다음이 있어야 합니다:

- **제목** (또는 Title, 이름, Name) — 타입: **Title**
- **날짜** (또는 Date, 일자) — 타입: **Date**

둘 중 하나라도 없거나 비어 있으면 해당 페이지는 성명 목록에 포함되지 않습니다.  
요약·본문은 선택이며, 본문은 페이지 블록으로만 써도 됩니다.

### 5. 로컬에서 성명서 연동 테스트

로컬에서 아래 스크립트로 연결·필드를 확인할 수 있습니다:

```bash
# Windows PowerShell
$env:NOTION_API_KEY="your_api_key"
$env:NOTION_STATEMENTS_DATABASE_ID="your_database_id"
node scripts/debug-statements.js
```

성공하면 DB에서 가져온 페이지 수와 필드 정보가 출력됩니다. 실패 시 에러 메시지와 함께 확인할 항목이 안내됩니다.

### 6. 추가 도움말

더 자세한 내용은 다음 문서를 참조하세요:
- [노션 연동 설정 가이드](./notion-setup.md)
- [노션 활동 템플릿 가이드](./notion-template-guide.md)
- [노션 성명서 연동 설정 가이드](./notion-statements-setup.md) — **정치위원회 성명 전용**

