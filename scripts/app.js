"use strict";
const API_BASE = "http://localhost:8787";
const demoState = {
    sessions: 128,
    lastIntent: "op-1042"
};
const fundingDestination = "CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP";
const fundingMemo = "ORBIT-1042";
const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Missing required element: ${id}`);
    }
    return element;
}
function showView(target) {
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
document.querySelectorAll("[data-view-link]").forEach((item) => {
    item.addEventListener("click", () => {
        if (item.dataset.viewLink) {
            showView(item.dataset.viewLink);
        }
    });
});
function formatMoney(value) {
    const numeric = Number.parseFloat(value || "0");
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number.isFinite(numeric) ? numeric : 0);
}
function getFundingInstructionText() {
    const asset = getElement("assetSelect").value;
    const amount = getElement("amountInput").value.trim() || "0";
    return [
        `Send: ${amount} ${asset}`,
        "Network: Stellar Testnet",
        `Destination: ${fundingDestination}`,
        `Memo: ${fundingMemo}`
    ].join("\n");
}
function updateFundingInstructions() {
    const asset = getElement("assetSelect").value;
    const amount = getElement("amountInput").value.trim() || "0";
    getElement("instructionAmount").textContent = `${amount} ${asset}`;
    getElement("instructionNetwork").textContent = "Stellar Testnet";
    getElement("instructionDestination").textContent = fundingDestination;
    getElement("instructionMemo").textContent = fundingMemo;
}
async function postJson(path, payload) {
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
        return (await response.json());
    }
    catch {
        return {
            id: `demo_${Math.random().toString(36).slice(2, 9)}`,
            network: "testnet",
            status: "simulated",
            ...payload
        };
    }
    finally {
        window.clearTimeout(timeout);
    }
}
// -------------------------------------------------------------
// Interactive Stepper & Simulation Code
// -------------------------------------------------------------
function setStep(stepNum, status) {
    const stepEl = document.getElementById(`step${stepNum}`);
    if (!stepEl)
        return;
    stepEl.classList.remove('active', 'completed');
    if (status === 'active') {
        stepEl.classList.add('active');
    }
    else if (status === 'completed') {
        stepEl.classList.add('completed');
        const numSpan = stepEl.querySelector('.step-num');
        if (numSpan)
            numSpan.textContent = '✓';
    }
}
function resetSteps() {
    const steps = [1, 2, 3];
    steps.forEach(num => {
        const stepEl = document.getElementById(`step${num}`);
        if (stepEl) {
            stepEl.classList.remove('active', 'completed');
            const numSpan = stepEl.querySelector('.step-num');
            if (numSpan)
                numSpan.textContent = num.toString();
        }
    });
    setStep(1, 'active');
    const fill = document.getElementById('stepProgressFill');
    if (fill)
        fill.style.width = '0%';
}
// Live activity feed logic
function addActivityLog(msg) {
    const feed = document.getElementById("liveActivityFeed");
    if (!feed)
        return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const item = document.createElement("div");
    item.className = "activity-item";
    item.innerHTML = `
    <span class="activity-msg">${msg}</span>
    <span class="activity-time">${time}</span>
  `;
    feed.insertBefore(item, feed.firstChild);
    if (feed.children.length > 3) {
        feed.removeChild(feed.lastChild);
    }
}
let currentLedger = 489201;
window.setInterval(() => {
    currentLedger += 1;
    const ledgerEl = document.getElementById("liveLedgerNum");
    if (ledgerEl)
        ledgerEl.textContent = `Ledger #${currentLedger}`;
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
function triggerConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas)
        return;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return;
    const context = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
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
getElement("simulateFunding").addEventListener("click", async () => {
    const asset = getElement("assetSelect").value;
    const amount = getElement("amountInput").value;
    const result = getElement("fundingResult");
    result.textContent = "Creating funding session...";
    resetSteps();
    // Step 1 Completed
    setStep(1, 'completed');
    setStep(2, 'active');
    const fill = document.getElementById('stepProgressFill');
    if (fill)
        fill.style.width = '50%';
    addActivityLog(`Session created for <strong>${amount} ${asset}</strong>`);
    const session = await postJson("/funding-sessions", {
        destination: fundingDestination,
        asset,
        amount
    });
    demoState.sessions += 1;
    updateFundingInstructions();
    getElement("checkoutAmount").textContent = formatMoney(amount);
    result.textContent = `Listening for network payment on ${session.network}...`;
    // Simulate Network verification delay
    window.setTimeout(() => {
        setStep(2, 'completed');
        setStep(3, 'active');
        if (fill)
            fill.style.width = '100%';
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
getElement("assetSelect").addEventListener("change", updateFundingInstructions);
getElement("amountInput").addEventListener("input", updateFundingInstructions);
getElement("copyInstructions").addEventListener("click", async () => {
    const copyButton = getElement("copyInstructions");
    const previousLabel = copyButton.textContent || "Copy details";
    try {
        await navigator.clipboard.writeText(getFundingInstructionText());
        copyButton.textContent = "Copied";
    }
    catch {
        copyButton.textContent = "Copy unavailable";
    }
    window.setTimeout(() => {
        copyButton.textContent = previousLabel;
    }, 1600);
});
// -------------------------------------------------------------
// Interactive Checkout Demo Simulation & Controls
// -------------------------------------------------------------
function updateWebhookPayload(event, status, amount, asset, network) {
    const codeEl = document.getElementById("webhookPayloadCode");
    if (!codeEl)
        return;
    codeEl.innerHTML = `{
  <span class="code-property">"event"</span>: <span class="code-string">"${event}"</span>,
  <span class="code-property">"sessionId"</span>: <span class="code-string">"op_sess_1042"</span>,
  <span class="code-property">"amount"</span>: <span class="code-string">"${amount}"</span>,
  <span class="code-property">"asset"</span>: <span class="code-string">"${asset}"</span>,
  <span class="code-property">"network"</span>: <span class="code-string">"${network}"</span>,
  <span class="code-property">"status"</span>: <span class="code-string">"${status}"</span>
}`;
}
function updateWebhookStatus(status, text) {
    const pill = document.getElementById("webhookStatusVal");
    if (!pill)
        return;
    pill.textContent = text;
    pill.className = "webhook-status-pill";
    if (status === 'success') {
        pill.classList.add("success");
    }
}
function setCardStatusDot(status) {
    const dot = document.getElementById("cardStatusDot");
    if (!dot)
        return;
    dot.className = "status-dot";
    if (status === 'awaiting') {
        dot.classList.add("awaiting");
        dot.textContent = "Awaiting payment";
    }
    else if (status === 'funded') {
        dot.textContent = "Funded";
    }
    else if (status === 'settled') {
        dot.textContent = "Settled";
    }
}
function updateCheckoutDemoFields() {
    const amount = getElement("demoAmountInput").value || "45.00";
    const asset = getElement("demoAssetSelect").value;
    const networkVal = getElement("demoNetworkSelect").value;
    getElement("cardAmountVal").textContent = amount;
    getElement("cardAssetVal").textContent = asset;
    getElement("cardAssetLogo").textContent = asset;
    getElement("cardNetworkVal").textContent = networkVal === 'public' ? 'Stellar Public' : 'Stellar Testnet';
    getElement("metaAssetVal").textContent = asset;
    getElement("metaNetworkVal").textContent = networkVal;
    setCardStatusDot("awaiting");
    const payBtn = document.getElementById("demoPayButton");
    if (payBtn) {
        payBtn.className = "pay-button";
        payBtn.textContent = "Pay with Stellar";
        payBtn.disabled = false;
    }
    updateWebhookPayload("payment.session.created", "awaiting_payment", amount, asset, networkVal);
}
// Attach listeners to update views
getElement("demoAmountInput").addEventListener("input", updateCheckoutDemoFields);
getElement("demoAssetSelect").addEventListener("change", updateCheckoutDemoFields);
getElement("demoNetworkSelect").addEventListener("change", updateCheckoutDemoFields);
// Copy details
getElement("copyDemoDetails").addEventListener("click", async () => {
    const copyBtn = getElement("copyDemoDetails");
    const prevLabel = copyBtn.textContent || "Copy payment details";
    const amount = getElement("demoAmountInput").value || "45.00";
    const asset = getElement("demoAssetSelect").value;
    const network = getElement("demoNetworkSelect").value === 'public' ? 'Stellar Public' : 'Stellar Testnet';
    try {
        await navigator.clipboard.writeText(`Send: ${amount} ${asset}\nNetwork: ${network}\nDestination: CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP\nMemo: ORBIT-1042`);
        copyBtn.textContent = "Copied!";
    }
    catch {
        copyBtn.textContent = "Copy failed";
    }
    window.setTimeout(() => {
        copyBtn.textContent = prevLabel;
    }, 1600);
});
// Launch demo click helper
getElement("newSession").addEventListener("click", () => {
    showView("checkout");
});
// Stepper Timeline states
function setDevTimelineState(created, awaiting, funded, settled) {
    getElement("devStepCreated").setAttribute("data-status", created);
    getElement("devStepAwaiting").setAttribute("data-status", awaiting);
    getElement("devStepFunded").setAttribute("data-status", funded);
    getElement("devStepSettled").setAttribute("data-status", settled);
}
// Run interactive simulation of payment (Acts like an automated movie walkthrough if autoApprove = true)
let isSimulating = false;
async function runPaymentSimulation(autoApprove = false) {
    if (isSimulating)
        return;
    isSimulating = true;
    const amount = getElement("demoAmountInput").value || "45.00";
    const asset = getElement("demoAssetSelect").value;
    const networkVal = getElement("demoNetworkSelect").value;
    const triggerBtn = document.getElementById("triggerDemoInteractiveBtn");
    const payBtn = document.getElementById("demoPayButton");
    if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.textContent = "Simulating transaction...";
    }
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
    // If autoApprove = true (triggered via "Try demo session"), auto-animate Freighter Wallet interaction
    if (autoApprove) {
        await new Promise(r => setTimeout(r, 1200));
        if (payBtn) {
            payBtn.className = "pay-button connecting";
            payBtn.textContent = "Connecting Freighter...";
        }
        addActivityLog("Handshaking with Freighter browser wallet extension...");
        await new Promise(r => setTimeout(r, 1500));
        const modalMerchant = document.getElementById("modalMerchant");
        if (modalMerchant)
            modalMerchant.textContent = "Atlas Studio";
        const modalInvoice = document.getElementById("modalInvoice");
        if (modalInvoice)
            modalInvoice.textContent = "OP-1042";
        const modalAmount = document.getElementById("modalAmount");
        if (modalAmount)
            modalAmount.textContent = `${amount} ${asset}`;
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
    if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.textContent = "Try demo session";
    }
    if (payBtn)
        payBtn.disabled = false;
    isSimulating = false;
}
// Freighter modal overlay triggers
const modalOverlay = document.getElementById("walletModalOverlay");
const demoPayBtn = document.getElementById("demoPayButton");
const closeBtn = document.getElementById("closeWalletModal");
const cancelBtn = document.getElementById("cancelPayment");
const approveBtn = document.getElementById("approvePayment");
if (demoPayBtn && modalOverlay) {
    demoPayBtn.addEventListener("click", () => {
        const amount = getElement("demoAmountInput").value || "45.00";
        const asset = getElement("demoAssetSelect").value;
        const modalMerchant = document.getElementById("modalMerchant");
        if (modalMerchant)
            modalMerchant.textContent = "Atlas Studio";
        const modalInvoice = document.getElementById("modalInvoice");
        if (modalInvoice)
            modalInvoice.textContent = "OP-1042";
        const modalAmount = document.getElementById("modalAmount");
        if (modalAmount)
            modalAmount.textContent = `${amount} ${asset}`;
        modalOverlay.classList.add("active");
    });
}
function closeFreighterModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove("active");
    }
}
if (closeBtn)
    closeBtn.addEventListener("click", closeFreighterModal);
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
// Trigger simulation on CTA click
const triggerDemoBtn = document.getElementById("triggerDemoInteractiveBtn");
if (triggerDemoBtn) {
    triggerDemoBtn.addEventListener("click", () => {
        // Reset status first
        setDevTimelineState("complete", "active", "pending", "pending");
        updateWebhookStatus("pending", "created");
        runPaymentSimulation(true); // Enable autoApprove for automated movie demo
    });
}
// -------------------------------------------------------------
// SDK Tabs switching logic
// -------------------------------------------------------------
const tabData = {
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
const tabElements = document.querySelectorAll(".editor-tab");
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
getElement("copyCodeButton").addEventListener("click", async () => {
    const copyButton = getElement("copyCodeButton");
    const codeText = getElement("codeToCopy").textContent || "";
    const span = copyButton.querySelector("span");
    const previousLabel = span?.textContent || "Copy";
    try {
        await navigator.clipboard.writeText(codeText);
        if (span)
            span.textContent = "Copied";
    }
    catch {
        if (span)
            span.textContent = "Unavailable";
    }
    window.setTimeout(() => {
        if (span)
            span.textContent = previousLabel;
    }, 1600);
});
// -------------------------------------------------------------
// Interactive 3D Card Hover Tilt Effect
// -------------------------------------------------------------
function initCardTilt(selector) {
    const card = document.querySelector(selector);
    if (!card)
        return;
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
            await navigator.clipboard.writeText("Destination: CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP\nMemos: ORBIT-1042\nAmount: 45.00 USDC");
            heroCopyBtn.textContent = "Copied!";
        }
        catch {
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
        if (modalMerchant)
            modalMerchant.textContent = "Atlas Studio";
        const modalInvoice = document.getElementById("modalInvoice");
        if (modalInvoice)
            modalInvoice.textContent = "OP-1042";
        const modalAmount = document.getElementById("modalAmount");
        if (modalAmount)
            modalAmount.textContent = "45.00 USDC";
        modalOverlay.classList.add("active");
    });
}
updateFundingInstructions();
addActivityLog("Developer Dashboard initialized successfully.");
