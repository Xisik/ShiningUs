const fs = require('fs');
const path = require('path');
const https = require('https');

function isAllowedRemoteHost(urlStr, allowedHosts) {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function isAllowedHttpsRemoteUrl(urlStr, allowedHosts) {
  try {
    const parsedUrl = new URL(urlStr);
    return parsedUrl.protocol === 'https:' && isAllowedRemoteHost(urlStr, allowedHosts);
  } catch {
    return false;
  }
}

function isAllowedContentType(contentType, allowedContentTypes) {
  if (!Array.isArray(allowedContentTypes) || allowedContentTypes.length === 0) return true;
  const normalized = String(contentType || '').split(';')[0].trim().toLowerCase();
  return allowedContentTypes.some((allowed) => normalized === allowed || normalized.startsWith(`${allowed}/`));
}

function downloadRemoteFile({
  url,
  outputDir,
  fileName,
  publicPath,
  allowedHosts,
  allowedContentTypes = [],
  label,
  maxBytes = 10 * 1024 * 1024,
  timeoutMs = 15000,
  redirectsLeft = 3
}) {
  if (!url || !isAllowedHttpsRemoteUrl(url, allowedHosts)) {
    if (url) console.warn(`  WARNING: Remote HTTPS URL not allowed, skipping ${label}: ${url}`);
    return Promise.resolve(null);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const localPath = path.join(outputDir, fileName);

  if (fs.existsSync(localPath)) {
    console.log(`  ↩ File already exists, skipping: ${fileName}`);
    return Promise.resolve(publicPath);
  }

  return new Promise((resolve) => {
    let settled = false;
    let output = null;

    function finish(value) {
      if (settled) return;
      settled = true;
      resolve(value);
    }

    function removePartial() {
      if (output) output.destroy();
      fs.unlink(localPath, () => {});
    }

    const request = https.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        if (redirectsLeft <= 0 || !res.headers.location) {
          console.warn(`  WARNING: Too many redirects for ${label}: ${fileName}`);
          finish(null);
          return;
        }
        const nextUrl = new URL(res.headers.location, url).toString();
        downloadRemoteFile({
          url: nextUrl,
          outputDir,
          fileName,
          publicPath,
          allowedHosts,
          allowedContentTypes,
          label,
          maxBytes,
          timeoutMs,
          redirectsLeft: redirectsLeft - 1
        }).then(finish);
        return;
      }

      if (res.statusCode !== 200) {
        console.warn(`  WARNING: Download failed (status ${res.statusCode}) for ${label}: ${fileName}`);
        finish(null);
        return;
      }

      if (!isAllowedContentType(res.headers['content-type'], allowedContentTypes)) {
        console.warn(`  WARNING: Unexpected content type for ${label}: ${res.headers['content-type'] || 'unknown'}`);
        finish(null);
        return;
      }

      const contentLength = Number.parseInt(res.headers['content-length'] || '', 10);
      if (Number.isFinite(contentLength) && contentLength > maxBytes) {
        console.warn(`  WARNING: Download too large for ${label}: ${contentLength} bytes`);
        finish(null);
        return;
      }

      let downloadedBytes = 0;
      output = fs.createWriteStream(localPath);
      res.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        if (downloadedBytes > maxBytes) {
          request.destroy();
          removePartial();
          console.warn(`  WARNING: Download exceeded size limit for ${label}: ${fileName}`);
          finish(null);
          return;
        }
        output.write(chunk);
      });
      res.on('end', () => {
        output.end();
      });
      output.on('finish', () => {
        output.close();
        console.log(`  ✓ File saved: ${fileName}`);
        finish(publicPath);
      });
      output.on('error', (error) => {
        removePartial();
        console.warn(`  WARNING: Failed to save ${label} ${fileName}: ${error.message}`);
        finish(null);
      });
    });

    request.on('error', (error) => {
      removePartial();
      console.warn(`  WARNING: Download error for ${label} ${fileName}: ${error.message}`);
      finish(null);
    });
    request.setTimeout(timeoutMs, () => {
      request.destroy();
      removePartial();
      console.warn(`  WARNING: Download timed out for ${label}: ${fileName}`);
      finish(null);
    });
  });
}

function getReferencedPublicFileNames(items, publicPathPart, fieldName) {
  const referenced = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item[fieldName] !== 'string') continue;
    try {
      const url = new URL(item[fieldName], 'https://shiningus.org/');
      if (url.pathname.includes(publicPathPart)) {
        referenced.add(path.basename(url.pathname));
      }
    } catch {
      // Ignore non-URL values.
    }
  }
  return referenced;
}

function pruneUnreferencedFiles({ dir, generatedFilePattern, referencedFileNames, label }) {
  if (!fs.existsSync(dir)) return;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      !entry.isFile() ||
      !generatedFilePattern.test(entry.name) ||
      referencedFileNames.has(entry.name)
    ) {
      continue;
    }
    fs.unlinkSync(path.join(dir, entry.name));
    console.log(`  - Removed unreferenced ${label}: ${entry.name}`);
  }
}

module.exports = {
  downloadRemoteFile,
  getReferencedPublicFileNames,
  isAllowedRemoteHost,
  isAllowedHttpsRemoteUrl,
  pruneUnreferencedFiles
};
