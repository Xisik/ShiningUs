#!/usr/bin/env node
/**
 * 노션 성명서 데이터베이스 디버깅 스크립트
 * 
 * 데이터베이스 ID와 통합 접근 권한을 확인합니다.
 */

const NotionClient = require('./notion-client');

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const STATEMENTS_DATABASE_ID = process.env.STATEMENTS_DATABASE_ID;

if (!NOTION_API_KEY) {
  console.error('ERROR: Notion API key is not set. Set NOTION_API_KEY.');
  process.exit(1);
}

if (!STATEMENTS_DATABASE_ID) {
  console.error('ERROR: STATEMENTS_DATABASE_ID environment variable is not set');
  process.exit(1);
}

async function debugDatabase() {
  try {
    console.log('=== 노션 성명서 데이터베이스 디버깅 ===\n');
    console.log(`Database ID: ${STATEMENTS_DATABASE_ID}`);
    console.log('API Key: (설정됨)\n');
    
    const client = new NotionClient(NOTION_API_KEY);
    
    // 데이터베이스 정보 가져오기 시도
    console.log('1. 데이터베이스 정보 조회 시도...');
    try {
      const formattedId = STATEMENTS_DATABASE_ID.replace(/-/g, '');
      const dbInfo = await client.request(`/databases/${formattedId}`, {
        method: 'GET'
      });
      
      console.log('✓ 데이터베이스 접근 성공!');
      console.log(`  제목: ${dbInfo.title?.[0]?.plain_text || 'N/A'}`);
      console.log(`  속성 개수: ${Object.keys(dbInfo.properties || {}).length}`);
      console.log(`  속성 목록: ${Object.keys(dbInfo.properties || {}).join(', ')}`);
      
      // 페이지 쿼리 시도
      console.log('\n2. 페이지 쿼리 시도...');
      const pages = await client.queryDatabase(STATEMENTS_DATABASE_ID);
      console.log(`✓ 페이지 쿼리 성공!`);
      console.log(`  페이지 개수: ${pages.length}`);
      
      if (pages.length > 0) {
        console.log('\n3. 첫 번째 페이지 정보:');
        const firstPage = pages[0];
        console.log(`  페이지 ID: ${firstPage.id}`);
        console.log(`  속성: ${Object.keys(firstPage.properties || {}).join(', ')}`);
      }
      
      console.log('\n✅ 모든 테스트 통과! 데이터베이스에 정상적으로 접근할 수 있습니다.');
      
    } catch (error) {
      console.error('✗ 데이터베이스 접근 실패');
      console.error(`  에러: ${error.message}`);
      
      if (error.message.includes('Could not find database')) {
        console.error('\n⚠️  해결 방법:');
        console.error('  1. 노션에서 데이터베이스 페이지로 이동');
        console.error('  2. 우측 상단 "공유" 또는 "Share" 버튼 클릭');
        console.error('  3. 통합(Integration) 이름을 검색하여 추가');
        console.error('  4. "Can view" 또는 "Can edit" 권한 부여');
        console.error('\n  또는:');
        console.error('  1. 데이터베이스 페이지에서 우측 상단 "..." 메뉴 클릭');
        console.error('  2. "연결" 또는 "Connections" 선택');
        console.error('  3. 통합을 선택하여 연결');
      } else if (error.message.includes('Unauthorized')) {
        console.error('\n⚠️  해결 방법:');
        console.error('  1. NOTION_API_KEY가 올바른지 확인');
        console.error('  2. 노션 통합 페이지에서 토큰 확인: https://www.notion.so/my-integrations');
      } else {
        console.error('\n⚠️  기타 에러:');
        console.error(`  ${error.stack}`);
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugDatabase();
