const BASE_URL = 'https://api.notion.com/v1';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class NotionClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async request(path, { method = 'GET', body } = {}, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);
      let response;

      try {
        response = await fetch(`${BASE_URL}${path}`, {
          method,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });
      } catch (error) {
        if (attempt === retries || !['AbortError', 'TypeError'].includes(error.name)) throw error;
        await wait(2 ** attempt * 1000);
        continue;
      } finally {
        clearTimeout(timeout);
      }

      const text = await response.text();
      let payload;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch {
        payload = { raw: text };
      }

      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        const retryAfter = Number.parseInt(response.headers.get('Retry-After') || '', 10);
        await wait(Number.isFinite(retryAfter) ? retryAfter * 1000 : 2 ** attempt * 1000);
        continue;
      }

      if (!response.ok) {
        const error = new Error(payload.message || `${response.status} ${response.statusText}`);
        error.status = response.status;
        error.body = payload;
        throw error;
      }

      return payload;
    }

    throw new Error('Notion request retries exhausted');
  }

  async paginate(loadPage) {
    const items = [];
    let cursor;

    for (let page = 0; page < 100; page += 1) {
      const payload = await loadPage(cursor);
      if (!Array.isArray(payload.results)) throw new Error('Invalid Notion response: results must be an array');
      items.push(...payload.results);
      if (!payload.has_more) return items;
      if (!payload.next_cursor) throw new Error('Invalid Notion response: missing pagination cursor');
      cursor = payload.next_cursor;
    }

    throw new Error('Notion pagination exceeded 100 pages');
  }

  queryDatabase(databaseId) {
    const id = databaseId.replace(/-/g, '');
    return this.paginate((cursor) => this.request(`/databases/${id}/query`, {
      method: 'POST',
      body: { page_size: 100, ...(cursor && { start_cursor: cursor }) }
    }));
  }

  getPageBlocks(blockId) {
    const id = blockId.replace(/-/g, '');
    return this.paginate((cursor) => {
      const query = new URLSearchParams({ page_size: '100' });
      if (cursor) query.set('start_cursor', cursor);
      return this.request(`/blocks/${id}/children?${query}`);
    });
  }
}

module.exports = NotionClient;
