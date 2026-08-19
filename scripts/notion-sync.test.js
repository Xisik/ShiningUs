const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const NotionClient = require('./notion-client');
const { findProperty, isPublished, transformNotionPage } = require('./notion-transformer');
const { isAllowedHttpsRemoteUrl } = require('./notion-file-utils');

function page(published = true) {
  return {
    id: '12345678-1234-1234-1234-123456789abc',
    created_time: '2026-01-01T00:00:00.000Z',
    last_edited_time: '2026-01-02T00:00:00.000Z',
    properties: {
      '제 목': { type: 'title', title: [{ plain_text: '테스트 활동' }] },
      Date: { type: 'date', date: { start: '2026-01-01' } },
      Published: { type: 'checkbox', checkbox: published }
    }
  };
}

test('property matching and publication are fail-closed', () => {
  const properties = page().properties;
  assert.equal(findProperty(properties, ['제목']).type, 'title');
  assert.equal(isPublished(properties), true);
  assert.equal(isPublished(page(false).properties), false);
  assert.equal(isPublished({}, 'missing-page'), false);
});

test('activity transformation rejects missing required fields', () => {
  const transformed = transformNotionPage(page(), [{
    type: 'paragraph',
    paragraph: { rich_text: [{ plain_text: '본문' }] }
  }]);
  assert.equal(transformed.title, '테스트 활동');
  assert.equal(transformed.body, '본문');
  assert.equal(transformed.slug, '12345678123412341234123456789abc');
  assert.equal(transformNotionPage({ ...page(), properties: {} }), null);
});

test('pagination rejects malformed responses', async () => {
  const client = new NotionClient('test');
  client.request = async () => ({ has_more: false });
  await assert.rejects(client.queryDatabase('database-id'), /results must be an array/);

  client.request = async () => ({ results: [], has_more: true, next_cursor: null });
  await assert.rejects(client.getPageBlocks('block-id'), /missing pagination cursor/);
});

test('download allowlist requires HTTPS and an exact host boundary', () => {
  const hosts = ['notion.so'];
  assert.equal(isAllowedHttpsRemoteUrl('https://files.notion.so/file.pdf', hosts), true);
  assert.equal(isAllowedHttpsRemoteUrl('http://files.notion.so/file.pdf', hosts), false);
  assert.equal(isAllowedHttpsRemoteUrl('https://notion.so.example.com/file.pdf', hosts), false);
});

test('checked-in manifests reference existing local files', () => {
  const root = path.join(__dirname, '..');
  for (const [manifest, key, field] of [
    ['data/activities.json', 'activities', 'image'],
    ['data/payments.json', 'payments', 'url']
  ]) {
    const payload = JSON.parse(fs.readFileSync(path.join(root, manifest), 'utf8'));
    assert.equal(payload._metadata[`${key}Count`], payload[key].length);
    if (key === 'activities') assert.equal(new Set(payload[key].map((item) => item.slug)).size, payload[key].length);
    for (const item of payload[key]) {
      if (item[field]?.startsWith('./')) assert.equal(fs.existsSync(path.join(root, item[field].slice(2))), true, item[field]);
    }
  }
});
