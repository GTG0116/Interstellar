import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import chalk from "chalk";

// Cloudflare serves dist/ as static assets, so there is no Express server to map the build's
// randomized page routes. Turn the vendor map into a _redirects file that rewrites each one.
const DIST_DIR = path.join(process.cwd(), "dist");
const require = createRequire(import.meta.url);
const vendorMap = require(path.join(DIST_DIR, ".runtime", "vendor-map.cjs"));

const pages = ["/apps", "/games", "/tabs", "/settings", "/home"];
const rules = pages.filter(page => vendorMap.routes?.[page]).map(page => `${vendorMap.routes[page]} ${page} 200`);
rules.push("/play.html /games 200");

await writeFile(path.join(DIST_DIR, "_redirects"), `${rules.join("\n")}\n`, "utf8");
await writeFile(path.join(DIST_DIR, ".assetsignore"), ".runtime\n", "utf8");

console.log(chalk.green(`Cloudflare: wrote ${rules.length} route rewrites to dist/_redirects`));
