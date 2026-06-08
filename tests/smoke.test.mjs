import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

function decodePageMarkup(source) {
  const match = source.match(/const encodedMarkup = "([^"]+)"/);
  assert.ok(match, "encoded page markup is missing");
  return Buffer.from(match[1], "base64").toString("utf8");
}

test("react-rendered page markup preserves the funding instruction surface", async () => {
  const markup = decodePageMarkup(await readFile("src/pageMarkup.ts", "utf8"));

  assert.match(markup, /id="instructionAmount"/);
  assert.match(markup, /id="copyInstructions"/);
  assert.match(markup, /Stellar Testnet/);
});

test("existing browser behavior still wires copyable funding details", async () => {
  const app = await readFile("src/app.ts", "utf8");

  assert.match(app, /getFundingInstructionText/);
  assert.match(app, /navigator\.clipboard\.writeText/);
  assert.match(app, /fundingDestination/);
});

test("react shell uses Framer Motion intro without replacing the page markup", async () => {
  const app = await readFile("src/App.tsx", "utf8");

  assert.match(app, /from "framer-motion"/);
  assert.match(app, /IntroSplash/);
  assert.match(app, /dangerouslySetInnerHTML/);
});
