#!/usr/bin/env node

import fs from "fs";
import path from "path";

const MANIFEST_PATH = path.resolve("events.manifest.json");
const SRC_DIR = path.resolve(".");

/* ---------------------------------------------
   Load Manifest
--------------------------------------------- */

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error("❌ Missing events.manifest.json");
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(MANIFEST_PATH, "utf8")
);

const knownEvents = new Set(Object.keys(manifest));

/* ---------------------------------------------
   Scan Source for emit("...")
--------------------------------------------- */

const emitRegex = /emit\s*\(\s*["'`]([^"'`]+)["'`]/g;
const foundEvents = new Set();

function scan(file) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = emitRegex.exec(content))) {
    foundEvents.add(match[1]);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".")) continue;
      walk(full);
    } else if (entry.endsWith(".js")) {
      scan(full);
    }
  }
}

walk(SRC_DIR);

/* ---------------------------------------------
   Validate
--------------------------------------------- */

let failed = false;

for (const event of foundEvents) {
  if (!knownEvents.has(event)) {
    console.error(`❌ Unknown event emitted: "${event}"`);
    failed = true;
  }
}

if (failed) {
  console.error("\n🚫 Event contract violation.");
  console.error("Add missing events to events.manifest.json");
  process.exit(1);
}

console.log("✅ Event manifest check passed.");