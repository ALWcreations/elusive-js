/* elusive-auth.js — frozen v1 */

(() => {
    const TRUSTED_ISSUERS = new Set();
    const REVOKED_CAPS = new Set();

    /* ─────────────────────────────
       Crypto (minimal, pluggable)
       ───────────────────────────── */

    async function hash(obj) {
        const data = new TextEncoder().encode(JSON.stringify(obj));
        const buf = await crypto.subtle.digest("SHA-256", data);
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
    }

    function sign(cap) {
        return hash(cap);
    }

    async function verify(cap) {
        const sig = cap.signature;
        const clone = { ...cap };
        delete clone.signature;
        return sig === await hash(clone);
    }

    /* ─────────────────────────────
       Constraints
       ───────────────────────────── */

    function intersectConstraints(parent, child) {
        return {
            actions: parent.actions.filter(a => child.actions.includes(a)),
            resources: parent.resources.filter(r => child.resources.includes(r)),
            redactions: [...new Set([
                ...(parent.redactions || []),
                ...(child.redactions || [])
            ])]
        };
    }

    /* ─────────────────────────────
       Issuance
       ───────────────────────────── */

    async function issueCapability({
        issuer,
        subject,
        constraints,
        expiresAt,
        delegationDepth = 0,
        delegationRights = false
    }) {
        TRUSTED_ISSUERS.add(issuer);

        const cap = {
            cap_id: crypto.randomUUID(),
            issuer,
            subject,
            parent_cap: null,
            delegation_depth: delegationDepth,
            delegation_rights: delegationRights,
            constraints,
            expires_at: expiresAt,
            issued_at: Date.now()
        };

        cap.signature = await sign(cap);
        emit("capability.issued", cap);
        return cap;
    }

    /* ─────────────────────────────
       Delegation
       ───────────────────────────── */

    async function delegateCapability(parent, delegatee, overrides) {
        if (!parent.delegation_rights) throw "delegation-not-allowed";
        if (parent.delegation_depth <= 0) throw "delegation-depth-exceeded";

        const cap = {
            cap_id: crypto.randomUUID(),
            issuer: parent.issuer,
            subject: delegatee,
            parent_cap: parent.cap_id,
            delegation_depth: parent.delegation_depth - 1,
            delegation_rights: false,
            constraints: intersectConstraints(parent.constraints, overrides.constraints),
            expires_at: Math.min(parent.expires_at, overrides.expires_at),
            issued_at: Date.now()
        };

        cap.signature = await sign(cap);
        emit("capability.delegated", cap);
        return cap;
    }

    /* ─────────────────────────────
       Validation
       ───────────────────────────── */

    async function validateCapability(cap, parentResolver = () => null) {
        if (cap.expires_at < Date.now()) return deny("expired");
        if (REVOKED_CAPS.has(cap.cap_id)) return deny("revoked");
        if (!TRUSTED_ISSUERS.has(cap.issuer)) return deny("untrusted-issuer");
        if (!(await verify(cap))) return deny("invalid-signature");

        if (cap.parent_cap) {
            const parent = parentResolver(cap.parent_cap);
            if (!parent) return deny("missing-parent");
            if (!(await verify(parent))) return deny("invalid-parent");
            if (!parent.delegation_rights) return deny("illegal-delegation");
        }

        emit("capability.validated", cap);
        return allow(cap);
    }

    function allow(cap) {
        return { ok: true, cap };
    }

    function deny(reason) {
        emit("capability.denied", { reason });
        return { ok: false, reason };
    }

    /* ─────────────────────────────
       Revocation
       ───────────────────────────── */

    function revoke(capId) {
        REVOKED_CAPS.add(capId);
        emit("capability.revoked", { cap_id: capId });
    }

    /* ─────────────────────────────
       Telemetry
       ───────────────────────────── */

    function emit(event, detail) {
        window.dispatchEvent(new CustomEvent("elusive:auth", {
            detail: {
                event,
                ...detail,
                ts: Date.now()
            }
        }));
    }

    /* ─────────────────────────────
       Public Surface (Single Global)
       ───────────────────────────── */

    window.ElusiveAuth = Object.freeze({
        issue: issueCapability,
        delegate: delegateCapability,
        validate: validateCapability,
        revoke
    });
})();
