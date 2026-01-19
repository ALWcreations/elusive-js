/* =========================================================
   Elusive Data Adapter — v1.2 (AUTH-AWARE)
   ========================================================= */
(() => {
  if (window.ElusiveData) return;

  const BASE = "http://localhost:8787/__elusive/data";

  async function authorize(capability, key) {
    if (!capability) return;

    if (!window.ElusiveAuth?.validate) {
      throw new Error("[ElusiveData] Auth runtime missing");
    }

    const result = await ElusiveAuth.validate(capability);

    if (!result.ok) {
      window.dispatchEvent(new CustomEvent("elusive:data", {
        detail: {
          event: "data.denied",
          key,
          reason: result.reason,
          ts: Date.now()
        }
      }));
      throw new Error("Capability denied");
    }
  }

  async function fetchJSON(url, payload) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`[ElusiveData] HTTP ${res.status}`);
    }

    const data = await res.json();

    if (data instanceof Promise) {
      throw new Error("[ElusiveData] Adapter resolved to Promise");
    }

    return data;
  }

  window.ElusiveData = Object.freeze({
    async get(key, payload = {}) {
      if (!key || typeof key !== "string") {
        throw new Error("[ElusiveData] Invalid key");
      }

      const { capability, ...body } = payload;

      await authorize(capability, key);

      window.dispatchEvent(new CustomEvent("elusive:data", {
        detail: {
          event: "data.requested",
          key,
          ts: Date.now()
        }
      }));

      return fetchJSON(`${BASE}/${key}`, body);
    }
  });
})();
