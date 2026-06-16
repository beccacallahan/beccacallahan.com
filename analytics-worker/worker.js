const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname === "/collect") {
        return await collect(request, env, cors);
      }

      if (request.method === "GET" && url.pathname === "/summary") {
        return await summary(request, env, cors);
      }
    } catch (error) {
      return json({ error: "analytics_error" }, 500, cors);
    }

    return json({ error: "not_found" }, 404, cors);
  }
};

async function collect(request, env, cors) {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    return json({ ok: false }, 415, cors);
  }

  const body = await request.json();
  const day = new Date().toISOString().slice(0, 10);
  const userAgent = request.headers.get("User-Agent") || "";

  if (isBot(userAgent)) {
    return json({ ok: true, skipped: "bot" }, 202, cors);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const salt = env.VISITOR_SALT || "";
  if (!salt) {
    return json({ ok: false, error: "analytics_not_configured" }, 503, cors);
  }

  const visitorHash = await sha256([salt, ip, userAgent, day].join(":"));
  const path = normalizePath(body.path);
  const title = cleanText(body.title, 120);
  const referrer = normalizeReferrer(body.referrer);
  const country = cleanText(request.cf && request.cf.country ? request.cf.country : "Unknown", 80);
  const device = detectDevice(userAgent, body.viewport);
  const browser = detectBrowser(userAgent);

  const newVisitor = await env.DB.prepare(
    "INSERT OR IGNORE INTO daily_visitors(day, visitor_hash) VALUES (?, ?)"
  ).bind(day, visitorHash).run();
  const dailyUniqueIncrement = newVisitor.meta && newVisitor.meta.changes ? 1 : 0;
  const dimensionUnique = await uniqueDimensionIncrements(env, day, visitorHash, {
    page: path,
    referrer,
    country,
    device,
    browser
  });

  await env.DB.batch([
    env.DB.prepare("INSERT INTO daily_stats(day, views, unique_visitors) VALUES (?, 1, ?) ON CONFLICT(day) DO UPDATE SET views = views + 1, unique_visitors = unique_visitors + ?")
      .bind(day, dailyUniqueIncrement, dailyUniqueIncrement),
    env.DB.prepare("INSERT INTO page_stats(day, path, title, views, unique_visitors) VALUES (?, ?, ?, 1, ?) ON CONFLICT(day, path) DO UPDATE SET views = views + 1, unique_visitors = unique_visitors + ?, title = excluded.title")
      .bind(day, path, title, dimensionUnique.page, dimensionUnique.page),
    env.DB.prepare("INSERT INTO referrer_stats(day, referrer, views, unique_visitors) VALUES (?, ?, 1, ?) ON CONFLICT(day, referrer) DO UPDATE SET views = views + 1, unique_visitors = unique_visitors + ?")
      .bind(day, referrer, dimensionUnique.referrer, dimensionUnique.referrer),
    env.DB.prepare("INSERT INTO country_stats(day, country, views, unique_visitors) VALUES (?, ?, 1, ?) ON CONFLICT(day, country) DO UPDATE SET views = views + 1, unique_visitors = unique_visitors + ?")
      .bind(day, country, dimensionUnique.country, dimensionUnique.country),
    env.DB.prepare("INSERT INTO device_stats(day, device, views, unique_visitors) VALUES (?, ?, 1, ?) ON CONFLICT(day, device) DO UPDATE SET views = views + 1, unique_visitors = unique_visitors + ?")
      .bind(day, device, dimensionUnique.device, dimensionUnique.device),
    env.DB.prepare("INSERT INTO browser_stats(day, browser, views, unique_visitors) VALUES (?, ?, 1, ?) ON CONFLICT(day, browser) DO UPDATE SET views = views + 1, unique_visitors = unique_visitors + ?")
      .bind(day, browser, dimensionUnique.browser, dimensionUnique.browser)
  ]);

  return json({ ok: true }, 202, cors);
}

async function uniqueDimensionIncrements(env, day, visitorHash, dimensions) {
  const entries = Object.entries(dimensions);
  const results = await env.DB.batch(entries.map(([dimension, label]) => (
    env.DB.prepare(
      "INSERT OR IGNORE INTO daily_dimension_visitors(day, dimension, label, visitor_hash) VALUES (?, ?, ?, ?)"
    ).bind(day, dimension, label, visitorHash)
  )));

  return entries.reduce((increments, [dimension], index) => {
    const result = results[index];
    increments[dimension] = result && result.meta && result.meta.changes ? 1 : 0;
    return increments;
  }, {});
}

