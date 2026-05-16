# OrbitPay Client

Polished web interface for OrbitPay Kit, a C-address onboarding and payment toolkit for Stellar/Soroban apps.

## What This Demo Shows

- Create a C-address funding session.
- Preview G-address to C-address routing.
- Generate a merchant checkout intent.
- Inspect SDK payloads and integration surfaces.
- Explore a responsive checkout experience for desktop and mobile.

## Run

Open `index.html` directly in a browser, or run:

```powershell
node preview.mjs
```

The preview server listens on `http://localhost:5173`.

Optional local API:

1. Start `orbitpay-server`.
2. Open this client.
3. The demo will use `http://localhost:8787` when available.

## Production Work Remaining

- Freighter and WalletConnect transaction signing.
- Live Stellar RPC/Horizon payment tracking.
- CEX withdrawal routing UX.
- Soroban contract integration once the contract package is complete.
- Hosted deployment and telemetry.
