# DualVerifier 🛡️
### Privacy-Preserving Dual-Rail Transaction Verifier & Forensic Explorer
> **Track:** Intelligence: AI and Web3 Without Borders  
> **Event:** BlockchainUNN Hackathon  
> **Architecture:** Dual-Rail Verification + Zcash 512-Byte Encrypted Shielded Memo Registry

---

## 1. Executive Summary & Core Vision
DualVerifier bridges local traditional banking (Web2) and zero-knowledge decentralized privacy (Web3):

1. **Rail 1 (Web2 Local Bank Verifier):**
   - Verifies Nigerian bank receipts (OPay, Moniepoint, GTBank, Access, Zenith, PalmPay, Kuda, etc.) using **Gemini 1.5 Flash Vision OCR** + deterministic **30-digit NIBSS Session ID mathematical decoding** (CBN bank code routing, WAT timestamp alignment within 120s, and Shannon entropy randomness).
   - Generates a SHA-256 cryptographic receipt fingerprint and **anchors it inside a Zcash 512-Byte Encrypted Memo** (ZIP-302 standard) to prevent cross-merchant double-spending/reusing receipts while preserving financial privacy.
2. **Rail 2 (Web3 Zcash Shielded & Transparent Verifier):**
   - A human-readable "Blue Card" explorer for **Zcash (ZEC)**.
   - Verifies Transparent (`t1...`/`t3...`) and Shielded Orchard/Sapling (`u1...` Unified Addresses & `zs1...`) transactions.
   - Implements **Selective Disclosure** via Unified Viewing Keys (`uview1...` / `uivk1...`) to decrypt shielded amounts and 512-byte memos into a printable certificate without exposing the user's private spending key or wallet balance.

---

## 2. Project Architecture & Modular Structure

```text
dualverifier/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── cbnBankCodes.ts          # 6-digit CBN bank prefixes (GTBank 000013, Moniepoint 090405, OPay 100004, etc.)
│   │   ├── services/
│   │   │   ├── nibssVerifier.ts         # 30-digit NIBSS Session ID decoder + Gemini Vision OCR receipt forensics
│   │   │   ├── zcashVerifier.ts         # Zcash Transparent + Shielded (Orchard/Sapling) tx & Unified Address (ZIP-316) decoder
│   │   │   └── zcashMemoRegistry.ts     # Encodes/decodes SHA-256 receipt proofs into 512-byte Zcash Encrypted Hex Memos
│   │   ├── data/
│   │   │   └── mockDemoPresets.ts       # Deterministic presets for flawless live stage demo
│   │   └── server.ts                    # Express API routes
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── NavbarLogo.vue           # DualVerifier interlocking shield SVG logo + network status badge
    │   │   ├── ModeToggle.vue           # Switch between [🏦 Local Bank Verifier] and [🛡️ Zcash On-Chain Verifier]
    │   │   ├── LocalBankVerifier.vue    # Drag-and-drop receipt upload + 30-digit Session ID input
    │   │   ├── ZcashChainVerifier.vue   # Zcash TxID + Unified Address (u1...) + Viewing Key (uview.../uivk...) input
    │   │   ├── BlueVerificationCard.vue # The unified "Sender ➔ Rail/Pool ➔ Receiver" forensic breakdown + Blue Tick Certificate
    │   │   └── DemoPresetBar.vue        # 3 one-click judge test buttons for live stage presentation
    │   ├── App.vue
    │   └── main.ts
    └── package.json
```

---

## 3. The 3-Minute Hackathon Pitch Script (Judge Demo Flow)

The top of the UI features 1-click **Stage Presets** ([`DemoPresetBar.vue`](file:///c:/Users/User/Desktop/dualVerifiier/frontend/src/components/DemoPresetBar.vue)):

* **Minute 1: The Problem**
  * Nigerian merchants lose revenue to fake-alert apps, Canva-edited receipts, and duplicate screenshot forwarding. Concurrently, Web3 merchants cannot verify privacy-preserving Zcash shielded payments without exposing their entire wallet.
* **Minute 2: Rail 1 — Local Bank Forensics & Zcash Memo Anchoring**
  * Click **Preset 1 (Genuine GTB ➔ OPay)**: Watch the 30-digit NIBSS Session ID decode into CBN code `000013`, timestamp alignment, and high entropy. The SHA-256 fingerprint is anchored inside a **Zcash 512-Byte Encrypted Memo** on Orchard block `#2549103`.
  * Click **Preset 2 (Forged Fake Alert)**: The engine detects that the receipt logo claims GTBank, but the session ID encodes Access Bank (`000014`), and the serial ends with repeating dummy digits (`111111111111`), immediately triggering the **CRIMSON FORGERY ALERT**.
* **Minute 3: Rail 2 — Zcash Selective Disclosure & Replay Interception**
  * Click **Preset 3 (Zcash Shielded Orchard)**: Demonstrates Unified Address (`u1...`) + Unified Viewing Key (`uview1...`). Selectively discloses `2.45000000 ZEC` and decrypts the 512-byte encrypted memo without revealing private spending keys.
  * Click **Test Replay Attack**: Re-submits Preset 1—the Zcash Shielded Memo Registry intercepts the duplicate proof and flashes the **AMBER DUPLICATE / ALREADY CLAIMED (ATTEMPT #2)** badge with zero double-spending!

---

## 4. Quick Start & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run both Backend & Frontend concurrently
npm run dev
```

* **Frontend:** [http://localhost:5180](http://localhost:5180)
* **Backend API:** [http://localhost:3001](http://localhost:3001)

### Key API Endpoints
* `POST /api/verify/local` — Verifies Nigerian bank receipt & anchors fingerprint into Zcash 512-Byte Shielded Memo
* `POST /api/verify/zcash` — Verifies Zcash transaction (Transparent / Shielded) with optional Viewing Key
* `GET /api/presets` — Retrieves 3 one-click stage demo test presets
* `GET /api/zcash/memos` — Retrieves all anchored Zcash 512-byte memos in the anti-replay registry
* `POST /api/zcash/reset/:proofHash` — Resets a proof for presenter demo cycles
