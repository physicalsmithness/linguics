#!/usr/bin/env node
/* No-network integration check: every expectation case can build the exact
   client context and then the worker's compact legend without contradiction. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { buildMarkerPromptContext } from "../worker/src/marker_contract.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const data = path.join(root, "data");
const read = name => JSON.parse(fs.readFileSync(path.join(data, name), "utf8"));

globalThis.window = globalThis;
globalThis.LL = {};
const require = createRequire(import.meta.url);
require(path.join(root, "housing", "js", "translation_marker.js"));

const manifest = read("manifest.json");
const byBucket = {};
const byItem = {};
for (const topic of manifest.topics || []) {
  const bucketFile = path.join(data, "buckets", topic + ".json");
  if (fs.existsSync(bucketFile)) {
    for (const bucket of JSON.parse(fs.readFileSync(bucketFile, "utf8"))) {
      if (bucket && bucket.id) byBucket[bucket.id] = bucket;
    }
  }
  const itemFile = path.join(data, "translation_items_" + topic + ".json");
  if (fs.existsSync(itemFile)) {
    for (const item of JSON.parse(fs.readFileSync(itemFile, "utf8"))) {
      const id = item.external_id || item.id;
      if (id) byItem[id] = item;
    }
  }
}

LL.markerMenu = read("translation_marker_bucket_menu.json");
LL.bucketsById = byBucket;
LL.indexEntries(read("vocabulary_it_frequency.json"));
const suite = read("marker_expectation_cases.json");
const failures = [];

for (const caseDef of suite.cases) {
  const item = byItem[caseDef.item];
  if (!item) {
    failures.push(caseDef.case_id + ": item not found");
    continue;
  }
  try {
    const bucketContext = LL.buildBucketContext(item, byBucket, { menuMode: "none" });
    const context = buildMarkerPromptContext({
      item,
      cleanedRaw: caseDef.answer,
      bucketContext,
      direction: LL.inferDirection(item),
    });
    const fireable = new Set(context.legend.map(entry => entry.id));
    for (const bucket of Object.keys(caseDef.expect_verdict || {})) {
      if (!fireable.has(bucket) && !(context.direction === "en_it" && bucket.startsWith("vocabulary.it."))) {
        failures.push(caseDef.case_id + ": positive bucket is not fireable: " + bucket);
      }
    }
  } catch (error) {
    failures.push(caseDef.case_id + ": " + (error && error.message ? error.message : String(error)));
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("marker corpus contract passed: " + suite.cases.length + " cases are fireable");
