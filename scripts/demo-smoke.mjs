import { spawn } from "node:child_process";

const port = 5199;
const child = spawn(process.execPath, ["scripts/preview.js"], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore"
});

async function waitForDemo() {
  let lastError;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);

      if (response.ok) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw lastError || new Error("Demo server did not respond");
}

try {
  const response = await waitForDemo();
  const html = await response.text();

  if (!html.includes("Copyable testnet payment details")) {
    throw new Error("Funding instruction card is missing from demo HTML");
  }

  console.log("Client demo smoke test passed.");
} finally {
  child.kill();
}
