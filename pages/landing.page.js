/* =========================================================
   Elusive Landing Page — v2
   ========================================================= */
Elusive.page("elusive-landing", page => {

    /* =========================================================
       Page Bootstrap (Explicit, Single-Invocation)
       ========================================================= */
    page.bootstrap = async () => {
        const landingReadCap = await ElusiveAuth.issue({
            issuer: "elusive-core",
            subject: "anonymous",
            constraints: {
                actions: ["read"],
                resources: ["landing"]
            },
            expiresAt: Date.now() + 60 * 60 * 1000,
            delegationDepth: 0
        });

        page.capabilities = {
            landingRead: landingReadCap
        };

        /* =========================================================
           Page Composition
           ========================================================= */
        const {
            hero = "Build once. Ship pages.",
            sub = "Elusive Pages JS",
            primaryCta = "Get Started",
            primaryUrl = "#"
        } = createAttrs(page.attr);

        CreateStyles();

        page.render(() => `
      <section class="elusive-landing">
        <main data-elusive-view-root></main>
      </section>
    `);

        ElusiveViews.define("hero", () => `
      <div class="hero">
        <h1>${hero}</h1>
        <p>${sub}</p>
        <div class="actions">
          <a href="${primaryUrl}" class="primary">${primaryCta}</a>
          <button data-view="data-test" class="secondary">
            Load Data
          </button>
        </div>
      </div>
    `);

        ElusiveViews.define("data-test", async () => {
            const result = await ElusiveData.get("landing", {
                capability: page.capabilities.landingRead
            });

            return `
        <div class="hero">
          <h1>Data Test</h1>
          <pre>${JSON.stringify(result, null, 2)}</pre>
          <button data-view="hero">← Back</button>
        </div>
      `;
        });

        ElusiveViews.bindNavigation();
        ElusiveViews.show("hero");

        /* =========================================================
           Telemetry
           ========================================================= */
        page.on("click", "a.primary", () => {
            page.emit("user clicked primary cta", { location: "hero" });
        });

        page.when("view changed", ({ view }) => {
            if (view === "data-test") {
                page.emit("data requested", {
                    source: "landing",
                    key: "landing"
                });
            }
        });

        if (!sessionStorage.__landingViewed) {
            sessionStorage.__landingViewed = "1";
            page.emit("landing page viewed", {
                component: "elusive-landing"
            });
        }
    };

    /* =========================================================
       Single Invocation (Lifecycle-Owned)
       ========================================================= */
    page.bootstrap();
});


/* =========================================================
   Page Utilities (Page-Owned)
   ========================================================= */
function CreateStyles() {
    if (document.getElementById("elusive-landing-styles")) return;

    const style = document.createElement("style");
    style.id = "elusive-landing-styles";
    style.textContent = `
    elusive-landing {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .elusive-landing .hero {
      max-width: 720px;
      margin: 6rem auto;
      padding: 0 1.5rem;
      text-align: center;
    }

    .elusive-landing h1 {
      font-size: 3rem;
      line-height: 1.1;
      margin-bottom: 1rem;
    }

    .elusive-landing p {
      font-size: 1.25rem;
      opacity: 0.85;
      margin-bottom: 2rem;
    }

    .elusive-landing .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .elusive-landing a,
    .elusive-landing button {
      padding: 0.75rem 1.25rem;
      border-radius: 6px;
      font-weight: 500;
    }

    .elusive-landing a.primary {
      background: #000;
      color: #fff;
      text-decoration: none;
    }

    .elusive-landing button.secondary {
      border: 1px solid #ccc;
      background: transparent;
      cursor: pointer;
    }
  `;
    document.head.appendChild(style);
}

function createAttrs(attrs) {
    const out = {};
    for (const key in attrs) {
        out[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = attrs[key];
    }
    return out;
}
