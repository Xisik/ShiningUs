#!/usr/bin/env node

const path = require('path');
const NotionClient = require('./notion-client');
const { extractDate, extractText, findProperty, isPublished } = require('./notion-transformer');
const { downloadRemoteFile, pruneUnreferencedFiles, writeJsonFile } = require('./notion-file-utils');

const ROOT = path.join(__dirname, '..');
const PAYMENT_DIR = path.join(ROOT, 'assets', 'payment');
const DATA_PATH = path.join(ROOT, 'data', 'payments.json');
const GENERATED_PAYMENT_RE = /^[0-9a-f-]{32,36}\.pdf$/i;
const NOTION_FILE_HOSTS = ['amazonaws.com', 'notion.so', 'notion-static.com', 'notion.com'];

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} environment variable is not set`);
  return value;
}

function extractPaymentFile(properties) {
  const property = findProperty(properties, ['PDF', '파일', 'File', '파일과 미디어', 'Files', '첨부파일', '첨부 파일', '보고서', '지출내역서', '지출 내역서']);
  if (property?.type !== 'files') return null;
  for (const file of property.files || []) {
    const url = file.type === 'file' ? file.file?.url : file.external?.url;
    if (url && (/\.pdf(?:[?#].*)?$/i.test(url) || /\.pdf$/i.test(file.name || ''))) {
      return { name: file.name || '지출내역서.pdf', url };
    }
  }
  return null;
}

async function transformPayment(page) {
  if (!page?.id || !page.properties) throw new Error('invalid page response');
  if (!isPublished(page.properties, page.id)) return null;

  const file = extractPaymentFile(page.properties);
  if (!file) throw new Error('missing PDF file');
  const localFileName = `${page.id}.pdf`;
  const url = await downloadRemoteFile({
    url: file.url,
    outputDir: PAYMENT_DIR,
    fileName: localFileName,
    publicPath: `./assets/payment/${localFileName}`,
    allowedHosts: NOTION_FILE_HOSTS,
    allowedContentTypes: ['application/pdf'],
    label: `payment PDF ${localFileName}`,
    maxBytes: 20 * 1024 * 1024,
    timeoutMs: 30_000
  });
  if (!url) throw new Error('PDF download failed');

  const title = extractText(findProperty(page.properties, ['제목', 'Title', '이름', 'Name', '보고서 제목'])).trim()
    || path.basename(file.name, path.extname(file.name));
  const date = extractDate(findProperty(page.properties, ['날짜', 'Date', '일자', '작성일', '보고일', '등록일']));

  return {
    title,
    file: localFileName,
    fileName: file.name,
    url,
    date: date?.toISOString() || null,
    createdAt: page.created_time,
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time
  };
}

async function fetchPayments() {
  const client = new NotionClient(requireEnvironment('NOTION_API_KEY'));
  const pages = await client.queryDatabase(requireEnvironment('PAYMENTS_DATABASE_ID'));
  if (!pages.length) throw new Error('Notion payments database returned no pages');

  const payments = [];
  const errors = [];
  for (const page of pages) {
    try {
      const payment = await transformPayment(page);
      if (payment) {
        payments.push(payment);
        console.log(`  ✓ ${payment.title}`);
      }
    } catch (error) {
      errors.push(new Error(`${page?.id?.slice(0, 8) || 'unknown'}: ${error.message}`));
    }
  }

  if (errors.length) throw new AggregateError(errors, `Failed to process ${errors.length} payment page(s)`);
  return payments.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.title.localeCompare(b.title, 'ko'));
}

function savePayments(payments) {
  pruneUnreferencedFiles({
    dir: PAYMENT_DIR,
    generatedFilePattern: GENERATED_PAYMENT_RE,
    referencedFileNames: new Set(payments.map((payment) => payment.file)),
    label: 'payment PDF'
  });
  writeJsonFile(DATA_PATH, {
    _metadata: {
      lastUpdated: new Date().toISOString(),
      paymentsCount: payments.length,
      version: '1.0'
    },
    payments
  });
  console.log(`Saved ${payments.length} payments`);
}

async function main() {
  console.log('Syncing Notion payments...');
  savePayments(await fetchPayments());
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
