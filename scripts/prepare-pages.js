#!/usr/bin/env node
/**
 * GitHub Pages 배포 산출물 준비 스크립트
 *
 * 보안: 레포 루트 전체(`path: '.'`)를 배포하면 scripts/, docs/, .github/ 등
 * 운영용 파일까지 웹에 노출된다. 이 스크립트는 실제 사이트 구동에 필요한
 * 파일만 `_site/` 디렉터리로 복사하여 배포 범위를 최소화한다.
 *
 * 포함:
 *   - 루트 *.html
 *   - CNAME
 *   - LICENSE, THIRD_PARTY_NOTICES.md
 *   - HTML/CSS/JSON에서 실제 참조하는 assets/*
 *   - data/activities.json, data/statements.json, data/payments.json
 *
 * 제외(미복사): scripts/, docs/, .github/, package.json, node_modules/, README,
 *              미참조 이미지/스크립트/CSS 등
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '_site');
const HTML_ASSET_RE = /\b(?:href|src)=["']\.\/(assets\/[^"'?#]+)(?:[?#][^"']*)?["']/g;
const CSS_URL_RE = /(?:@import\s+)?url\(["']?([^"')]+)["']?\)/g;

/**
 * 디렉터리를 재귀적으로 복사한다.
 * @param {string} src - 원본 경로
 * @param {string} dest - 대상 경로
 */
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 단일 파일을 복사한다 (없으면 경고만 출력).
 * @param {string} relPath - 레포 루트 기준 상대 경로
 */
function copyFile(relPath) {
  const srcPath = path.join(ROOT, relPath);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  WARNING: skip missing file: ${relPath}`);
    return;
  }
  const destPath = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  console.log(`  + ${relPath}`);
}

function normalizeAssetPath(assetPath) {
  if (!assetPath || /^(?:[a-z][a-z0-9+.-]*:|\/\/|data:)/i.test(assetPath)) {
    return null;
  }
  const cleanPath = assetPath.split('#')[0].split('?')[0].replace(/\\/g, '/').replace(/^\.?\//, '');
  if (!cleanPath.startsWith('assets/')) {
    return null;
  }
  return path.posix.normalize(cleanPath);
}

function collectHtmlAssetRefs(htmlFiles) {
  const refs = new Set();
  for (const htmlFile of htmlFiles) {
    const html = fs.readFileSync(path.join(ROOT, htmlFile), 'utf8');
    let match;
    while ((match = HTML_ASSET_RE.exec(html)) !== null) {
      const assetPath = normalizeAssetPath(match[1]);
      if (assetPath) refs.add(assetPath);
    }
  }
  return refs;
}

function collectJsonImageRefs(relPath, collectionKey) {
  const refs = new Set();
  const srcPath = path.join(ROOT, relPath);
  if (!fs.existsSync(srcPath)) return refs;

  try {
    const payload = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    const items = Array.isArray(payload) ? payload : (payload[collectionKey] || []);
    for (const item of Array.isArray(items) ? items : []) {
      const assetPath = normalizeAssetPath(item && item.image);
      if (assetPath) refs.add(assetPath);
    }
  } catch (error) {
    console.warn(`  WARNING: failed to read image refs from ${relPath}: ${error.message}`);
  }

  return refs;
}

function collectJsonPaymentRefs(relPath) {
  const refs = new Set();
  const srcPath = path.join(ROOT, relPath);
  if (!fs.existsSync(srcPath)) return refs;

  try {
    const payload = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    const payments = Array.isArray(payload) ? payload : (payload.payments || []);
    for (const payment of Array.isArray(payments) ? payments : []) {
      const urlRef = normalizeAssetPath(payment && payment.url);
      if (urlRef) {
        refs.add(urlRef);
        continue;
      }

      const file = payment && payment.file;
      if (file && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|data:)/i.test(file)) {
        const fileName = path.posix.basename(String(file).replace(/\\/g, '/'));
        refs.add(path.posix.join('assets', 'payment', fileName));
      }
    }
  } catch (error) {
    console.warn(`  WARNING: failed to read payment refs from ${relPath}: ${error.message}`);
  }

  return refs;
}

function collectCssDependencies(assetRefs) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const assetPath of Array.from(assetRefs)) {
      if (!assetPath.endsWith('.css')) continue;

      const cssPath = path.join(ROOT, assetPath);
      if (!fs.existsSync(cssPath)) continue;

      const css = fs.readFileSync(cssPath, 'utf8');
      let match;
      while ((match = CSS_URL_RE.exec(css)) !== null) {
        const url = match[1];
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|data:)/i.test(url)) continue;

        const resolvedPath = path.posix.normalize(path.posix.join(path.posix.dirname(assetPath), url));
        const normalized = normalizeAssetPath(resolvedPath);
        if (normalized && !assetRefs.has(normalized)) {
          assetRefs.add(normalized);
          changed = true;
        }
      }
    }
  }
}

function main() {
  console.log('Preparing _site/ for GitHub Pages...');

  // 기존 산출물 정리
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // 루트 HTML 파일
  const htmlFiles = [];
  for (const name of fs.readdirSync(ROOT)) {
    if (name.toLowerCase().endsWith('.html')) {
      htmlFiles.push(name);
      copyFile(name);
    }
  }

  // 커스텀 도메인 설정
  copyFile('CNAME');

  // 라이선스 및 제3자 고지는 배포본에서도 접근 가능해야 한다.
  copyFile('LICENSE');
  copyFile('THIRD_PARTY_NOTICES.md');

  // 공개 데이터 JSON만 선별 복사 (로컬 테스트용 *.local.json 등 제외)
  copyFile(path.join('data', 'activities.json'));
  copyFile(path.join('data', 'statements.json'));
  copyFile(path.join('data', 'payments.json'));

  // 실제 참조되는 정적 자산만 복사
  const assetRefs = collectHtmlAssetRefs(htmlFiles);
  for (const ref of collectJsonImageRefs(path.join('data', 'activities.json'), 'activities')) {
    assetRefs.add(ref);
  }
  for (const ref of collectJsonImageRefs(path.join('data', 'statements.json'), 'statements')) {
    assetRefs.add(ref);
  }
  for (const ref of collectJsonPaymentRefs(path.join('data', 'payments.json'))) {
    assetRefs.add(ref);
  }
  collectCssDependencies(assetRefs);

  for (const assetPath of Array.from(assetRefs).sort()) {
    copyFile(assetPath);
  }

  console.log('Done. Deployable site is in _site/');
}

main();
