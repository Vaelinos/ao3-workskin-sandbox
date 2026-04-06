import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const BANNED_TAG = "Pesterlog(s) (Homestuck)";

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("index Additional Tags default value does not contain banned tag", () => {
  const html = readProjectFile("index.html");
  const additionalTagsInputMatch = html.match(
    /<input[^>]*id="work_freeform_string"[^>]*value="([^"]*)"/i
  );

  assert.ok(additionalTagsInputMatch, "Expected Additional Tags input with default value");
  assert.equal(
    additionalTagsInputMatch[1].includes(BANNED_TAG),
    false,
    "Default Additional Tags value must not include banned tag"
  );
});

test("preview fallback Additional Tags list does not contain banned tag", () => {
  const html = readProjectFile("chapter-preview.html");
  const listMatch = html.match(
    /<ul[^>]*id="previewFreeformList"[^>]*>([\s\S]*?)<\/ul>/i
  );

  assert.ok(listMatch, "Expected preview Additional Tags fallback list");
  assert.equal(
    listMatch[1].includes(BANNED_TAG),
    false,
    "Preview Additional Tags fallback must not include banned tag"
  );
});
