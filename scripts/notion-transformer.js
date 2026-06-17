/**
 * 노션 데이터 변환기
 * 
 * Story 2.2: 노션 데이터 가져오기 및 변환
 * 
 * 노션 API 응답을 표준 활동 데이터 형식으로 변환합니다.
 */

/**
 * 제목에서 슬러그 생성
 * @param {string} title - 제목
 * @returns {string} 생성된 슬러그
 */
function generateSlugFromTitle(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 특수문자 제거
    .replace(/[\s_-]+/g, '-') // 공백, 언더스코어, 하이픈을 하이픈으로 통일
    .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
}

/**
 * 노션 속성에서 텍스트 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {string} 추출된 텍스트
 */
function extractText(property) {
  if (!property) return '';

  // Title 속성
  if (property.type === 'title' && Array.isArray(property.title)) {
    return property.title.map(item => item.plain_text || '').join('');
  }

  // Rich text 속성
  if (property.type === 'rich_text' && Array.isArray(property.rich_text)) {
    return property.rich_text.map(item => item.plain_text || '').join('');
  }

  // Text 속성 (구버전 호환)
  if (property.type === 'text' && Array.isArray(property.text)) {
    return property.text.map(item => item.plain_text || '').join('');
  }

  return '';
}

/**
 * 노션 속성에서 날짜 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {Date|null} 추출된 날짜
 */
