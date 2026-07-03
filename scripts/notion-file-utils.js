const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function isAllowedRemoteHost(urlStr, allowedHosts) {
  try {
    const host = new URL(urlStr).hostname.toLowerCase();
    return allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function downloadRemoteFile({
  url,
  outputDir,
  fileName,
  publicPath,
  allowedHosts,
  label,
  timeoutMs = 15000,
  redirectsLeft = 3
}) {
  if (!url || !isAllowedRemoteHost(url, allowedHosts)) {
    if (url) console.warn(`  WARNING: Remote host not allowed, skipping ${label}: ${url}`);
    return Promise.resolve(null);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const localPath = path.join(outputDir, fileName);

  if (fs.existsSync(localPath)) {
    console.log(`  ↩ File already exists, skipping: ${fileName}`);
    return Promise.resolve(publicPath);
  }

  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (redirectsLeft <= 0 || !res.headers.location) {
          console.warn(`  WARNING: Too many redirects for ${label}: ${fileName}`);
          resolve(null);
          return;
        }
        downloadRemoteFile({
          url: res.headers.location,
          outputDir,
          fileName,
          publicPath,
          allowedHosts,
          label,
          timeoutMs,
          redirectsLeft: redirectsLeft - 1
        }).then(resolve);
        return;
      }

      if (res.statusCode !== 200) {
        console.warn(`  WARNING: Download failed (status ${res.statusCode}) for ${label}: ${fileName}`);
        resolve(null);
        return;
      }

      const output = fs.createWriteStream(localPath);
      res.pipe(output);
      output.on('finish', () => {
        output.close();
        console.log(`  ✓ File saved: ${fileName}`);
        resolve(publicPath);
      });
      output.on('error', (error) => {
        fs.unlink(localPath, () => {});
        console.warn(`  WARNING: Failed to save ${label} ${fileName}: ${error.message}`);
        resolve(null);
      });
    });

    request.on('error', (error) => {
      console.warn(`  WARNING: Download error for ${label} ${fileName}: ${error.message}`);
      resolve(null);
    });
    request.setTimeout(timeoutMs, () => {
      request.destroy();
      console.warn(`  WARNING: Download timed out for ${label}: ${fileName}`);
      resolve(null);
    });
  });
}

function getReferencedPublicFileNames(items, publicPathPart, fieldName) {
  const referenced = new Set();
  for (const item of Array.isArray(items) ? items : []) {
    if (!item || typeof item[fieldName] !== 'string') continue;
    try {
      const url = new URL(item[fieldName], 'https://www.bichcheongmo.org/');
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
  pruneUnreferencedFiles
};
