/* =========================================================
   Elusive Data — Frozen v1
   RFC-0005: Data Access
   ---------------------------------------------------------
   • Single global script
   • No auth
   • No runtime coupling
   • Intent-based data access
   ========================================================= */

(() => {
    if (window.__ELUSIVE_DATA__) return;
    window.__ELUSIVE_DATA__ = true;

    const cache = Object.create(null);

    class ElusiveData {
        /* Request data by key */
        static async get(key, params = {}) {
            const cacheKey = key + JSON.stringify(params);

            if (cache[cacheKey]) {
                return cache[cacheKey];
            }

            const response = await fetch(`/__elusive/data/${key}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(params)
            });

            const data = await response.json();
            cache[cacheKey] = data;

            return data;
        }

        /* Clear local cache (optional) */
        static clear(key) {
            if (!key) {
                for (const k in cache) delete cache[k];
            } else {
                for (const k in cache) {
                    if (k.startsWith(key)) delete cache[k];
                }
            }
        }
    }

    window.ElusiveData = ElusiveData;
})();
