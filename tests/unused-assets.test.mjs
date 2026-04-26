import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const filesToScan = [
  "index.html",
  "chapter-preview.html",
  "ao3.css",
  "ao3.js",
  "chapter-preview.css",
  "chapter-preview.js",
  "site/2.0/07-interactions.css",
  "site/2.0/10-types-groups.css",
  "site/2.0/13-group-blurb.css",
  "site/2.0/15-group-comments.css",
  "site/2.0/17-zone-home.css",
  "site/2.0/26-media-narrow.css"
];

const removedAssets = [
  "envelope_icon.gif",
  "indicator.gif",
  "imageset.png"
];

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("removed legacy image assets are not referenced by shipped files", () => {
  for (const relativePath of filesToScan) {
    const content = readProjectFile(relativePath);

    for (const assetName of removedAssets) {
      assert.equal(
        content.includes(assetName),
        false,
        `${relativePath} should not reference ${assetName}`
      );
    }
  }
});
