/* =========================================================
   Elusive Debug Adapter — Console v1.2
   ========================================================= */

(function () {
  function listenBus(name) {
    ElusiveBus.addEventListener(name, e => {
      console.group("[Elusive Event]");
      console.log("name:", name);
      console.log("what:", e.detail);
      console.groupEnd();
    });
  }

  // UX / intent
  listenBus("landing page viewed");
  listenBus("user clicked primary cta");
  listenBus("user clicked secondary cta");

  // Data adapter lifecycle
  window.addEventListener("elusive:data", e => {
    console.group("[Elusive Data]");
    console.log("event:", e.detail.event);
    console.log("key:", e.detail.key);
    console.log("detail:", e.detail);
    console.groupEnd();
  });

  // Auth decisions
  window.addEventListener("elusive:auth", e => {
    console.group("[Elusive Auth]");
    console.log("event:", e.detail.event);
    console.log("capability:", e.detail.capability);
    console.log("reason:", e.detail.reason);
    console.log("ts:", new Date(e.detail.ts).toISOString());
    console.groupEnd();
  });
})();

