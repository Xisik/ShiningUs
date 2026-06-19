# 성명서 노션 연동 테스트 가이드

## 빠른 테스트 방법

### 1. 환경 변수 설정

PowerShell에서 다음 명령어를 실행하세요:

```powershell
$env:NOTION_API_KEY="your_notion_api_key_here"
$env:STATEMENTS_DATABASE_ID="your_database_id_here"
```

### 2. 스크립트 실행

```powershell
node scripts/sync-notion-statements.js
```

### 3. 결과 확인

성공하면 `data/statements.json` 파일이 생성되고 업데이트됩니다.

## 문제 해결

### GitHub Actions가 실행되지 않는 경우

1. GitHub 저장소 → Actions 탭으로 이동
2. "Sync Notion Statements" 워크플로우 찾기
3. "Run workflow" 버튼 클릭하여 수동 실행

### GitHub Secrets 확인

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 다음 Secrets가 설정되어 있는지 확인:
   - `NOTION_API_KEY`
   - `STATEMENTS_DATABASE_ID`

### 노션 데이터베이스 확인

1. 노션 데이터베이스에 최소 하나의 페이지가 있는지 확인
2. 필수 필드가 모두 채워져 있는지 확인:
   - 제목 (Title)
   - 날짜 (Date)
   - 공개 여부 (Published) - 체크되어 있어야 함

### 로그 확인

GitHub Actions 실행 로그에서 다음을 확인:
- "Found X pages in database" - 페이지가 발견되었는지
- "Successfully transformed X statements" - 변환이 성공했는지
- 에러 메시지가 있는지
