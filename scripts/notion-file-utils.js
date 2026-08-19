const fs = require('fs');
const path = require('path');

function isAllowedHttpsRemoteUrl(value, allowedHosts) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function isAllowedContentType(value, allowedTypes) {
  if (!allowedTypes.length) return true;
  const type = String(value || '').split(';')[0].trim().toLowerCase();
  return allowedTypes.some((allowed) => type === allowed || type.startsWith(`${allowed}/`));
}

async function fetchRemoteFile(url, allowedHosts, timeoutMs, redirectsLeft) {
  let currentUrl = url;

  for (let redirect = 0; redirect <= redirectsLeft; redirect += 1) {
    if (!isAllowedHttpsRemoteUrl(currentUrl, allowedHosts)) throw new Error(`remote URL is not allowed: ${currentUrl}`);
    const response = await fetch(currentUrl, {
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs)
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('redirect response is missing a location');
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) throw new Error(`download returned HTTP ${response.status}`);
    return response;
  }

  throw new Error('too many redirects');
}

async function downloadRemoteFile({
  url,
  outputDir,
  fileName,
  publicPath,
  allowedHosts,
  allowedContentTypes = [],
  label,
  maxBytes = 10 * 1024 * 1024,
  timeoutMs = 15_000,
  redirectsLeft = 3
}) {
  if (!url) return null;
  if (path.basename(fileName) !== fileName) throw new Error(`Invalid download file name: ${fileName}`);
  if (!isAllowedHttpsRemoteUrl(url, allowedHosts)) {
    console.warn(`  WARNING: Skipping ${label}: remote URL is not allowed`);
    return null;
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const localPath = path.join(outputDir, fileName);
  const temporaryPath = `${localPath}.${process.pid}.tmp`;

  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
    console.log(`  ↩ File already exists, skipping: ${fileName}`);
    return publicPath;
  }
  fs.rmSync(localPath, { force: true });

  try {
    const response = await fetchRemoteFile(url, allowedHosts, timeoutMs, redirectsLeft);
    if (!isAllowedContentType(response.headers.get('content-type'), allowedContentTypes)) {
      throw new Error(`unexpected content type: ${response.headers.get('content-type') || 'unknown'}`);
    }

    const declaredBytes = Number.parseInt(response.headers.get('content-length') || '', 10);
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) throw new Error(`file exceeds ${maxBytes} bytes`);

    const content = Buffer.from(await response.arrayBuffer());
    if (!content.length || content.length > maxBytes) throw new Error(`downloaded ${content.length} bytes`);
    fs.writeFileSync(temporaryPath, content);
    fs.renameSync(temporaryPath, localPath);
    console.log(`  ✓ File saved: ${fileName}`);
    return publicPath;
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    console.warn(`  WARNING: Failed to download ${label}: ${error.message}`);
    return null;
  }
}

function getReferencedPublicFileNames(items, publicPathPart, fieldName) {
  const referenced = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    if (typeof item?.[fieldName] !== 'string') continue;
    try {
      const url = new URL(item[fieldName], 'https://shiningus.org/');
      if (url.pathname.includes(publicPathPart)) referenced.add(path.basename(url.pathname));
    } catch {}
  }
  return referenced;
}

function pruneUnreferencedFiles({ dir, generatedFilePattern, referencedFileNames, label }) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !generatedFilePattern.test(entry.name) || referencedFileNames.has(entry.name)) continue;
    fs.unlinkSync(path.join(dir, entry.name));
    console.log(`  - Removed unreferenced ${label}: ${entry.name}`);
  }
}

function writeJsonFile(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    throw error;
  }
}

module.exports = {
  downloadRemoteFile,
  getReferencedPublicFileNames,
  isAllowedHttpsRemoteUrl,
  pruneUnreferencedFiles,
  writeJsonFile
};
