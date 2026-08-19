#!/usr/bin/env node

const path = require('path');
const NotionClient = require('./notion-client');
const { extractText, findProperty, isPublished, transformNotionPage } = require('./notion-transformer');
const {
  downloadRemoteFile,
  getReferencedPublicFileNames,
  isAllowedHttpsRemoteUrl,
  pruneUnreferencedFiles,
  writeJsonFile
} = require('./notion-file-utils');

const ROOT = path.join(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'assets', 'img', 'activities');
const DATA_PATH = path.join(ROOT, 'data', 'activities.json');
const GENERATED_IMAGE_RE = /^[0-9a-f-]{32,36}\.(avif|gif|jpe?g|png|webp)$/i;
const NOTION_FILE_HOSTS = ['amazonaws.com', 'notion.so', 'notion-static.com', 'notion.com'];

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} environment variable is not set`);
  return value;
}

async function downloadImage(url, activityId) {
  let extension = path.extname(new URL(url).pathname).toLowerCase() || '.jpg';
  if (!/^\.(avif|gif|jpe?g|png|webp)$/i.test(extension)) extension = '.jpg';
  const fileName = `${activityId}${extension}`;
  return downloadRemoteFile({
    url,
    outputDir: IMAGE_DIR,
    fileName,
    publicPath: `./assets/img/activities/${fileName}`,
    allowedHosts: NOTION_FILE_HOSTS,
    allowedContentTypes: ['image'],
    label: `activity image ${activityId}`
  });
}

async function fetchActivities() {
  const apiKey = requireEnvironment('NOTION_API_KEY');
  const databaseId = requireEnvironment('ACTIVITIES_DATABASE_ID');
  const client = new NotionClient(apiKey);
  const pages = await client.queryDatabase(databaseId);
  if (!pages.length) throw new Error('Notion activities database returned no pages');

  const activities = [];
  const errors = [];

  for (const page of pages) {
    try {
      if (!page?.id || !page.properties) throw new Error('invalid page response');
      if (!isPublished(page.properties, page.id)) {
        console.log(`  ↩ Skipping unpublished activity: ${page.id.slice(0, 8)}`);
        continue;
      }

      let activity = transformNotionPage(page);
      if (!activity) throw new Error('missing required title or date');
      const propertyBody = extractText(findProperty(page.properties, ['본문', 'Body', '내용', 'Content'])).trim();
      if (!propertyBody) activity = transformNotionPage(page, await client.getPageBlocks(page.id));

      if (activity.image && isAllowedHttpsRemoteUrl(activity.image, NOTION_FILE_HOSTS)) {
        activity.image = await downloadImage(activity.image, activity.id);
        if (!activity.image) throw new Error('image download failed');
      }

      activities.push(activity);
      console.log(`  ✓ ${activity.title}`);
    } catch (error) {
      errors.push(new Error(`${page?.id?.slice(0, 8) || 'unknown'}: ${error.message}`));
    }
  }

  if (errors.length) throw new AggregateError(errors, `Failed to process ${errors.length} activity page(s)`);
  return activities.sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.title.localeCompare(b.title, 'ko'));
}

function saveActivities(activities) {
  const referenced = getReferencedPublicFileNames(activities, '/assets/img/activities/', 'image');
  pruneUnreferencedFiles({
    dir: IMAGE_DIR,
    generatedFilePattern: GENERATED_IMAGE_RE,
    referencedFileNames: referenced,
    label: 'activity image'
  });
  writeJsonFile(DATA_PATH, {
    _metadata: {
      lastUpdated: new Date().toISOString(),
      activitiesCount: activities.length,
      version: '1.0'
    },
    activities
  });
  console.log(`Saved ${activities.length} activities`);
}

async function main() {
  console.log('Syncing Notion activities...');
  saveActivities(await fetchActivities());
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