function extractDate(property) {
  if (!property || property.type !== 'date') return null;

  const dateValue = property.date;
  if (!dateValue || !dateValue.start) return null;

  const date = new Date(dateValue.start);
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * 노션 속성에서 체크박스 값 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {boolean} 체크박스 값
 */
function extractCheckbox(property) {
  if (!property || property.type !== 'checkbox') return false;
  return property.checkbox === true;
}

/**
 * 노션 속성에서 선택 값 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {string|null} 선택된 값
 */
function extractSelect(property) {
  if (!property || property.type !== 'select') return null;
  return property.select ? property.select.name : null;
}

/**
 * 공개 여부 속성에서 상태/선택/텍스트 값을 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {string} 추출된 값
 */
function extractPublishStateName(property) {
  if (!property) return '';

  if (property.type === 'status') {
    return property.status?.name || '';
  }
  if (property.type === 'select') {
    return property.select?.name || '';
  }
  if (property.type === 'multi_select' && Array.isArray(property.multi_select)) {
    return property.multi_select.map(item => item.name || '').join(' ');
  }
  if (property.type === 'rich_text' || property.type === 'title' || property.type === 'text') {
    return extractText(property);
  }

  return '';
}

function normalizePublishValue(value) {
  return String(value || '').toLowerCase().replace(/[\s_\-./()[\]{}]+/g, '');
}

function includesNormalized(values, target) {
  const normalizedTarget = normalizePublishValue(target);
  return values.some(value => normalizePublishValue(value) === normalizedTarget);
}

/**
 * 노션 속성에서 파일 URL 추출
 * @param {Object} property - 노션 속성 객체
 * @returns {string|null} 파일 URL
 */
function extractFileUrl(property) {
  if (!property || property.type !== 'files') return null;
  
  const files = property.files;
  if (!Array.isArray(files) || files.length === 0) return null;

  const firstFile = files[0];
  if (firstFile.type === 'file' && firstFile.file) {
    return firstFile.file.url;
  }
  if (firstFile.type === 'external' && firstFile.external) {
    return firstFile.external.url;
  }

  return null;
}

/**
 * 노션 블록을 마크다운으로 변환
 * @param {Array} blocks - 노션 블록 배열
 * @returns {string} 마크다운 텍스트
 */
function blocksToMarkdown(blocks) {
  if (!Array.isArray(blocks)) return '';

  return blocks.map(block => {
    const type = block.type;

    // Paragraph
    if (type === 'paragraph') {
      const text = extractRichText(block.paragraph.rich_text);
      return text ? `${text}\n\n` : '';
    }

    // Heading 1
    if (type === 'heading_1') {
      const text = extractRichText(block.heading_1.rich_text);
      return text ? `# ${text}\n\n` : '';
    }

    // Heading 2
    if (type === 'heading_2') {
      const text = extractRichText(block.heading_2.rich_text);
      return text ? `## ${text}\n\n` : '';
    }

    // Heading 3
    if (type === 'heading_3') {
      const text = extractRichText(block.heading_3.rich_text);
      return text ? `### ${text}\n\n` : '';
    }

    // Bulleted list item
    if (type === 'bulleted_list_item') {
      const text = extractRichText(block.bulleted_list_item.rich_text);
      return text ? `- ${text}\n` : '';
    }

    // Numbered list item
    if (type === 'numbered_list_item') {
      const text = extractRichText(block.numbered_list_item.rich_text);
      return text ? `1. ${text}\n` : '';
    }

    // Code
    if (type === 'code') {
      const text = extractRichText(block.code.rich_text);
      const language = block.code.language || '';
      return text ? `\`\`\`${language}\n${text}\n\`\`\`\n\n` : '';
    }

    // Quote
    if (type === 'quote') {
      const text = extractRichText(block.quote.rich_text);
      return text ? `> ${text}\n\n` : '';
    }

    // Divider
    if (type === 'divider') {
      return '---\n\n';
    }

    return '';
  }).join('');
}

/**
 * Rich text 배열에서 텍스트 추출
 * @param {Array} richText - Rich text 배열
 * @returns {string} 추출된 텍스트
 */
function extractRichText(richText) {
  if (!Array.isArray(richText)) return '';

  return richText.map(item => {
    let text = item.plain_text || '';

    // 굵게
    if (item.annotations && item.annotations.bold) {
      text = `**${text}**`;
    }

    // 기울임
    if (item.annotations && item.annotations.italic) {
      text = `*${text}*`;
    }

    // 링크
    if (item.href) {
      text = `[${text}](${item.href})`;
    }

    return text;
  }).join('');
}

/**
 * 노션 페이지를 활동 데이터로 변환
 * @param {Object} page - 노션 페이지 객체
 * @param {Array} blocks - 페이지 블록 배열 (선택적)
 * @returns {Object|null} 변환된 활동 데이터 또는 null
 */
/**
 * 속성 이름으로 속성 찾기 (대소문자, 공백 무시)
 * @param {Object} properties - 속성 객체
 * @param {Array<string>} possibleNames - 가능한 이름 배열
 * @returns {Object|null} 찾은 속성 또는 null
 */
function findProperty(properties, possibleNames) {
  if (!properties) return null;
  
  // 정확한 이름으로 먼저 찾기
  for (const name of possibleNames) {
    if (properties[name]) {
      return properties[name];
    }
  }
  
  // 대소문자 무시, 공백 무시로 찾기
  const propertyKeys = Object.keys(properties);
  for (const name of possibleNames) {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');
    for (const key of propertyKeys) {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
      if (normalizedName === normalizedKey) {
        return properties[key];
      }
    }
  }
  
  return null;
}

function transformNotionPage(page, blocks = []) {
  if (!page || !page.properties) return null;

  const properties = page.properties;

  // 필수 필드 추출 (더 유연한 매칭)
  const titleProperty = findProperty(properties, ['제목', 'Title', 'title', '이름', 'Name', 'name']);
  const title = extractText(titleProperty);
  
  const dateProperty = findProperty(properties, ['날짜', 'Date', 'date', '일자', '날짜/시간']);
  const date = extractDate(dateProperty);
  
  const summaryProperty = findProperty(properties, ['요약', 'Summary', 'summary', '설명', 'Description', 'description']);
  const summary = extractText(summaryProperty);
  
  // 본문은 블록에서 가져오거나 본문 필드에서 가져오기
  const bodyProperty = findProperty(properties, ['본문', 'Body', 'body', '내용', 'Content', 'content']);
  let body = extractText(bodyProperty);
  if (!body && blocks.length > 0) {
    body = blocksToMarkdown(blocks);
  }

  // 슬러그는 제목에서 자동 생성 (페이지 ID 기반 fallback)
  const slug = generateSlugFromTitle(title) || page.id.replace(/-/g, '').substring(0, 20);

  // 공개 여부 (opt-in)
  // Checkbox, Status, Select, 텍스트 타입 모두 지원
  const publishedProperty = findProperty(properties, [
    '공개여부', '공개 여부', '공개상태', '공개 상태',
    '게시여부', '게시 여부', '게시상태', '게시 상태',
    '발행여부', '발행 여부', '발행상태', '발행 상태',
    '상태', 'Status', 'status',
    'Published', 'published',
    'Public', 'public',
    'Publish', 'publish',
    'Publication', 'publication'
  ]);
  // 보안: opt-in 공개 정책. 공개 여부가 명시되지 않으면 비공개로 처리한다.
  let published = false;
  if (publishedProperty) {
    if (publishedProperty.type === 'checkbox') {
      published = publishedProperty.checkbox === true;
    } else {
      // 상태/선택/텍스트 값이 공개 계열이면 true, 비공개/초안 계열이면 false
      const statusName = extractPublishStateName(publishedProperty);
      const publicValues = [
        '공개', '공개됨', '게시', '게시됨', '게시 완료',
        '발행', '발행됨', '발행 완료', '출판', '출판됨',
        'Published', 'published', 'Public', 'public',
        'Publish', 'publish', 'Live', 'live',
        'Posted', 'posted', 'Visible', 'visible',
        'Done', 'done', '완료'
      ];
      const privateValues = [
        '비공개', '비공개됨', '미공개', '미게시', '숨김',
        '초안', '임시', '검토중', '검토 중', '보류',
        'Private', 'private', 'Unpublished', 'unpublished',
        'Draft', 'draft', 'Hidden', 'hidden',
        'Pending', 'pending', 'Review', 'review'
      ];
      
      if (includesNormalized(publicValues, statusName)) {
        published = true;
      } else if (includesNormalized(privateValues, statusName)) {
        published = false;
      } else {
        // 알 수 없는 값이면 안전하게 비공개 처리
        console.warn(`Unknown publish state value: "${statusName}" (type=${publishedProperty.type}), defaulting to false`);
        published = false;
      }
    }
  } else {
    console.warn(`Publish property not found for page ${page.id.substring(0, 8)}, defaulting to false`);
  }

  // 선택적 필드
  const categoryProperty = findProperty(properties, ['카테고리', 'Category', 'category', '분류', '분류']);
  const category = extractSelect(categoryProperty);
  
  const imageProperty = findProperty(properties, [
    '이미지', 'Image', 'image', 
    '파일과 미디어', 'Files', 'files',
    '파일', 'File', 'file',
    '미디어', 'Media', 'media'
  ]);
  const image = extractFileUrl(imageProperty);

  // 필수 필드 검증
  if (!title || !date) {
    console.warn(`\n⚠️ Skipping page ${page.id.substring(0, 8)}: missing required fields`);
    console.warn(`  - Title: ${title || 'MISSING'} (property found: ${titleProperty ? 'YES' : 'NO'})`);
    console.warn(`  - Date: ${date ? date.toISOString() : 'MISSING'} (property found: ${dateProperty ? 'YES' : 'NO'})`);
    console.warn(`  - Available properties: ${Object.keys(properties).join(', ')}`);
    console.warn(`  - Property details:`);
    Object.keys(properties).forEach(key => {
      const prop = properties[key];
      console.warn(`    - "${key}": type=${prop.type || 'unknown'}`);
    });
    console.warn(``);
    return null;
  }

  return {
    title: title.trim(),
    date: date.toISOString(),
    summary: summary.trim() || title.trim(),
    body: body.trim() || summary.trim() || title.trim(),
    slug: slug.trim(),
    published: published,
    category: category,
    image: image,
    // 메타데이터
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time
  };
}

module.exports = {
  transformNotionPage,
  extractText,
  extractDate,
  extractCheckbox,
  extractSelect,
  extractFileUrl,
  blocksToMarkdown,
  extractRichText,
  extractPublishStateName
};

