#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const STATIC_FILES = ['CNAME', 'favicon.ico', 'LICENSE', 'THIRD_PARTY_NOTICES.md'];
const STATIC_DIRS = ['data', path.join('assets', 'img'), path.join('assets', 'payment')];
const REDIRECTS = [
  ['about.html', '/about', '단체 소개 | About'],
  ['activities.html', '/activities', '활동공유 | Activities'],
  ['contact.html', '/contact', '문의하기 | Contact'],
  ['donate.html', '/donate', '후원하기 | Donate'],
  ['payments.html', '/payments', '지출내역 | Expense Reports'],
  ['poli-statements.html', '/statements', '성명 | Statements'],
  ['feedback.html', '/feedback', '피드백 | Feedback'],
  ['poli.html', '/poli', '정치위원회 | Political Committee'],
  ['region.html', '/region', '지역 지부 | Regional Branches']
];

function copyFile(relPath) {
  const source = path.join(ROOT, relPath);
  if (!fs.existsSync(source)) return;
  const target = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`  + ${relPath}`);
}

function copyDir(relPath) {
  const source = path.join(ROOT, relPath);
  if (!fs.existsSync(source)) return;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const childRel = path.join(relPath, entry.name);
    if (entry.isDirectory()) {
      copyDir(childRel);
    } else if (entry.isFile()) {
      copyFile(childRel);
    }
  }
}

function writeRedirect(fileName, hashPath, title) {
  const target = path.join(OUT, fileName);
  const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0; url=./#${hashPath}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="./assets/img/logo.jpg" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="Shining Us website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="Shining Us website" />
    <title>${title}</title>
  </head>
  <body>
    <a href="./#${hashPath}">Go to ${hashPath}</a>
  </body>
</html>
`;
  fs.writeFileSync(target, html);
  console.log(`  + ${fileName}`);
}

function main() {
  if (!fs.existsSync(OUT)) {
    throw new Error('dist directory does not exist. Run vite build first.');
  }

  console.log('Copying static assets for Vite build...');
  STATIC_FILES.forEach(copyFile);
  STATIC_DIRS.forEach(copyDir);
  REDIRECTS.forEach(([fileName, hashPath, title]) => writeRedirect(fileName, hashPath, title));
}

if (require.main === module) {
  main();
}

module.exports = {
  copyDir,
  copyFile,
  main,
  writeRedirect
};
