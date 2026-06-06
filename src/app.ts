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
const navItems = document.querySelectorAll<HTMLElement>(".nav-item");

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

// -------------------------------------------------------------
// Interactive Checkout Demo Simulation & Controls
// -------------------------------------------------------------

function updateWebhookPayload(event: string, status: string, amount: string, asset: string, network: string) {
  const codeEl = document.getElementById("webhookPayloadCode");
  if (!codeEl) return;
  codeEl.innerHTML = `{
  <span class="code-property">"event"</span>: <span class="code-string">"${event}"</span>,
  <span class="code-property">"sessionId"</span>: <span class="code-string">"op_sess_1042"</span>,
  <span class="code-property">"amount"</span>: <span class="code-string">"${amount}"</span>,
  <span class="code-property">"asset"</span>: <span class="code-string">"${asset}"</span>,
  <span class="code-property">"network"</span>: <span class="code-string">"${network}"</span>,
  <span class="code-property">"status"</span>: <span class="code-string">"${status}"</span>
}`;
}

function updateWebhookStatus(status: 'pending' | 'sending' | 'success', text: string) {
  const pill = document.getElementById("webhookStatusVal");
  if (!pill) return;
  pill.textContent = text;
  pill.className = "webhook-status-pill";
  if (status === 'success') {
    pill.classList.add("success");
  }
}

function setCardStatusDot(status: 'awaiting' | 'funded' | 'settled') {
  const dot = document.getElementById("cardStatusDot");
  if (!dot) return;
  dot.className = "status-dot";
  if (status === 'awaiting') {
    dot.classList.add("awaiting");
    dot.textContent = "Awaiting payment";
  } else if (status === 'funded') {
    dot.textContent = "Funded";
  } else if (status === 'settled') {
    dot.textContent = "Settled";
  }
}

// Demo hardcoded values (inputs removed for cleaner auto-play demo)
const DEMO_AMOUNT = "45.00";
const DEMO_ASSET = "USDC";
const DEMO_NETWORK = "testnet";

// Launch demo click helper
getElement<HTMLButtonElement>("newSession").addEventListener("click", () => {
  showView("checkout");
});

// Stepper Timeline states
function setDevTimelineState(created: string, awaiting: string, funded: string, settled: string) {
  getElement<HTMLElement>("devStepCreated").setAttribute("data-status", created);
  getElement<HTMLElement>("devStepAwaiting").setAttribute("data-status", awaiting);
  getElement<HTMLElement>("devStepFunded").setAttribute("data-status", funded);
  getElement<HTMLElement>("devStepSettled").setAttribute("data-status", settled);
}

// Run interactive simulation of payment (Acts like an automated movie walkthrough if autoApprove = true)
let isSimulating = false;
async function runPaymentSimulation(autoApprove = false) {
  if (isSimulating) return;
  isSimulating = true;

  const amount = DEMO_AMOUNT;
  const asset = DEMO_ASSET;
  const networkVal = DEMO_NETWORK;
  const payBtn = document.getElementById("demoPayButton") as HTMLButtonElement;

  // Phase 1: Reset timeline, webhook panel, and card states to Created / Awaiting
  setDevTimelineState("complete", "active", "pending", "pending");
  updateWebhookStatus("sending", "created");
  updateWebhookPayload("payment.session.created", "awaiting_payment", amount, asset, networkVal);
  setCardStatusDot("awaiting");
  if (payBtn) {
    payBtn.className = "pay-button";
    payBtn.textContent = "Pay with Stellar";
    payBtn.disabled = true;
  }
  addActivityLog(`Session op_sess_1042 created for <strong>${amount} ${asset}</strong>`);

  // If autoApprove = true (triggered automatically), auto-animate Freighter Wallet interaction
  if (autoApprove) {
    await new Promise(r => setTimeout(r, 1200));
    if (payBtn) {
      payBtn.className = "pay-button connecting";
      payBtn.textContent = "Connecting Freighter...";
    }
    addActivityLog("Handshaking with Freighter browser wallet extension...");

    await new Promise(r => setTimeout(r, 1500));
    const modalMerchant = document.getElementById("modalMerchant");
    if (modalMerchant) modalMerchant.textContent = "Atlas Studio";
    const modalInvoice = document.getElementById("modalInvoice");
    if (modalInvoice) modalInvoice.textContent = "OP-1042";
    const modalAmount = document.getElementById("modalAmount");
    if (modalAmount) modalAmount.textContent = `${amount} ${asset}`;
    modalOverlay.classList.add("active");
    addActivityLog("Freighter prompt opened: awaiting signature...");

    // Auto sign transition
    await new Promise(r => setTimeout(r, 1800));
    if (approveBtn) {
      approveBtn.textContent = "Signing...";
      approveBtn.disabled = true;
    }
    addActivityLog("Signature approved in Freighter modal.");

    await new Promise(r => setTimeout(r, 1000));
    closeFreighterModal();
    if (approveBtn) {
      approveBtn.textContent = "Approve Sign";
      approveBtn.disabled = false;
    }
    if (payBtn) {
      payBtn.className = "pay-button success";
      payBtn.textContent = "✓ Transaction Signed";
    }
  }

  // Phase 2: Detecting Payment (Step 2: Funded)
  await new Promise(r => setTimeout(r, 1500));
  setDevTimelineState("complete", "complete", "active", "pending");
  updateWebhookStatus("sending", "funded");
  updateWebhookPayload("payment.session.funded", "payment_received", amount, asset, networkVal);
  setCardStatusDot("funded");
  addActivityLog(`Stellar payment detected on ledger for <strong>${amount} ${asset}</strong>`);

  // Phase 3: Smart Account Onboarding (Step 3: Settled)
  await new Promise(r => setTimeout(r, 1800));
  setDevTimelineState("complete", "complete", "complete", "complete");
  updateWebhookStatus("success", "settled");
  updateWebhookPayload("payment.session.settled", "settled", amount, asset, networkVal);
  setCardStatusDot("settled");
  if (payBtn) {
    payBtn.className = "pay-button success";
    payBtn.textContent = "✓ Session Settled";
  }
  addActivityLog(`Onboarding settled via Soroban smart contract: <strong>${amount} ${asset}</strong>`);
  triggerConfetti();

  if (payBtn) payBtn.disabled = false;
  isSimulating = false;
}

