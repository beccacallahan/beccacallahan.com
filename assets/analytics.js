(function () {
  const config = window.BeccaAnalytics || {};

  if (!config.enabled || !config.endpoint) {
    return;
  }

  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") {
    return;
  }

  const endpoint = String(config.endpoint).replace(/\/+$/, "");
  const payload = {
    path: window.location.pathname || "/",
    title: document.title || "",
    referrer: document.referrer || "",
    language: navigator.language || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    screen: {
      width: window.screen ? window.screen.width : 0,
      height: window.screen ? window.screen.height : 0
    },
    viewport: {
      width: window.innerWidth || 0,
      height: window.innerHeight || 0
    }
  };

  const body = JSON.stringify(payload);
  const url = endpoint + "/collect";

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    if (sent) {
      return;
    }
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(function () {});
})();
