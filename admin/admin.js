(function () {
  const config = window.BeccaAnalytics || {};
  const endpoint = config.endpoint ? String(config.endpoint).replace(/\/+$/, "") : "";
  const login = document.querySelector("[data-admin-login]");
  const form = document.querySelector("[data-login-form]");
  const message = document.querySelector("[data-login-message]");
  const dashboard = document.querySelector("[data-dashboard]");
  const statGrid = document.querySelector("[data-stat-grid]");
  const chart = document.querySelector("[data-chart]");
  const map = document.querySelector("[data-map]");
  const updated = document.querySelector("[data-last-updated]");
  const refreshButton = document.querySelector("[data-refresh]");

  let adminCode = sessionStorage.getItem("beccaAnalyticsAdminCode") || "";
  const decorativeMapPoints = {
    AE: [64.2, 57.1],
    AF: [64.4, 51.4],
    AR: [29.2, 78.3],
    AT: [52.0, 45.0],
    AU: [78.3, 74.6],
    BD: [69.2, 58.0],
    BE: [49.5, 43.5],
    BR: [31.5, 67.2],
    CA: [22.8, 35.5],
    CH: [50.5, 45.2],
    CL: [27.1, 75.0],
    CN: [71.8, 44.2],
    CO: [29.8, 59.1],
    CR: [25.9, 56.1],
    CU: [27.4, 52.3],
    CZ: [52.3, 43.4],
    DE: [50.9, 42.6],
    DK: [51.0, 39.1],
    DO: [30.6, 52.8],
    DZ: [52.0, 56.1],
    EC: [27.5, 60.6],
    EG: [58.3, 55.4],
    ES: [46.8, 49.2],
    ET: [60.1, 63.2],
    FI: [55.5, 34.2],
    FR: [49.3, 46.1],
    GB: [46.1, 39.9],
    GH: [52.0, 64.1],
    GR: [55.0, 51.0],
    GT: [23.9, 55.2],
    HK: [75.4, 55.0],
    ID: [76.0, 68.0],
    IE: [44.7, 40.8],
    IL: [57.1, 54.2],
    IN: [65.2, 56.2],
    IR: [61.1, 52.0],
    IT: [52.0, 48.3],
    JP: [83.8, 48.0],
    KE: [60.2, 68.0],
    KH: [73.1, 62.0],
    KR: [80.3, 48.0],
    KZ: [66.0, 42.3],
    LK: [66.0, 64.2],
    MA: [48.5, 54.5],
    MM: [71.3, 58.2],
    MX: [21.6, 52.1],
    MY: [73.3, 64.3],
    NG: [54.0, 64.0],
    NL: [49.9, 42.5],
    NO: [50.5, 33.0],
    NP: [68.0, 53.3],
    NZ: [78.4, 83.1],
    PE: [28.2, 65.2],
    PH: [78.0, 62.0],
    PK: [63.1, 53.0],
    PL: [53.3, 42.6],
    PT: [45.5, 50.0],
    QA: [63.4, 56.0],
    RU: [70.0, 37.2],
    SA: [60.0, 57.2],
    SE: [52.5, 35.0],
    SG: [74.0, 66.0],
    TH: [72.0, 61.0],
    TR: [57.0, 50.0],
    TW: [77.8, 54.3],
    TZ: [61.0, 71.0],
    UA: [57.0, 44.0],
    US: [22.3, 44.5],
    UY: [33.2, 76.3],
    VE: [31.0, 58.0],
    VN: [74.0, 61.0],
    ZA: [55.8, 76.0]
  };
  const countryPoints = {
    AD: [1.6, 42.5], AE: [54.4, 24.4], AF: [67.7, 33.9], AG: [-61.8, 17.1], AL: [20.2, 41.2], AM: [45.0, 40.1],
    AO: [17.9, -11.2], AR: [-63.6, -38.4], AT: [14.6, 47.5], AU: [133.8, -25.3], AZ: [47.6, 40.1], BA: [17.7, 43.9],
    BB: [-59.5, 13.2], BD: [90.4, 23.7], BE: [4.5, 50.5], BF: [-1.6, 12.2], BG: [25.5, 42.7], BH: [50.6, 26.1],
    BI: [29.9, -3.4], BJ: [2.3, 9.3], BN: [114.7, 4.5], BO: [-63.6, -16.3], BR: [-51.9, -14.2], BS: [-77.4, 25.0],
    BT: [90.4, 27.5], BW: [24.7, -22.3], BY: [27.9, 53.7], BZ: [-88.5, 17.2], CA: [-106.3, 56.1], CD: [21.8, -4.0],
    CF: [20.9, 6.6], CG: [15.8, -0.2], CH: [8.2, 46.8], CI: [-5.5, 7.5], CL: [-71.5, -35.7], CM: [12.4, 7.4],
    CN: [104.2, 35.9], CO: [-74.3, 4.6], CR: [-84.0, 9.7], CU: [-77.8, 21.5], CV: [-23.6, 16.0], CY: [33.4, 35.1],
    CZ: [15.5, 49.8], DE: [10.5, 51.2], DJ: [42.6, 11.8], DK: [9.5, 56.3], DO: [-70.2, 18.7], DZ: [1.7, 28.0],
    EC: [-78.2, -1.8], EE: [25.0, 58.6], EG: [30.8, 26.8], ER: [39.8, 15.2], ES: [-3.7, 40.4], ET: [40.5, 9.1],
    FI: [25.7, 61.9], FJ: [178.1, -17.7], FR: [2.2, 46.2], GA: [11.6, -0.8], GB: [-3.4, 55.4], GD: [-61.7, 12.1],
    GE: [43.4, 42.3], GH: [-1.0, 7.9], GM: [-15.3, 13.4], GN: [-9.7, 9.9], GQ: [10.3, 1.7], GR: [21.8, 39.1],
    GT: [-90.2, 15.8], GY: [-58.9, 5.0], HN: [-86.2, 15.2], HR: [15.2, 45.1], HT: [-72.3, 19.0], HU: [19.5, 47.2],
    ID: [113.9, -0.8], IE: [-8.2, 53.4], IL: [34.9, 31.0], IN: [78.9, 20.6], IQ: [43.7, 33.2], IR: [53.7, 32.4],
    IS: [-19.0, 64.9], IT: [12.6, 41.9], JM: [-77.3, 18.1], JO: [36.2, 30.6], JP: [138.3, 36.2], KE: [37.9, -0.0],
    KG: [74.8, 41.2], KH: [104.9, 12.6], KR: [127.8, 35.9], KW: [47.5, 29.3], KZ: [66.9, 48.0], LA: [102.5, 19.9],
    LB: [35.9, 33.9], LK: [80.8, 7.9], LR: [-9.4, 6.4], LS: [28.2, -29.6], LT: [23.9, 55.2], LU: [6.1, 49.8],
    LV: [24.6, 56.9], LY: [17.2, 26.3], MA: [-7.1, 31.8], MD: [28.4, 47.4], ME: [19.4, 42.7], MG: [46.9, -18.8],
    MK: [21.7, 41.6], ML: [-4.0, 17.6], MM: [95.9, 21.9], MN: [103.8, 46.9], MR: [-10.9, 21.0], MT: [14.4, 35.9],
    MU: [57.6, -20.3], MV: [73.2, 3.2], MW: [34.3, -13.3], MX: [-102.6, 23.6], MY: [101.9, 4.2], MZ: [35.5, -18.7],
    NA: [18.5, -22.9], NE: [8.1, 17.6], NG: [8.7, 9.1], NI: [-85.2, 12.9], NL: [5.3, 52.1], NO: [8.5, 60.5],
    NP: [84.1, 28.4], NZ: [174.9, -40.9], OM: [55.9, 21.5], PA: [-80.8, 8.5], PE: [-75.0, -9.2], PG: [143.9, -6.3],
    PH: [122.9, 12.9], PK: [69.3, 30.4], PL: [19.1, 51.9], PT: [-8.2, 39.4], PY: [-58.4, -23.4], QA: [51.2, 25.4],
    RO: [24.9, 45.9], RS: [21.0, 44.0], RU: [90.0, 61.5], RW: [29.9, -1.9], SA: [45.1, 23.9], SB: [160.2, -9.6],
    SC: [55.5, -4.7], SD: [30.2, 12.9], SE: [18.6, 60.1], SG: [103.8, 1.4], SI: [14.9, 46.2], SK: [19.7, 48.7],
    SL: [-11.8, 8.5], SN: [-14.5, 14.5], SO: [46.2, 5.2], SR: [-56.0, 4.1], SS: [31.3, 6.9], SV: [-88.9, 13.8],
    SY: [38.9, 34.8], SZ: [31.5, -26.5], TD: [18.7, 15.5], TG: [0.8, 8.6], TH: [100.9, 15.9], TJ: [71.3, 38.9],
    TL: [125.7, -8.9], TN: [9.5, 33.9], TR: [35.2, 39.0], TT: [-61.2, 10.7], TW: [120.9, 23.7], TZ: [34.9, -6.4],
    UA: [31.2, 48.4], UG: [32.3, 1.4], US: [-98.6, 39.8], UY: [-55.8, -32.5], UZ: [64.6, 41.4], VE: [-66.6, 6.4],
    VN: [108.3, 14.1], VU: [166.9, -15.4], WS: [-172.1, -13.8], YE: [48.5, 15.6], ZA: [22.9, -30.6], ZM: [27.8, -13.1],
    ZW: [29.2, -19.0]
  };

  function setMessage(text) {
    if (message) {
      message.textContent = text || "";
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function countryName(code) {
    const value = String(code || "").toUpperCase();
    if (!value || value === "UNKNOWN") {
      return "Unknown";
    }

    try {
      if (Intl.DisplayNames) {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(value) || value;
      }
    } catch {}

    return value;
  }

  function renderStats(data) {
    const totals = data.totals || {};
    const cards = [
      ["All Views", totals.allViews],
      ["All Visitors", totals.allUnique],
      ["Today", totals.todayViews],
      ["Last 7 Days", totals.last7Views],
      ["Last 30 Days", totals.last30Views],
      ["30-Day Visitors", totals.last30Unique]
    ];

    statGrid.innerHTML = cards.map(function (card) {
      return '<article class="stat-card"><span>' + escapeHtml(card[0]) + '</span><strong>' + formatNumber(card[1]) + "</strong></article>";
    }).join("");
  }

  function renderChart(rows) {
    const series = rows || [];
    const max = Math.max(1, ...series.map(function (row) { return Number(row.views || 0); }));
    const total = series.reduce(function (sum, row) { return sum + Number(row.views || 0); }, 0);

    chart.innerHTML = series.map(function (row) {
      const height = Math.max(4, Math.round((Number(row.views || 0) / max) * 100));
      return '<div class="bar-item" title="' + escapeHtml(row.day + ": " + formatNumber(row.views) + " views") + '"><span class="bar" style="height:' + height + '%"></span><small>' + escapeHtml(row.day.slice(5)) + '</small><strong>' + formatNumber(row.views) + '</strong></div>';
    }).join("") + '<p class="chart-total">' + formatNumber(total) + ' views in this 30-day window</p>';
  }

  function mapPosition(code, point) {
    if (decorativeMapPoints[code]) {
      return decorativeMapPoints[code];
    }

    const left = clamp(4 + (((point[0] + 180) / 360) * 88), 6, 93);
    const top = clamp(29 + (((90 - point[1]) / 180) * 54), 31, 84);

    return [left, top];
  }

  function renderMap(rows) {
    if (!map) {
      return;
    }

    const countries = rows || [];
    const max = Math.max(1, ...countries.map(function (row) { return Number(row.views || 0); }));
    const markers = countries.map(function (row) {
      const code = String(row.label || "").toUpperCase();
      const point = countryPoints[code];
      if (!point) {
        return "";
      }

      const position = mapPosition(code, point);
      const left = position[0];
      const top = position[1];
      const size = 10 + Math.round((Number(row.views || 0) / max) * 18);
      const label = countryName(code) + ": " + formatNumber(row.views) + " views";
      return '<span class="map-marker" style="left:' + left.toFixed(2) + '%; top:' + top.toFixed(2) + '%; --marker-size:' + size + 'px" title="' + escapeHtml(label) + '"><span>' + escapeHtml(formatNumber(row.views)) + '</span></span>';
    }).join("");

    const list = countries.length ? countries.slice(0, 6).map(function (row) {
      return '<li><span>' + escapeHtml(countryName(row.label)) + '</span><strong>' + formatNumber(row.views) + '</strong></li>';
    }).join("") : '<li><span>No location data yet</span><strong>0</strong></li>';

    map.innerHTML = '<div class="map-canvas"><img class="world-map-art" src="../assets/becca-callahan-world-map.webp" alt="" aria-hidden="true">' + markers + '</div><ul class="map-list">' + list + '</ul>';
  }

  function renderTable(name, rows) {
    const target = document.querySelector('[data-table="' + name + '"]');
    if (!target) {
      return;
    }

    if (!rows || !rows.length) {
      target.innerHTML = '<p class="form-note">No data yet.</p>';
      return;
    }

    target.innerHTML = '<table class="analytics-table"><thead><tr><th>Name</th><th>Views</th><th>Visitors</th></tr></thead><tbody>' + rows.map(function (row) {
      const label = name === "countries" ? countryName(row.label) : row.label || row.path || row.name || "Direct";
      return "<tr><td>" + escapeHtml(label) + "</td><td>" + formatNumber(row.views) + "</td><td>" + formatNumber(row.uniqueVisitors) + "</td></tr>";
    }).join("") + "</tbody></table>";
  }

  async function loadDashboard() {
    if (!endpoint) {
      setMessage("Analytics is not connected yet. Add the Cloudflare Worker URL in assets/analytics-config.js after deployment.");
      return;
    }

    setMessage("Loading visitor data...");

    const response = await fetch(endpoint + "/summary", {
      headers: { "X-Admin-Code": adminCode }
    });

    if (response.status === 401) {
      sessionStorage.removeItem("beccaAnalyticsAdminCode");
      setMessage("That admin code was not accepted.");
      login.hidden = false;
      dashboard.hidden = true;
      return;
    }

    if (!response.ok) {
      setMessage("Visitor data could not be loaded yet.");
      return;
    }

    const data = await response.json();
    login.hidden = true;
    dashboard.hidden = false;
    setMessage("");
    updated.textContent = "Last updated " + new Date().toLocaleString();

    renderStats(data);
    renderChart(data.series);
    renderMap(data.countries);
    renderTable("pages", data.pages);
    renderTable("referrers", data.referrers);
    renderTable("countries", data.countries);
    renderTable("devices", data.devices);
    renderTable("browsers", data.browsers);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = new FormData(form).get("code");
      adminCode = String(value || "").trim();
      sessionStorage.setItem("beccaAnalyticsAdminCode", adminCode);
      loadDashboard().catch(function () {
        setMessage("Visitor data could not be loaded yet.");
      });
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", function () {
      loadDashboard().catch(function () {
        setMessage("Visitor data could not be refreshed yet.");
      });
    });
  }

  if (adminCode && endpoint) {
    loadDashboard().catch(function () {
      setMessage("Visitor data could not be loaded yet.");
    });
  } else if (!endpoint) {
    setMessage("Analytics is not connected yet. Add the Cloudflare Worker URL in assets/analytics-config.js after deployment.");
  }
})();
