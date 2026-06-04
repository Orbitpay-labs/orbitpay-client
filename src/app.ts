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

const fundingDestination = "CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP";
const fundingMemo = "ORBIT-1042";

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

  const targetSection = document.getElementById(target);
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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

function getFundingInstructionText(): string {
  const asset = getElement<HTMLSelectElement>("assetSelect").value;
  const amount = getElement<HTMLInputElement>("amountInput").value.trim() || "0";
  return [
    `Send: ${amount} ${asset}`,
    "Network: Stellar Testnet",
    `Destination: ${fundingDestination}`,
    `Memo: ${fundingMemo}`
  ].join("\n");
}

function updateFundingInstructions(): void {
  const asset = getElement<HTMLSelectElement>("assetSelect").value;
  const amount = getElement<HTMLInputElement>("amountInput").value.trim() || "0";

  getElement<HTMLElement>("instructionAmount").textContent = `${amount} ${asset}`;
  getElement<HTMLElement>("instructionNetwork").textContent = "Stellar Testnet";
  getElement<HTMLElement>("instructionDestination").textContent = fundingDestination;
  getElement<HTMLElement>("instructionMemo").textContent = fundingMemo;
}

async function postJson<T>(
  path: string,
  payload: Record<string, string>
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 900);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
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
  } finally {
    window.clearTimeout(timeout);
  }
}

// -------------------------------------------------------------
// Interactive Stepper & Simulation Code
// -------------------------------------------------------------

function setStep(stepNum: number, status: 'inactive' | 'active' | 'completed') {
  const stepEl = document.getElementById(`step${stepNum}`);
  if (!stepEl) return;

  stepEl.classList.remove('active', 'completed');
  if (status === 'active') {
    stepEl.classList.add('active');
  } else if (status === 'completed') {
    stepEl.classList.add('completed');
    const numSpan = stepEl.querySelector('.step-num');
    if (numSpan) numSpan.textContent = '✓';
  }
}

function resetSteps() {
  const steps = [1, 2, 3];
  steps.forEach(num => {
    const stepEl = document.getElementById(`step${num}`);
    if (stepEl) {
      stepEl.classList.remove('active', 'completed');
      const numSpan = stepEl.querySelector('.step-num');
      if (numSpan) numSpan.textContent = num.toString();
    }
  });
  setStep(1, 'active');
  const fill = document.getElementById('stepProgressFill');
  if (fill) fill.style.width = '0%';
}

// Live activity feed logic
function addActivityLog(msg: string) {
  const feed = document.getElementById("liveActivityFeed");
  if (!feed) return;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const item = document.createElement("div");
  item.className = "activity-item";
  item.innerHTML = `
    <span class="activity-msg">${msg}</span>
    <span class="activity-time">${time}</span>
  `;
  feed.insertBefore(item, feed.firstChild);
  if (feed.children.length > 3) {
    feed.removeChild(feed.lastChild!);
  }
}

let currentLedger = 489201;
window.setInterval(() => {
  currentLedger += 1;
  const ledgerEl = document.getElementById("liveLedgerNum");
  if (ledgerEl) ledgerEl.textContent = `Ledger #${currentLedger}`;

  if (Math.random() > 0.6) {
    const txs = [
      "Ledger closed successfully",
      "Network feed synchronized",
      "Mock transaction <strong>GCXW...9A</strong> processed",
      "Anchor asset reserve verified"
    ];
    addActivityLog(txs[Math.floor(Math.random() * txs.length)]);
  }
}, 5000);

// Confetti logic
interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

function triggerConfetti() {
  const canvas = document.getElementById("confettiCanvas") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const context = ctx;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: ConfettiParticle[] = [];
  const colors = ["#8b5cf6", "#d15e7d", "#10b981", "#f59e0b", "#3b82f6"];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3
    });
  }

  function animate() {
    if (particles.length === 0) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;

      context.save();
      context.translate(p.x, p.y);
      context.rotate((p.rotation * Math.PI) / 180);
      context.fillStyle = p.color;
      context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      context.restore();

      if (p.y > canvas.height) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animate);
  }

  animate();
}

