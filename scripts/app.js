const API_BASE = "http://localhost:8787";
const demoState = {
    sessions: 128,
    lastIntent: "op-1042"
};
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
}
getElement("simulateFunding").addEventListener("click", async () => {
    const asset = getElement("assetSelect").value;
    const amount = getElement("amountInput").value;
    const result = getElement("fundingResult");
    result.textContent = "Creating funding session...";
    const session = await postJson("/funding-sessions", {
        destination: "CC4VBD5EBGTEJQ7YAHU3MVP7SP2JNCQX6M6NPVZV4LQWF3N9QP",
        asset,
        amount
    });
    demoState.sessions += 1;
    getElement("checkoutAmount").textContent = formatMoney(amount);
    result.textContent = `Session ${session.id} prepared for ${amount} ${asset} on ${session.network}.`;
});
getElement("createIntent").addEventListener("click", async () => {
    const merchant = getElement("merchantInput").value.trim() || "Merchant";
    const invoice = getElement("invoiceInput").value.trim() || "OP-1000";
    const amount = getElement("checkoutInput").value.trim() || "0";
    const result = getElement("intentResult");
    result.textContent = "Creating checkout intent...";
    const intent = await postJson("/payment-intents", {
        merchant,
        invoice,
        amount,
        asset: "USDC"
    });
    demoState.lastIntent = invoice.toLowerCase();
    getElement("paymentLink").textContent = `https://pay.orbitkit.dev/i/${demoState.lastIntent}`;
    getElement("checkoutAmount").textContent = formatMoney(amount);
    result.textContent = `Intent ${intent.id} is ready for ${merchant}.`;
});
getElement("newSession").addEventListener("click", () => {
    showView("funding");
});

