// mock-worker.js
import http from "node:http";

const PORT = 8787;

function corsHeaders(extra = {}) {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
        ...extra
    };
}

function applyHeaders(res, headers) {
    for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value);
    }
}

const server = http.createServer((req, res) => {
    /* ---------------------------------------------
       CORS Preflight — HARD TERMINATION
       --------------------------------------------- */
    if (req.method === "OPTIONS") {
        applyHeaders(res, corsHeaders());
        res.statusCode = 204;
        res.end();
        return;
    }

    /* ---------------------------------------------
       Method Guard
       --------------------------------------------- */
    if (req.method !== "POST") {
        applyHeaders(res, corsHeaders());
        res.statusCode = 405;
        res.end();
        return;
    }

    /* ---------------------------------------------
       Route Match
       --------------------------------------------- */
    const match = req.url.match(/^\/__elusive\/data\/(.+)$/);
    if (!match) {
        applyHeaders(res, corsHeaders());
        res.statusCode = 404;
        res.end();
        return;
    }

    const key = match[1];

    /* ---------------------------------------------
       Data Table
       --------------------------------------------- */
    const data = {
        landing: {
            hero: "Build once. Ship pages.",
            primaryCta: "Get Started"
        }
    };

    /* ---------------------------------------------
       Success Response
       --------------------------------------------- */
    applyHeaders(
        res,
        corsHeaders({ "Content-Type": "application/json" })
    );

    res.statusCode = 200;
    res.end(JSON.stringify(data[key] ?? {}));
});

server.listen(PORT, () => {
    console.log(`Mock worker running on http://localhost:${PORT}`);
});