async function summary(request, env, cors) {
  if (!isAuthorized(request, env)) {
    return json({ error: "unauthorized" }, 401, cors);
  }

  const today = new Date();
  const day = today.toISOString().slice(0, 10);
  const since7 = offsetDay(today, -6);
  const since30 = offsetDay(today, -29);

  const total = await env.DB.prepare("SELECT COALESCE(SUM(views), 0) AS views, COALESCE(SUM(unique_visitors), 0) AS unique_visitors FROM daily_stats").first();
  const todayRow = await env.DB.prepare("SELECT COALESCE(views, 0) AS views, COALESCE(unique_visitors, 0) AS unique_visitors FROM daily_stats WHERE day = ?").bind(day).first();
  const last7 = await env.DB.prepare("SELECT COALESCE(SUM(views), 0) AS views, COALESCE(SUM(unique_visitors), 0) AS unique_visitors FROM daily_stats WHERE day >= ?").bind(since7).first();
  const last30 = await env.DB.prepare("SELECT COALESCE(SUM(views), 0) AS views, COALESCE(SUM(unique_visitors), 0) AS unique_visitors FROM daily_stats WHERE day >= ?").bind(since30).first();

  const seriesRows = await env.DB.prepare("SELECT day, views, unique_visitors AS uniqueVisitors FROM daily_stats WHERE day >= ? ORDER BY day ASC").bind(since30).all();
  const seriesMap = new Map((seriesRows.results || []).map((row) => [row.day, row]));
  const series = [];
  for (let i = -29; i <= 0; i += 1) {
    const current = offsetDay(today, i);
    const row = seriesMap.get(current);
    series.push({ day: current, views: row ? row.views : 0, uniqueVisitors: row ? row.uniqueVisitors : 0 });
  }

  const data = {
    totals: {
      allViews: total.views || 0,
      allUnique: total.unique_visitors || 0,
      todayViews: todayRow ? todayRow.views : 0,
      todayUnique: todayRow ? todayRow.unique_visitors : 0,
      last7Views: last7.views || 0,
      last7Unique: last7.unique_visitors || 0,
      last30Views: last30.views || 0,
      last30Unique: last30.unique_visitors || 0
    },
    series,
    pages: await topRows(env, "page_stats", "path", since30),
    referrers: await topRows(env, "referrer_stats", "referrer", since30),
    countries: await topRows(env, "country_stats", "country", since30),
    devices: await topRows(env, "device_stats", "device", since30),
    browsers: await topRows(env, "browser_stats", "browser", since30)
  };

  return json(data, 200, cors);
}

async function topRows(env, table, labelColumn, since) {
  const allowed = {
    page_stats: "path",
    referrer_stats: "referrer",
    country_stats: "country",
    device_stats: "device",
    browser_stats: "browser"
  };
  const column = allowed[table];
  if (column !== labelColumn) {
    return [];
  }

  const result = await env.DB.prepare(
    `SELECT ${column} AS label, SUM(views) AS views, SUM(unique_visitors) AS uniqueVisitors FROM ${table} WHERE day >= ? GROUP BY ${column} ORDER BY views DESC LIMIT 10`
  ).bind(since).all();

  return result.results || [];
}

function isAuthorized(request, env) {
  const expected = env.ADMIN_PIN || "";
  const provided = request.headers.get("X-Admin-Code") || "";
  return expected && provided && provided === expected;
}

function corsHeaders(request, env) {
  const origins = String(env.ALLOWED_ORIGINS || "https://www.beccacallahan.com").split(",").map((value) => value.trim()).filter(Boolean);
  const requestOrigin = request.headers.get("Origin") || "";
  const allowedOrigin = origins.includes(requestOrigin) ? requestOrigin : origins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Admin-Code",
    "Vary": "Origin"
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...cors }
  });
}

function normalizePath(value) {
  const path = cleanText(value || "/", 180);
  if (!path || path[0] !== "/") {
    return "/";
  }
  return path.split("?")[0].split("#")[0] || "/";
}

function cleanText(value, maxLength) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeReferrer(value) {
  if (!value) {
    return "Direct";
  }

  try {
    const referrer = new URL(value);
    if (referrer.hostname.includes("beccacallahan.com")) {
      return "Internal";
    }
    return referrer.hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

function detectDevice(userAgent, viewport) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "Tablet";
  }
  if (ua.includes("mobi") || (viewport && Number(viewport.width) < 700)) {
    return "Mobile";
  }
  return "Desktop";
}

function detectBrowser(userAgent) {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent) && !/Chromium/.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari";
  return "Other";
}

function isBot(userAgent) {
  return /bot|crawler|spider|preview|monitor|uptime|curl|wget/i.test(userAgent || "");
}

async function sha256(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function offsetDay(date, offset) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  copy.setUTCDate(copy.getUTCDate() + offset);
  return copy.toISOString().slice(0, 10);
}
