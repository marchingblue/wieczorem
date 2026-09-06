/**
 * tiny css build: copies src files to dist, flattening component imports
 * so consumers can also `import "@mut/styles"` (index) or single files.
 */
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const src = join(root, "src");
const dist = join(root, "dist");

mkdirSync(join(dist, "components"), { recursive: true });

copyFileSync(join(src, "tokens.css"), join(dist, "tokens.css"));
for (const f of readdirSync(join(src, "components"))) {
  copyFileSync(join(src, "components", f), join(dist, "components", f));
}

// flatten index imports for direct consumption
const index = readFileSync(join(src, "index.css"), "utf8");
const flattened = index.replace(
  /@import\s+"\.\/(.+)";/g,
  (_, p) => readFileSync(join(src, p), "utf8"),
);
writeFileSync(join(dist, "index.css"), flattened);

console.log("styles: built dist/");
