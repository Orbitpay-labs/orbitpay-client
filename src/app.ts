const API_BASE = "http://localhost:8787";

interface DemoState {
  sessions: number;
  lastIntent: string;
}

interface FundingSessionResponse {
  id: string;
  network: string;
  status: string;
  destination?: string;
  asset?: string;
  amount?: string;
}

interface PaymentIntentResponse {
  id: string;
  merchant: string;
  invoice: string;
  amount: string;
  asset: string;
  status: string;
  paymentUrl?: string;
}

const demoState: DemoState = {
  sessions: 128,
  lastIntent: "op-1042"
};

const views = document.querySelectorAll<HTMLElement>(".view");
const navItems = document.querySelectorAll<HTMLButtonElement>(".nav-item");

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }

  return element as T;
}

function showView(target: string): void {
  navItems.forEach((nav) => nav.classList.toggle("active", nav.dataset.view === target));
  views.forEach((view) => view.classList.toggle("active", view.id === target));
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.dataset.view) {
      showView(item.dataset.view);
    }
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-view-link]").forEach((item) => {
  item.addEventListener("click", () => {
    if (item.dataset.viewLink) {
      showView(item.dataset.viewLink);
    }
  });
});

function formatMoney(value: string): string {
  const numeric = Number.parseFloat(value || "0");

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

async function postJson<T>(
  path: string,
  payload: Record<string, string>
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return {
      id: `demo_${Math.random().toString(36).slice(2, 9)}`,
      network: "testnet",
      status: "simulated",
      ...payload
    } as T;
  }
}

getElement<HTMLButtonElement>("simulateFunding").addEventListener("click", async () => {
  const asset = getElement<HTMLSelectElement>("assetSelect").value;
  const amount = getElement<HTMLInputElement>("amountInput").value;
  const result = getElement<HTMLDivElement>("fundingResult");

  result.textContent = "Creating funding session...";
  const session = await postJson<FundingSessionResponse>("/funding-sessions", {
    destination: "CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP",
    asset,
    amount
  });

  demoState.sessions += 1;
  getElement<HTMLElement>("checkoutAmount").textContent = formatMoney(amount);
  result.textContent = `Session ${session.id} prepared for ${amount} ${asset} on ${session.network}.`;
});

getElement<HTMLButtonElement>("createIntent").addEventListener("click", async () => {
  const merchant = getElement<HTMLInputElement>("merchantInput").value.trim() || "Merchant";
  const invoice = getElement<HTMLInputElement>("invoiceInput").value.trim() || "OP-1000";
  const amount = getElement<HTMLInputElement>("checkoutInput").value.trim() || "0";
  const result = getElement<HTMLDivElement>("intentResult");

  result.textContent = "Creating checkout intent...";
  const intent = await postJson<PaymentIntentResponse>("/payment-intents", {
    merchant,
    invoice,
    amount,
    asset: "USDC"
  });

  demoState.lastIntent = invoice.toLowerCase();
  getElement<HTMLDivElement>("paymentLink").textContent = `https://pay.orbitkit.dev/i/${demoState.lastIntent}`;
  getElement<HTMLElement>("checkoutAmount").textContent = formatMoney(amount);
  result.textContent = `Intent ${intent.id} is ready for ${merchant}.`;
});

getElement<HTMLButtonElement>("newSession").addEventListener("click", () => {
  showView("funding");
});
