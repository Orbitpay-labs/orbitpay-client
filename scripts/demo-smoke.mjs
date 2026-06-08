import { readFile } from "node:fs/promises";

const [html, markup, app] = await Promise.all([
  readFile("dist/index.html", "utf8"),
  readFile("src/pageMarkup.ts", "utf8"),
  readFile("src/App.tsx", "utf8")
]);

function decodePageMarkup(source) {
  const match = source.match(/const encodedMarkup = "([^"]+)"/);
  if (!match) {
    throw new Error("Encoded page markup is missing");
  }

  return Buffer.from(match[1], "base64").toString("utf8");
}

const decodedMarkup = decodePageMarkup(markup);

if (!html.includes('id="root"') || !html.includes("/assets/")) {
  throw new Error("Vite build output is missing the React root or bundled assets");
}

if (!decodedMarkup.includes("Stellar checkout and C-address funding, without the wallet confusion.")) {
  throw new Error("Landing page hero is missing from preserved page markup");
}

if (
  !decodedMarkup.includes("Payment sessions for apps that need clean Stellar checkout.") ||
  !decodedMarkup.includes('id="copyInstructions"')
) {
  throw new Error("Builder payment session demo is missing from preserved page markup");
}

if (!app.includes("framer-motion") || !app.includes("IntroSplash")) {
  throw new Error("Framer Motion intro animation is missing from React shell");
}

console.log("Client demo smoke test passed.");
