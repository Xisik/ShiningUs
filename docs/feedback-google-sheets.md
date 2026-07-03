# Feedback Google Sheets Integration

This site is deployed as static GitHub Pages, so feedback submissions go through a Cloudflare Worker. The browser never receives Google credentials.

## Sheet Setup

1. Open the target spreadsheet:
   `https://docs.google.com/spreadsheets/d/1m32msKTv3uKjNA1IB5ngKolPDvINZiAB5jNGMlQVsOw/edit`
2. Create a tab named `Feedback`.
3. Add this header row:

   ```text
   submittedAt | type | message
   ```

## Google Cloud Setup

1. Create or open a Google Cloud project.
2. Enable `Google Sheets API`.
3. Create a service account.
4. Create a JSON key for that service account.
5. Share the spreadsheet with the service account email as `Editor`.

Use these JSON fields for Cloudflare secrets:

- `client_email` -> `GOOGLE_CLIENT_EMAIL`
- `private_key` -> `GOOGLE_PRIVATE_KEY`

## Cloudflare Worker Setup

1. Copy `workers/wrangler.toml.example` to `workers/wrangler.toml`.
2. Set `ALLOWED_ORIGIN` to the production site origin, for example:

   ```toml
   ALLOWED_ORIGIN = "https://example.com"
   ```

3. Set secrets from the `workers` directory:

   ```bash
   npx wrangler secret put GOOGLE_CLIENT_EMAIL
   npx wrangler secret put GOOGLE_PRIVATE_KEY
   ```

4. Deploy the Worker:

   ```bash
   cd workers
   npx wrangler deploy
   ```

5. Confirm the endpoint URL. The feedback page expects:

   ```text
   https://<worker-domain>/feedback
   ```

## Frontend Setup

Set this GitHub repository variable for the Pages build:

```text
VITE_FEEDBACK_ENDPOINT=https://<worker-domain>/feedback
```

For local development, create `.env.local`:

```text
VITE_FEEDBACK_ENDPOINT=https://<worker-domain>/feedback
```

If `VITE_FEEDBACK_ENDPOINT` is missing, the feedback page is visible but the submit button stays disabled.

## Payload And Stored Data

The frontend sends:

```json
{
  "type": "siteError",
  "message": "Example feedback message"
}
```

Allowed `type` values:

- `siteError`
- `contentFix`
- `accessibility`
- `other`

The Worker stores only:

- ISO submission time
- feedback type
- feedback message

It does not store name, email, page path, browser details, or IP in the spreadsheet.
