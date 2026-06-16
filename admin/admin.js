(function () {
  const config = window.BeccaAnalytics || {};
  const endpoint = config.endpoint ? String(config.endpoint).replace(/\/+$/, "") : "";
  const login = document.querySelector("[data-admin-login]");
  const form = document.querySelector("[data-login-form]");
  const message = document.querySelector("[data-login-message]");
  const dashboard = document.querySelector("[data-dashboard]");
  const statGrid = document.querySelector("[data-stat-grid]");
  const chart = document.querySelector("[data-chart]");
  const updated = document.querySelector("[data-last-updated]");
  const refreshButton = document.querySelector("[data-refresh]");

  let adminCode = sessionStorage.getItem("beccaAnalyticsAdminCode") || "";

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

    chart.innerHTML = series.map(function (row) {
      const height = Math.max(4, Math.round((Number(row.views || 0) / max) * 100));
      return '<div class="bar-item"><span class="bar" style="height:' + height + '%"></span><small>' + escapeHtml(row.day.slice(5)) + '</small><strong>' + formatNumber(row.views) + '</strong></div>';
    }).join("");
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
      return "<tr><td>" + escapeHtml(row.label || row.path || row.name || "Direct") + "</td><td>" + formatNumber(row.views) + "</td><td>" + formatNumber(row.uniqueVisitors) + "</td></tr>";
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