// Handle Simulate Funding click
getElement<HTMLButtonElement>("simulateFunding").addEventListener("click", async () => {
  const asset = getElement<HTMLSelectElement>("assetSelect").value;
  const amount = getElement<HTMLInputElement>("amountInput").value;
  const result = getElement<HTMLDivElement>("fundingResult");

  result.textContent = "Creating funding session...";
  resetSteps();

  // Step 1 Completed
  setStep(1, 'completed');
  setStep(2, 'active');
  const fill = document.getElementById('stepProgressFill');
  if (fill) fill.style.width = '50%';

  addActivityLog(`Session created for <strong>${amount} ${asset}</strong>`);

  const session = await postJson<FundingSessionResponse>("/funding-sessions", {
    destination: fundingDestination,
    asset,
    amount
  });

  demoState.sessions += 1;
  updateFundingInstructions();
  getElement<HTMLElement>("checkoutAmount").textContent = formatMoney(amount);

  result.textContent = `Listening for network payment on ${session.network}...`;

  // Simulate Network verification delay
  window.setTimeout(() => {
    setStep(2, 'completed');
    setStep(3, 'active');
    if (fill) fill.style.width = '100%';
    result.textContent = "Verifying smart account settlement on Stellar...";
    addActivityLog(`Payment verified for session <strong>${session.id}</strong>`);

    window.setTimeout(() => {
      setStep(3, 'completed');
      result.textContent = `Session ${session.id} settled! Onboarding completed successfully.`;
      addActivityLog(`Soroban contract lockup succeeded for <strong>${amount} ${asset}</strong>`);
      triggerConfetti();
    }, 1200);
  }, 1800);
});

getElement<HTMLSelectElement>("assetSelect").addEventListener("change", updateFundingInstructions);
getElement<HTMLInputElement>("amountInput").addEventListener("input", updateFundingInstructions);

getElement<HTMLButtonElement>("copyInstructions").addEventListener("click", async () => {
  const copyButton = getElement<HTMLButtonElement>("copyInstructions");
  const previousLabel = copyButton.textContent || "Copy details";

  try {
    await navigator.clipboard.writeText(getFundingInstructionText());
    copyButton.textContent = "Copied";
  } catch {
    copyButton.textContent = "Copy unavailable";
  }

  window.setTimeout(() => {
    copyButton.textContent = previousLabel;
  }, 1600);
});

// Intent Creation
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

  // Update checkout card details dynamically
  const merchantLogo = document.getElementById("checkoutMerchantLogo");
  if (merchantLogo) merchantLogo.textContent = merchant.charAt(0).toUpperCase();

  const merchantName = document.getElementById("checkoutMerchantName");
  if (merchantName) merchantName.textContent = merchant;

  const invoiceNum = document.getElementById("checkoutInvoiceNum");
  if (invoiceNum) invoiceNum.textContent = `Invoice ${invoice}`;

  result.textContent = `Intent ${intent.id} is ready for ${merchant}.`;
  addActivityLog(`Intent created: <strong>${invoice}</strong> for <strong>$${amount}</strong>`);
});

getElement<HTMLButtonElement>("newSession").addEventListener("click", () => {
  showView("funding");
});

// Freighter Wallet Simulator Modal
const modalOverlay = document.getElementById("walletModalOverlay") as HTMLDivElement;
const freighterBtn = document.getElementById("simulateFreighterPay") as HTMLButtonElement;
const closeBtn = document.getElementById("closeWalletModal") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancelPayment") as HTMLButtonElement;
const approveBtn = document.getElementById("approvePayment") as HTMLButtonElement;

if (freighterBtn && modalOverlay) {
  freighterBtn.addEventListener("click", () => {
    const merchant = getElement<HTMLInputElement>("merchantInput").value.trim() || "Atlas Studio";
    const invoice = getElement<HTMLInputElement>("invoiceInput").value.trim() || "OP-1042";
    const amount = getElement<HTMLInputElement>("checkoutInput").value.trim() || "45.00";

    const modalMerchant = document.getElementById("modalMerchant");
    if (modalMerchant) modalMerchant.textContent = merchant;

    const modalInvoice = document.getElementById("modalInvoice");
    if (modalInvoice) modalInvoice.textContent = invoice;

    const modalAmount = document.getElementById("modalAmount");
    if (modalAmount) modalAmount.textContent = `${amount} USDC`;

    modalOverlay.classList.add("active");
  });
}

function closeFreighterModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
  }
}

if (closeBtn) closeBtn.addEventListener("click", closeFreighterModal);
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    closeFreighterModal();
    const result = getElement<HTMLDivElement>("intentResult");
    result.textContent = "Signature rejected by Freighter Wallet.";
    result.className = "result-strip";
  });
}

if (approveBtn) {
  approveBtn.addEventListener("click", () => {
    const prevText = approveBtn.textContent || "";
    approveBtn.textContent = "Signing...";
    approveBtn.disabled = true;

    window.setTimeout(() => {
      approveBtn.textContent = prevText;
      approveBtn.disabled = false;
      closeFreighterModal();

      const result = getElement<HTMLDivElement>("intentResult");
      result.textContent = "Payment signed and settled via Soroban contract!";
      result.className = "result-strip success";

      const invoice = getElement<HTMLInputElement>("invoiceInput").value.trim() || "OP-1042";
      addActivityLog(`Wallet settled invoice <strong>${invoice}</strong> on chain`);
      triggerConfetti();
    }, 1200);
  });
}

