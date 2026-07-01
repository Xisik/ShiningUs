#!/usr/bin/env node
/**
 * 노션 지출내역 데이터베이스를 스캔해 지출내역 PDF 목록 manifest를 갱신한다.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const NotionClient = require('./notion-client');
const {
  extractText,
  extractDate,
  extractPublishStateName
} = require('./notion-transformer');

const ROOT = path.join(__dirname, '..');
const PAYMENT_DIR = path.join(ROOT, 'assets', 'payment');
const DATA_PATH = path.join(ROOT, 'data', 'payments.json');
const JS_PATH = path.join(ROOT, 'assets', 'js', 'payments-data.js');
const GENERATED_PAYMENT_RE = /^[0-9a-f-]{32,36}\.pdf$/i;
const ALLOWED_DOWNLOAD_HOSTS = ['amazonaws.com', 'notion.so', 'notion-static.com', 'notion.com'];

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const PAYMENTS_DATABASE_ID = process.env.PAYMENTS_DATABASE_ID;

function normalizePropertyName(name) {
  return String(name || '').toLowerCase().replace(/\s+/g, '');
}

function findProperty(properties, possibleNames) {
  if (!properties) return null;

  for (const name of possibleNames) {
    if (properties[name]) return properties[name];
  }

  const propertyKeys = Object.keys(properties);
  for (const name of possibleNames) {
    const normalizedName = normalizePropertyName(name);
    for (const key of propertyKeys) {
      if (normalizePropertyName(key) === normalizedName) {
        return properties[key];
      }
    }
  }

  return null;
}

function normalizePublishValue(value) {
  return String(value || '').toLowerCase().replace(/[\s_\-./()[\]{}]+/g, '');
}

function isPaymentPublished(properties) {
  const publishedProperty = findProperty(properties, [
    '공개여부', '공개 여부', '공개상태', '공개 상태',
    '게시여부', '게시 여부', '게시상태', '게시 상태',
    '발행여부', '발행 여부', '발행상태', '발행 상태',
    '상태', 'Status', 'status',
    'Published', 'published',
    'Public', 'public',
    'Publish', 'publish'
  ]);

  if (!publishedProperty) {
    return true;
  }

  if (publishedProperty.type === 'checkbox') {
    return publishedProperty.checkbox === true;
  }

  const value = normalizePublishValue(extractPublishStateName(publishedProperty));
  const privateValues = ['비공개', '미공개', '미게시', '숨김', '초안', '임시', '검토중', '보류', 'private', 'unpublished', 'draft', 'hidden', 'pending', 'review'];
  const publicValues = ['공개', '게시', '발행', '출판', '완료', 'published', 'public', 'publish', 'live', 'posted', 'visible', 'done'];

  if (privateValues.some(item => normalizePublishValue(item) === value)) return false;
  if (publicValues.some(item => normalizePublishValue(item) === value)) return true;

  return false;
}

function getTitle(properties, pdfFile) {
  const titleProperty = findProperty(properties, ['제목', 'Title', 'title', '이름', 'Name', 'name', '보고서 제목']);
  const title = extractText(titleProperty).trim();
  if (title) return title;

  return path.basename(pdfFile.name || '지출내역서.pdf', path.extname(pdfFile.name || ''));
}

function getPaymentDate(properties) {
  const dateProperty = findProperty(properties, ['날짜', 'Date', 'date', '일자', '작성일', '보고일', '등록일']);
  const date = extractDate(dateProperty);
  return date ? date.toISOString() : null;
}

function extractPaymentFile(properties) {
  const fileProperty = findProperty(properties, [
    'PDF', 'pdf',
    '파일', 'File', 'file',
    '파일과 미디어', 'Files', 'files',
    '첨부파일', '첨부 파일',
    '보고서', '지출내역서', '지출 내역서'
  ]);

  if (!fileProperty || fileProperty.type !== 'files' || !Array.isArray(fileProperty.files)) {
    return null;
  }

  for (const file of fileProperty.files) {
    const name = file.name || '';
    const url = file.type === 'file' ? file.file?.url : file.external?.url;

    if (url && (/\.pdf(?:[?#].*)?$/i.test(url) || /\.pdf$/i.test(name))) {
      return {
        name: name || '지출내역서.pdf',
        url,
        sourceType: file.type
      };
    }
  }

  return null;
}

function isAllowedDownloadHost(urlStr) {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return ALLOWED_DOWNLOAD_HOSTS.some(allowed => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function getGeneratedPaymentFileName(pageId) {
  return `${pageId}.pdf`;
}

function downloadPaymentPdf(fileUrl, fileName, redirectsLeft = 3) {
  if (!isAllowedDownloadHost(fileUrl)) {
    return Promise.resolve(null);
  }

  fs.mkdirSync(PAYMENT_DIR, { recursive: true });
  const localPath = path.join(PAYMENT_DIR, fileName);
  const publicPath = `./assets/payment/${fileName}`;

  return new Promise((resolve) => {
    const protocol = fileUrl.startsWith('https') ? https : http;
    const request = protocol.get(fileUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (redirectsLeft <= 0 || !res.headers.location) {
          console.warn(`  WARNING: Too many redirects for payment PDF: ${fileName}`);
          resolve(null);
          return;
        }
        downloadPaymentPdf(res.headers.location, fileName, redirectsLeft - 1).then(resolve);
        return;
      }

      if (res.statusCode !== 200) {
        console.warn(`  WARNING: PDF download failed (status ${res.statusCode}) for ${fileName}`);
        resolve(null);
        return;
      }

      const output = fs.createWriteStream(localPath);
      res.pipe(output);
      output.on('finish', () => {
        output.close();
        console.log(`  ✓ PDF saved: ${fileName}`);
        resolve(publicPath);
      });
      output.on('error', (error) => {
        fs.unlink(localPath, () => {});
        console.warn(`  WARNING: Failed to save payment PDF ${fileName}: ${error.message}`);
        resolve(null);
      });
    });

    request.on('error', (error) => {
      console.warn(`  WARNING: PDF download error for ${fileName}: ${error.message}`);
      resolve(null);
    });
    request.setTimeout(30000, () => {
      request.destroy();
      console.warn(`  WARNING: PDF download timed out for ${fileName}`);
      resolve(null);
    });
  });
}

function pruneUnreferencedPaymentFiles(payments) {
  if (!fs.existsSync(PAYMENT_DIR)) return;

  const referenced = new Set(
    (Array.isArray(payments) ? payments : [])
      .map(payment => payment && payment.file)
      .filter(Boolean)
  );

  for (const entry of fs.readdirSync(PAYMENT_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !GENERATED_PAYMENT_RE.test(entry.name) || referenced.has(entry.name)) {
      continue;
    }
    fs.unlinkSync(path.join(PAYMENT_DIR, entry.name));
    console.log(`  - Removed unreferenced payment PDF: ${entry.name}`);
  }
}

async function transformPaymentPage(page) {
  if (!page || !page.properties) return null;

  const properties = page.properties;
  if (!isPaymentPublished(properties)) {
    console.log(`  ↩ Skipping unpublished payment: ${page.id.substring(0, 8)}...`);
    return null;
  }

  const pdfFile = extractPaymentFile(properties);
  if (!pdfFile) {
    console.warn(`\n⚠️ Skipping payment ${page.id.substring(0, 8)}: missing PDF file`);
    console.warn(`  - Available properties: ${Object.keys(properties).join(', ')}`);
    return null;
  }

  const localFileName = getGeneratedPaymentFileName(page.id);
  const downloadedUrl = await downloadPaymentPdf(pdfFile.url, localFileName);
  const isExternal = pdfFile.sourceType === 'external';

  if (!downloadedUrl && !isExternal) {
    console.warn(`  WARNING: Skipping payment because Notion PDF could not be saved: ${pdfFile.name}`);
    return null;
  }

  return {
    title: getTitle(properties, pdfFile),
    file: downloadedUrl ? localFileName : null,
    fileName: pdfFile.name,
    url: downloadedUrl || pdfFile.url,
    date: getPaymentDate(properties),
    createdAt: page.created_time,
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time
  };
}

async function fetchPaymentsData() {
  if (!NOTION_API_KEY) {
    throw new Error('NOTION_API_KEY environment variable is not set');
  }
  if (!PAYMENTS_DATABASE_ID) {
    throw new Error('PAYMENTS_DATABASE_ID environment variable is not set');
  }

  console.log('Connecting to Notion API for payments...');
  console.log(`PAYMENTS_DATABASE_ID: ${PAYMENTS_DATABASE_ID.substring(0, 8)}...`);

  const client = new NotionClient(NOTION_API_KEY);
  const pages = await client.queryDatabase(PAYMENTS_DATABASE_ID);
  console.log(`Found ${pages.length} payment pages in database`);

  const payments = [];
  for (const page of pages) {
    try {
      const payment = await transformPaymentPage(page);
      if (payment) {
        payments.push(payment);
        console.log(`✓ Transformed payment: ${payment.title}`);
      }
    } catch (error) {
      console.error(`ERROR: Failed to process payment page ${page.id.substring(0, 8)}:`, error.message);
    }
  }

  return payments.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.title.localeCompare(b.title, 'ko'));
}

function writePaymentsData(payments, metadata = {}) {
  const payload = {
    _metadata: {
      lastUpdated: metadata.lastUpdated || new Date().toISOString(),
      syncStatus: metadata.syncStatus || 'success',
      errorMessage: metadata.errorMessage || null,
      paymentsCount: Array.isArray(payments) ? payments.length : 0,
      version: '1.0'
    },
    payments: Array.isArray(payments) ? payments : []
  };

  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  fs.mkdirSync(path.dirname(JS_PATH), { recursive: true });
  fs.writeFileSync(JS_PATH, `(function () {
  'use strict';

  const ui = window.__ui || (window.__ui = {});

  ui.payments = ui.payments || {};
  ui.payments.data = ${JSON.stringify(payload, null, 2)};
})();
`, 'utf8');

  console.log(`SUCCESS: Saved ${payload.payments.length} payments to ${DATA_PATH}`);
}

async function syncPayments() {
  const startTime = new Date();
  let syncStatus = 'success';
  let errorMessage = null;
  let payments = [];

  try {
    payments = await fetchPaymentsData();
    if (payments.length === 0) {
      syncStatus = 'partial';
      errorMessage = 'No payments found in database';
    }
  } catch (error) {
    syncStatus = 'error';
    errorMessage = error.message;
    console.error('ERROR: Payment sync failed:', error.message);
  } finally {
    pruneUnreferencedPaymentFiles(payments);
    writePaymentsData(payments, {
      lastUpdated: new Date().toISOString(),
      syncStatus,
      errorMessage,
      syncDuration: new Date() - startTime
    });
  }

  return payments;
}

if (require.main === module) {
  syncPayments();
}

module.exports = {
  fetchPaymentsData,
  writePaymentsData,
  syncPayments
};
