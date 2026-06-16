# Visitor Analytics Setup

This site is hosted on GitHub Pages, so the public website cannot securely store visitor data by itself. The included analytics setup uses a small Cloudflare Worker plus D1 database.

What it tracks:

- Page views by day.
- Approximate daily unique visitors.
- Top pages.
- Referrers.
- Countries from Cloudflare request metadata.
- Device type and browser.

What it avoids:

- No raw IP address is stored.
- No cookies are set.
- No fake dashboard data is shown.
- The admin code is not stored in GitHub Pages JavaScript.

## 1. Create the free Cloudflare storage

Install Wrangler if needed:

```powershell
npm install -g wrangler
wrangler login
```

Create a D1 database:

```powershell
wrangler d1 create becca_analytics
```

This deployment already includes `analytics-worker/wrangler.toml`. If you ever recreate the database, paste the new D1 `database_id` into that file.

Apply the schema:

```powershell
cd analytics-worker
wrangler d1 execute becca_analytics --remote --file schema.sql
```

## 2. Set the private admin secrets

Set the private admin code:

```powershell
wrangler secret put ADMIN_PIN
```

When prompted, enter the admin code chosen for the site. Keep the real code out of committed files because this repository is public.

Set a random visitor salt so daily unique visitor hashes cannot be recreated from the repo:

```powershell
wrangler secret put VISITOR_SALT
```

Use a long random phrase.

## 3. Deploy the Worker

From `analytics-worker`:

```powershell
wrangler deploy
```

The deployed Worker URL is:

```text
https://becca-analytics.nick-df1.workers.dev
```

## 4. Connect the website

Edit `assets/analytics-config.js`:

```js
window.BeccaAnalytics = {
  endpoint: "https://becca-analytics.nick-df1.workers.dev",
  enabled: true
};
```

Commit and push that change. The public pages will then begin sending lightweight aggregate visit data.

## 5. View stats

Open:

```text
https://www.beccacallahan.com/admin/
```

Enter the private admin code.

If the code is changed later, update the Cloudflare Worker secret only. Do not put the real code in public JavaScript.
