/* =========================================================
   Elusive Pages JS — Runtime v1 (FROZEN)
   ========================================================= */
(() => {
    const registry = new Map();
    const bus = new EventTarget();
    window.ElusiveBus = bus;

    function saveAttributes(el) {
        const attrs = {};
        for (const attr of el.attributes) {
            attrs[attr.name] = attr.value;
        }
        return Object.freeze(attrs);
    }

    function createPageObject(el) {
        return {
            el,
            attr: saveAttributes(el),

            render(view) {
                el.innerHTML = view();
            },

            on(event, selector, respond) {
                el.addEventListener(event, e => {
                    const target = e.target.closest(selector);
                    if (target && el.contains(target)) {
                        respond(e);
                    }
                });
            },

            emit(happened, details) {
                bus.dispatchEvent(
                    new CustomEvent(happened, { detail: details })
                );
            },

            listen(happened, respond) {
                bus.addEventListener(happened, e => respond(e.detail));
            },

            notify(happened, details) {
                this.emit(happened, details);
            },

            when(happened, respond) {
                this.listen(happened, respond);
            }
        };
    }

    window.Elusive = {
        page(name, factory) {
            if (registry.has(name)) return;

            class ElusivePage extends HTMLElement {
                connectedCallback() {
                    if (this.__mounted) return;
                    this.__mounted = true;

                    const page = createPageObject(this);
                    this.page = page;

                    factory(page);
                }
            }

            customElements.define(name, ElusivePage);
            registry.set(name, factory);
        }
    };
})();
