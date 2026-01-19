# Elusive JS

<p align="center">
  <img src="./assets/elusive-logo.png" alt="Elusive JS Logo" width="180" />
</p>

<p align="center">
  <strong>Build once. Ship pages.</strong><br/>
  A modular, capability-driven runtime for declarative web pages.
</p>

---

## Overview

**Elusive JS** is a lightweight, runtime-first page framework designed around
explicit contracts, capability-based data access, and deterministic execution.

It separates **infrastructure** from **pages**, enabling clean composition,
strong observability, and long-term architectural stability.

This project prioritizes:

* Explicit lifecycle boundaries
* Zero hidden globals
* Telemetry as a first-class concern
* Browser-native primitives
* Minimal abstractions with maximum leverage

---

## Core Concepts

### Runtime

The runtime is responsible for:

* Custom element registration
* Page lifecycle wiring
* Event bus initialization
* Global orchestration

It is loaded once and shared across all pages.

### Pages

Pages are **pure modules** that define:

* Capabilities
* Views
* User intent
* Telemetry signals

They do not own infrastructure.

### Capabilities

All data access is gated through **issued capabilities** with:

* Explicit scope
* Time-bound expiration
* Auditable intent

No capability, no data.

---

## Project Structure

```
elusive-js/
├─ elusive-runtime.js
├─ elusive-views.js
├─ elusive-auth.js
├─ elusive-data-adapter.js
├─ pages/
│  └─ landing.page.js
├─ utility/
│  ├─ mock-worker.js
│  └─ check-events.js
├─ index.html
└─ README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ALWcreations/elusive-js.git
cd elusive-js
```

### 2. Start the mock data worker

```bash
node utility/mock-worker.js
```

Expected output:

```
Mock worker running on http://localhost:8787
```

### 3. Serve the project

Use any static server (Live Server, serve, etc.):

```bash
npx serve .
```

Open the provided local URL in your browser.

---

## Design Philosophy

Elusive JS follows a strict separation of concerns:

* **Runtime = infrastructure**
* **Pages = intent**
* **Adapters = policy**
* **Browser = enforcement**

If something feels implicit, it is considered a bug.

---

## Status

* Version: **v0.1.0**
* Stability: Experimental
* RFCs: In progress

This project is under active development.

---

## License

MIT
