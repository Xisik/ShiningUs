export const collectionConfig = {
  dataUrl: './data/activities.json',
  payloadKey: 'activities',
  route: '/activities',
  titleKey: 'activities',
  descriptionKey: 'activitiesDescription',
  title: '\uD65C\uB3D9\uACF5\uC720',
  description: '\uBE5B\uCCAD\uBAA8\uC758 \uD65C\uB3D9\uACFC \uC18C\uC2DD\uC744 \uACF5\uC720\uD569\uB2C8\uB2E4.'
};

export function normalizePayload(payload, key) {
  if (Array.isArray(payload)) return { items: payload, metadata: null };
  return {
    items: Array.isArray(payload?.[key]) ? payload[key] : [],
    metadata: payload?._metadata || null
  };
}

export function normalizeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function normalizeItem(raw) {
  const title = String(raw?.title || raw?.name || '').trim();
  const date = normalizeDate(raw?.date || raw?.created_time || raw?.last_edited_time);
  const slug = String(raw?.id ? raw.id.replace(/-/g, '') : raw?.slug || title.toLowerCase().replace(/[^\w]+/g, '-')).trim();
  const published = raw?.published === true || raw?.published === 'true' || raw?.public === true;

  return {
    ...raw,
    title,
    slug,
    date,
    summary: String(raw?.summary || raw?.description || title || '').trim(),
    body: String(raw?.body || raw?.content || raw?.summary || '').trim(),
    image: typeof raw?.image === 'string' ? raw.image : (typeof raw?.cover === 'string' ? raw.cover : ''),
    category: typeof raw?.category === 'string' ? raw.category : '',
    published
  };
}

export function normalizeItems(rawItems) {
  return rawItems
    .map(normalizeItem)
    .filter((item) => item.title && item.slug && item.published)
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
}

export function formatDate(date, locale = 'ko-KR') {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function createGeneratedSrcSet(image) {
  if (!image || !/^\.?\/?assets\/img\/.+\.(?:png|jpe?g)$/i.test(image)) return '';
  const clean = image.replace(/^\.?\//, '');
  const withoutPrefix = clean.replace(/^assets\/img\//, '');
  const dot = withoutPrefix.lastIndexOf('.');
  const base = dot >= 0 ? withoutPrefix.slice(0, dot) : withoutPrefix;
  return [360, 720, 1080, 1440]
    .map((width) => `./assets/img/generated/${base}-${width}.webp ${width}w`)
    .join(', ');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
}

export function markdownToHtml(markdown) {
  const lines = String(markdown || '').split(/\r?\n/);
  const html = [];
  let listOpen = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (listOpen) {
        html.push('</ul>');
        listOpen = false;
      }
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (listOpen) html.push('</ul>');
      listOpen = false;
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (listOpen) html.push('</ul>');
      listOpen = false;
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (listOpen) html.push('</ul>');
      listOpen = false;
      html.push(`<h2>${inlineMarkdown(trimmed.slice(2))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('- ')) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(trimmed.slice(2))}</li>`);
      continue;
    }

    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  }

  if (listOpen) html.push('</ul>');
  return html.join('\n');
}
