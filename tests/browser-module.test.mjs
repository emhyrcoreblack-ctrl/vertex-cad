import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("browser module in index.html has valid JavaScript syntax", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const match = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  assert.ok(match, "module script should exist in index.html");
  const file = join(tmpdir(), `vertex-cad-browser-${process.pid}.mjs`);
  try {
    await writeFile(file, match[1], "utf8");
    const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    await rm(file, { force: true });
  }
});
