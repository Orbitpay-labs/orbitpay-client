const API_BASE = "http://localhost:8787";

const demoState = {
  sessions: 128,
  lastIntent: "op-1042"
};

const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    showView(item.dataset.view);
  });
});

document.querySelectorAll("[data-view-link]").forEach((item) => {
  item.addEventListener("click", () => {
    showView(item.dataset.viewLink);
  });
});

function showView(target) {
  navItems.forEach((nav) => nav.classList.toggle("active", nav.dataset.view === target));
  views.forEach((view) => view.classList.toggle("active", view.id === target));
}

function formatMoney(value) {
  const numeric = Number.parseFloat(value || "0");
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

async function postJson(path, payload) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return await response.json();
  } catch {
    return {
      id: `demo_${Math.random().toString(36).slice(2, 9)}`,
      network: "testnet",
      status: "simulated",
      ...payload
    };
  }
}

document.getElementById("simulateFunding").addEventListener("click", async () => {
  const asset = document.getElementById("assetSelect").value;
  const amount = document.getElementById("amountInput").value;
  const result = document.getElementById("fundingResult");

  result.textContent = "Creating funding session...";
  const session = await postJson("/funding-sessions", {
    destination: "CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP",
    asset,
    amount
  });

  demoState.sessions += 1;
  document.getElementById("checkoutAmount").textContent = formatMoney(amount);
  result.textContent = `Session ${session.id} prepared for ${amount} ${asset} on ${session.network}.`;
});

document.getElementById("createIntent").addEventListener("click", async () => {
  const merchant = document.getElementById("merchantInput").value.trim() || "Merchant";
  const invoice = document.getElementById("invoiceInput").value.trim() || "OP-1000";
  const amount = document.getElementById("checkoutInput").value.trim() || "0";
  const result = document.getElementById("intentResult");

  result.textContent = "Creating checkout intent...";
  const intent = await postJson("/payment-intents", {
    merchant,
    invoice,
    amount,
    asset: "USDC"
  });

  demoState.lastIntent = invoice.toLowerCase();
  document.getElementById("paymentLink").textContent = `https://pay.orbitkit.dev/i/${demoState.lastIntent}`;
  document.getElementById("checkoutAmount").textContent = formatMoney(amount);
  result.textContent = `Intent ${intent.id} is ready for ${merchant}.`;
});

document.getElementById("newSession").addEventListener("click", () => {
  showView("funding");
});