// Freighter modal overlay triggers
const modalOverlay = document.getElementById("walletModalOverlay") as HTMLDivElement;
const demoPayBtn = document.getElementById("demoPayButton") as HTMLButtonElement;
const closeBtn = document.getElementById("closeWalletModal") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancelPayment") as HTMLButtonElement;
const approveBtn = document.getElementById("approvePayment") as HTMLButtonElement;

if (demoPayBtn && modalOverlay) {
  demoPayBtn.addEventListener("click", () => {
    const amount = DEMO_AMOUNT;
    const asset = DEMO_ASSET;

    const modalMerchant = document.getElementById("modalMerchant");
    if (modalMerchant) modalMerchant.textContent = "Atlas Studio";

    const modalInvoice = document.getElementById("modalInvoice");
    if (modalInvoice) modalInvoice.textContent = "OP-1042";

    const modalAmount = document.getElementById("modalAmount");
    if (modalAmount) modalAmount.textContent = `${amount} ${asset}`;

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
    addActivityLog("Signature rejected by user wallet.");
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
      runPaymentSimulation(false); // Manual approval doesn't require auto wallet connection animations
    }, 1000);
  });
}

// Auto loop movie demo
let autoplayTimer: number | null = null;

function stopAutoplay() {
  if (autoplayTimer) {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }
}

function startAutoplayLoop() {
  stopAutoplay();

  async function tick() {
    if (isSimulating) {
      autoplayTimer = window.setTimeout(tick, 1000);
      return;
    }

    // Reset status first
    setDevTimelineState("complete", "active", "pending", "pending");
    updateWebhookStatus("pending", "created");

    // Run simulation
    await runPaymentSimulation(true);

    // Once settled, wait 6 seconds and then run again
    autoplayTimer = window.setTimeout(tick, 6000);
  }

  // Start the first loop after 2 seconds
  autoplayTimer = window.setTimeout(tick, 2000);
}

// Trigger simulation when scrolled into view
const checkoutSection = document.getElementById("checkout");
if (checkoutSection && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAutoplayLoop();
      } else {
        stopAutoplay();
      }
    });
  }, { threshold: 0.25 });
  observer.observe(checkoutSection);
} else {
  // Fallback if IntersectionObserver is not supported
  startAutoplayLoop();
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
initCardTilt(".checkout-card-preview");

// Hero Card Event Handlers
const heroCopyBtn = document.getElementById("heroCopyDetails");
if (heroCopyBtn) {
  heroCopyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        "Destination: CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP\nMemos: ORBIT-1042\nAmount: 45.00 USDC"
      );
      heroCopyBtn.textContent = "Copied!";
    } catch {
      heroCopyBtn.textContent = "Error";
    }
    window.setTimeout(() => {
      heroCopyBtn.textContent = "Copy details";
    }, 1500);
  });
}

const heroPayBtn = document.getElementById("heroPayStellar");
if (heroPayBtn && modalOverlay) {
  heroPayBtn.addEventListener("click", () => {
    const modalMerchant = document.getElementById("modalMerchant");
    if (modalMerchant) modalMerchant.textContent = "Atlas Studio";

    const modalInvoice = document.getElementById("modalInvoice");
    if (modalInvoice) modalInvoice.textContent = "OP-1042";

    const modalAmount = document.getElementById("modalAmount");
    if (modalAmount) modalAmount.textContent = "45.00 USDC";

    modalOverlay.classList.add("active");
  });
}

updateFundingInstructions();
addActivityLog("Developer Dashboard initialized successfully.");
