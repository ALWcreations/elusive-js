/* =========================================================
   Elusive Adapter — Beacon Transport (Concept Test)
   ========================================================= */

(function () {
  if (!window.ElusiveBus) {
    console.warn("[Elusive Adapter] Bus not found");
    return;
  }

  // persistent inspection buffer
  const store = [];
  window.ElusiveEvents = store;

  // noop endpoint (can be replaced later)
  const ENDPOINT = "https://elusive-ingest.aaronwilson2348.workers.dev";

  function deliver(entry) {
    try {
      navigator.sendBeacon(ENDPOINT, JSON.stringify(entry));
    } catch (_) {
      /* noop */
    }
  }


  function listen(eventName) {
    ElusiveBus.addEventListener(eventName, e => {
      const entry = {
        name: eventName,
        what: e.detail || {},
        when: new Date().toISOString(),
        where: location.pathname
      };

      store.push(entry);
      console.log("[Elusive Event]", entry);
      deliver(entry);
    });
  }

  // explicit contract listeners
  listen("landing page viewed");
  listen("user clicked primary cta");
  listen("user clicked secondary cta");
})();
