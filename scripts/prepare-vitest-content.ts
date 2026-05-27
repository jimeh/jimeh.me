import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const devDataStore = join(".astro", "data-store.json");
const prodDataStore = join("node_modules", ".astro", "data-store.json");

execFileSync("pnpm", ["astro", "sync", "--force"], { stdio: "inherit" });

if (!existsSync(prodDataStore)) {
  throw new Error(`Astro content sync did not create ${prodDataStore}`);
}

mkdirSync(dirname(devDataStore), { recursive: true });
copyFileSync(prodDataStore, devDataStore);
