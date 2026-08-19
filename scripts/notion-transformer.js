const PUBLISH_PROPERTY_NAMES = [
  '공개여부', '공개 여부', '공개상태', '공개 상태',
  '게시여부', '게시 여부', '게시상태', '게시 상태',
  '발행여부', '발행 여부', '발행상태', '발행 상태',
  '상태', 'Status', 'Published', 'Public', 'Publish', 'Publication'
];
const PUBLIC_VALUES = new Set(['공개', '공개됨', '게시', '게시됨', '게시완료', '발행', '발행됨', '발행완료', '출판', '출판됨', 'published', 'public', 'publish', 'live', 'posted', 'visible', 'done', '완료']);
const PRIVATE_VALUES = new Set(['비공개', '비공개됨', '미공개', '미게시', '숨김', '초안', '임시', '검토중', '보류', 'private', 'unpublished', 'draft', 'hidden', 'pending', 'review']);

const normalize = (value) => String(value || '').toLowerCase().replace(/[\s_\-./()[\]{}]+/g, '');

function findProperty(properties, names) {
  if (!properties) return null;
  for (const name of names) {
    if (properties[name]) return properties[name];
  }
  const normalized = new Map(Object.entries(properties).map(([name, value]) => [normalize(name), value]));
  for (const name of names) {
    if (normalized.has(normalize(name))) return normalized.get(normalize(name));
  }
  return null;
}

function extractText(property) {
  if (!property) return '';
  const values = property[property.type];
  return Array.isArray(values) ? values.map((item) => item.plain_text || '').join('') : '';
}

function extractDate(property) {
  if (property?.type !== 'date' || !property.date?.start) return null;
  const date = new Date(property.date.start);
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractSelect(property) {
  return property?.type === 'select' ? property.select?.name || null : null;
}

function extractPublishStateName(property) {
  if (!property) return '';
  if (property.type === 'status') return property.status?.name || '';
  if (property.type === 'select') return property.select?.name || '';
  if (property.type === 'multi_select') return property.multi_select?.map((item) => item.name || '').join(' ') || '';
  return extractText(property);
}

function isPublished(properties, pageId = '') {
  const property = findProperty(properties, PUBLISH_PROPERTY_NAMES);
  if (!property) {
    console.warn(`Publish property not found for page ${pageId.slice(0, 8)}, defaulting to private`);
    return false;
  }
  if (property.type === 'checkbox') return property.checkbox === true;

  const value = normalize(extractPublishStateName(property));
  if (PUBLIC_VALUES.has(value)) return true;
  if (PRIVATE_VALUES.has(value)) return false;
  console.warn(`Unknown publish state "${extractPublishStateName(property)}" for page ${pageId.slice(0, 8)}, defaulting to private`);
  return false;
}

function extractFileUrl(property) {
  if (property?.type !== 'files' || !property.files?.length) return null;
  const file = property.files[0];
  return file.type === 'file' ? file.file?.url || null : file.external?.url || null;
}

function extractRichText(items) {
  if (!Array.isArray(items)) return '';
  return items.map((item) => {
    let text = item.plain_text || '';
    if (item.annotations?.bold) text = `**${text}**`;
    if (item.annotations?.italic) text = `*${text}*`;
    return item.href ? `[${text}](${item.href})` : text;
  }).join('');
}

function blocksToMarkdown(blocks) {
  if (!Array.isArray(blocks)) return '';
  const prefixes = {
    paragraph: '',
    heading_1: '# ',
    heading_2: '## ',
    heading_3: '### ',
    bulleted_list_item: '- ',
    numbered_list_item: '1. ',
    quote: '> '
  };

  return blocks.map((block) => {
    if (block.type === 'divider') return '---\n\n';
    if (block.type === 'code') {
      const text = extractRichText(block.code?.rich_text);
      return text ? `\`\`\`${block.code.language || ''}\n${text}\n\`\`\`\n\n` : '';
    }
    if (!(block.type in prefixes)) return '';
    const text = extractRichText(block[block.type]?.rich_text);
    const suffix = block.type.endsWith('list_item') ? '\n' : '\n\n';
    return text ? `${prefixes[block.type]}${text}${suffix}` : '';
  }).join('');
}

function transformNotionPage(page, blocks = []) {
  if (!page?.properties || !page.id) return null;
  const properties = page.properties;
  const title = extractText(findProperty(properties, ['제목', 'Title', '이름', 'Name'])).trim();
  const date = extractDate(findProperty(properties, ['날짜', 'Date', '일자', '날짜/시간']));
  if (!title || !date) return null;

  const summary = extractText(findProperty(properties, ['요약', 'Summary', '설명', 'Description'])).trim();
  const propertyBody = extractText(findProperty(properties, ['본문', 'Body', '내용', 'Content'])).trim();
  const body = propertyBody || blocksToMarkdown(blocks).trim() || summary || title;

  return {
    title,
    date: date.toISOString(),
    summary: summary || title,
    body,
    slug: page.id.replace(/-/g, ''),
    published: isPublished(properties, page.id),
    category: extractSelect(findProperty(properties, ['카테고리', 'Category', '분류'])),
    image: extractFileUrl(findProperty(properties, ['이미지', 'Image', '파일과 미디어', 'Files', '파일', 'File', '미디어', 'Media'])),
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time
  };
}

module.exports = {
  extractDate,
  extractText,
  findProperty,
  isPublished,
  transformNotionPage
};