// -------------------------------------------------------------
// SDK Tabs switching logic
// -------------------------------------------------------------
const tabData: Record<string, string> = {
  ts: `<span class="code-keyword">import</span> { <span class="code-variable">OrbitPay</span> } <span class="code-keyword">from</span> <span class="code-string">"@orbitpay/sdk"</span>;

<span class="code-keyword">const</span> <span class="code-variable">session</span> = <span class="code-keyword">await</span> <span class="code-variable">OrbitPay</span>.<span class="code-function">createFundingSession</span>({
  <span class="code-property">network</span>: <span class="code-string">"testnet"</span>,
  <span class="code-property">destination</span>: <span class="code-string">"CC4V...N9QP"</span>,
  <span class="code-property">asset</span>: <span class="code-string">"USDC"</span>,
  <span class="code-property">amount</span>: <span class="code-string">"45.00"</span>,
  <span class="code-property">successUrl</span>: <span class="code-string">"https://merchant.app/paid"</span>
});`,
  sh: `<span class="code-keyword"># Install the OrbitPay SDK core package</span>
npm install @orbitpay/sdk

<span class="code-keyword"># Or using yarn package manager</span>
yarn add @orbitpay/sdk`,
  js: `<span class="code-keyword">import</span> express <span class="code-keyword">from</span> <span class="code-string">"express"</span>;
<span class="code-keyword">import</span> { <span class="code-variable">OrbitPayWebhook</span> } <span class="code-keyword">from</span> <span class="code-string">"@orbitpay/sdk"</span>;

<span class="code-keyword">const</span> <span class="code-variable">app</span> = <span class="code-function">express</span>();

<span class="code-variable">app</span>.<span class="code-function">post</span>(<span class="code-string">"/webhooks/orbitpay"</span>, express.<span class="code-function">raw</span>({ <span class="code-property">type</span>: <span class="code-string">"application/json"</span> }), (<span class="code-variable">req</span>, <span class="code-variable">res</span>) => {
  <span class="code-keyword">const</span> <span class="code-variable">event</span> = <span class="code-variable">OrbitPayWebhook</span>.<span class="code-function">constructEvent</span>(
    <span class="code-variable">req</span>.<span class="code-variable">body</span>,
    <span class="code-variable">req</span>.<span class="code-variable">headers</span>[<span class="code-string">"orbitpay-signature"</span>],
    <span class="code-variable">process</span>.<span class="code-variable">env</span>.<span class="code-variable">ORBITPAY_WEBHOOK_SECRET</span>
  );

  <span class="code-keyword">if</span> (<span class="code-variable">event</span>.<span class="code-property">type</span> === <span class="code-string">"intent.settled"</span>) {
    <span class="code-keyword">const</span> { <span class="code-variable">invoice</span>, <span class="code-variable">amount</span> } = <span class="code-variable">event</span>.<span class="code-variable">data</span>;
    <span class="code-variable">console</span>.<span class="code-function">log</span>(<span class="code-string">\`Payment settled: \${invoice} of \${amount}\`</span>);
  }

  <span class="code-variable">res</span>.<span class="code-function">json</span>({ <span class="code-property">received</span>: <span class="code-constant">true</span> });
});`
};

const tabElements = document.querySelectorAll<HTMLElement>(".editor-tab");
const codeBlockElement = document.getElementById("codeToCopy");

tabElements.forEach(tab => {
  tab.addEventListener("click", () => {
    tabElements.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const activeTab = tab.dataset.tab;
    if (activeTab && codeBlockElement && tabData[activeTab]) {
      codeBlockElement.innerHTML = tabData[activeTab];
    }
  });
});

getElement<HTMLButtonElement>("copyCodeButton").addEventListener("click", async () => {
  const copyButton = getElement<HTMLButtonElement>("copyCodeButton");
  const codeText = getElement<HTMLElement>("codeToCopy").textContent || "";
  const span = copyButton.querySelector("span");
  const previousLabel = span?.textContent || "Copy";

  try {
    await navigator.clipboard.writeText(codeText);
    if (span) span.textContent = "Copied";
  } catch {
    if (span) span.textContent = "Unavailable";
  }

  window.setTimeout(() => {
    if (span) span.textContent = previousLabel;
  }, 1600);
});

// -------------------------------------------------------------
// Interactive 3D Card Hover Tilt Effect
// -------------------------------------------------------------
function initCardTilt(selector: string) {
  const card = document.querySelector<HTMLElement>(selector);
  if (!card) return;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  });
}

initCardTilt(".hero-visual");
initCardTilt(".payment-card");
initCardTilt(".checkout-card");

updateFundingInstructions();
addActivityLog("Developer Dashboard initialized successfully.");
