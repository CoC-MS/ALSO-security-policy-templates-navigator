import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repository = process.env.GITHUB_REPOSITORY;
if (!repository) throw new Error("GITHUB_REPOSITORY is required to preserve deployed assets.");

const response = JSON.parse(execFileSync("gh", [
  "api", `repos/${repository}/actions/artifacts?per_page=20`,
], { encoding: "utf8" }));
const artifacts = response.artifacts.filter((artifact) =>
  artifact.name === "github-pages" &&
  !artifact.expired &&
  artifact.workflow_run?.head_branch === "main" &&
  String(artifact.workflow_run.id) !== process.env.GITHUB_RUN_ID,
).slice(0, 2);

const destination = join("dist", "assets");
if (!existsSync(destination)) throw new Error("Build dist/assets before preserving deployed assets.");
const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
let preserved = 0;

for (const artifact of artifacts) {
  const temporary = mkdtempSync(join(tmpdir(), "navigator-pages-"));
  try {
    execFileSync("gh", [
      "run", "download", String(artifact.workflow_run.id),
      "--repo", repository, "--name", "github-pages", "--dir", temporary,
    ], { stdio: "inherit" });
    const extracted = join(temporary, "extracted");
    mkdirSync(extracted);
    execFileSync("tar", ["-xf", join(temporary, "artifact.tar"), "-C", extracted], {
      stdio: "inherit",
    });
    const assets = join(extracted, "assets");
    if (!existsSync(assets)) throw new Error(`Pages artifact ${artifact.id} has no assets directory.`);
    for (const name of readdirSync(assets)) {
      const source = join(assets, name);
      const target = join(destination, name);
      const info = statSync(source);
      if (!info.isFile() || info.mtimeMs < cutoff || existsSync(target)) continue;
      copyFileSync(source, target);
      utimesSync(target, info.atime, info.mtime);
      preserved++;
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

console.log(`Preserved ${preserved} previous Pages assets for cached pages (7-day window).`);
