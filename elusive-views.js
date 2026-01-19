/* =========================================================
   Elusive Views — Frozen Runtime Helper v1
   RFC-0004: Page Views
   ---------------------------------------------------------
   • Single global script
   • No imports
   • No endpoint knowledge
   • Emits intent only
   • Adapter-owned delivery
   • Idempotent
   ========================================================= */

(() => {
    if (window.__ELUSIVE_VIEWS__) return;
    window.__ELUSIVE_VIEWS__ = true;

    /* ---------------------------------------------
       Guard: ElusiveBus must exist
       --------------------------------------------- */
    const bus = window.ElusiveBus;
    if (!bus) {
        console.warn("[Elusive Views] ElusiveBus not found");
        return;
    }

    /* ---------------------------------------------
       Internal View Registry
       --------------------------------------------- */
    const views = Object.create(null);
    let activeView = null;

    /* ---------------------------------------------
       Internal Emit Helper (Bus Only)
       --------------------------------------------- */
    function emit(name, detail = {}) {
        bus.dispatchEvent(
            new CustomEvent(name, { detail })
        );
    }

    /* ---------------------------------------------
       Public API
       --------------------------------------------- */
    class ElusiveViews {
        /**
         * Register a logical view
         */
        static define(name, render) {
            views[name] = render;
        }

        /**
         * Activate a view
         */
        static async show(name, data = {}) {
            const render = views[name];
            if (!render) return;

            activeView = name;

            const root =
                document.querySelector("[data-elusive-view-root]") ||
                document.body;

            const output = render(data);
            const html = output instanceof Promise ? await output : output;

            if (typeof html !== "string") {
                throw new Error("[ElusiveViews] View must return HTML string");
            }

            root.innerHTML = html;

            emit("view changed", {
                view: name,
                data
            });
        }


        /**
         * Dataset-driven navigation
         * <button data-view="pricing" data-page="2">
         */
        static bindNavigation(selector = "[data-view]") {
            document.addEventListener("click", e => {
                const target = e.target.closest(selector);
                if (!target) return;

                const { view, ...payload } = target.dataset;
                ElusiveViews.show(view, payload);
            });
        }

        /**
         * Read-only active view
         */
        static get active() {
            return activeView;
        }
    }

    /* ---------------------------------------------
       Declarative Page View Element
       --------------------------------------------- */
    class ElusiveView extends HTMLElement {
        connectedCallback() {
            emit("page viewed", {
                view: this.getAttribute("name") || "default"
            });
        }
    }

    if (!customElements.get("elusive-view")) {
        customElements.define("elusive-view", ElusiveView);
    }

    /* ---------------------------------------------
       Automatic Page View (Once per session)
       --------------------------------------------- */
    if (!sessionStorage.__elusive_page_viewed) {
        sessionStorage.__elusive_page_viewed = "1";
        emit("page viewed", {});
    }

    /* ---------------------------------------------
       Minimal Global Exposure
       --------------------------------------------- */
    window.ElusiveViews = ElusiveViews;
})();
