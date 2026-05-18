import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

test("landing page includes the funding instruction surface", async () => {
  const html = await readFile("index.html", "utf8");

  assert.match(html, /id="instructionAmount"/);
  assert.match(html, /id="copyInstructions"/);
  assert.match(html, /Stellar Testnet/);
});

test("browser script wires the copyable funding details", async () => {
  const app = await readFile("scripts/app.js", "utf8");

  assert.match(app, /getFundingInstructionText/);
  assert.match(app, /navigator\.clipboard\.writeText/);
  assert.match(app, /fundingDestination/);
});
