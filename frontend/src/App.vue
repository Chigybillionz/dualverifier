<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
    <!-- Navbar with Interlocking Shield Logo -->
    <NavbarLogo :memoCount="shieldedMemos.length" @open-ledger="isLedgerOpen = true" />

    <!-- 3-Minute Hackathon Demo Preset Bar -->
    <DemoPresetBar
      @select-preset="handleSelectPreset"
      @trigger-replay="handleTriggerReplay"
    />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <!-- Hero Banner & Mode Toggle -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div class="space-y-2">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-slate-300">Dual-Rail Forensic Architecture:</span>
            <span class="text-blue-400 font-bold">NIBSS + Zcash Shielded Memos</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            Privacy-Preserving <span class="bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-400 bg-clip-text text-transparent">Transaction Verifier</span>
          </h2>
          <p class="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Verify Nigerian banking receipts with deterministic NIBSS mathematics and anchor anti-double-spend proofs inside 512-byte Zcash Encrypted Memos, or inspect Zcash Shielded Orchard notes via Selective Disclosure.
          </p>
        </div>

        <!-- Mode Toggle Switcher -->
        <div>
          <ModeToggle v-model:mode="activeRail" />
        </div>
      </div>

      <!-- Main Dual-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- LEFT COLUMN: Verifier Input Command Center (5 cols) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <!-- Accent Top Line -->
            <div
              class="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
              :class="activeRail === 'LOCAL_BANK' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400'"
            ></div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <span
                  class="w-2.5 h-2.5 rounded-full animate-pulse"
                  :class="activeRail === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-blue-400'"
                ></span>
                <h3 class="text-base font-bold text-white">
                  {{ activeRail === 'LOCAL_BANK' ? 'Rail 1: Local Bank Receipt Verifier' : 'Rail 2: Zcash On-Chain Verifier' }}
                </h3>
              </div>

              <!-- Button to view visual receipt if available -->
              <button
                v-if="activeRail === 'LOCAL_BANK' && currentPresetVisual"
                @click="isReceiptModalOpen = true"
                class="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-1"
              >
                <span>View Receipt</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>

            <!-- Rail 1 Component -->
            <LocalBankVerifier
              v-if="activeRail === 'LOCAL_BANK'"
              ref="localVerifierRef"
              :isLoading="isLoading"
              @verify="handleVerifyLocal"
            />

            <!-- Rail 2 Component -->
            <ZcashChainVerifier
              v-else
              ref="zcashVerifierRef"
              :isLoading="isLoading"
              @verify="handleVerifyZcash"
            />
          </div>

          <!-- Privacy Architecture Explainer Card -->
          <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
            <div class="font-bold text-slate-300 flex items-center justify-between">
              <span class="text-blue-400 font-mono">Zcash 512-Byte Memo Privacy Protocol</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">ZIP-302</span>
            </div>
            <p class="text-slate-400 leading-relaxed">
              Every verified Nigerian banking transfer emits a SHA-256 fingerprint anchored inside a <strong class="text-slate-200">512-Byte Encrypted Zcash Memo</strong>. This mathematically prevents double-spending across merchant locations without disclosing sender/receiver banking identities to public observers.
            </p>
          </div>
        </div>

        <!-- RIGHT COLUMN: The Hero Blue Verification Card (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div v-if="activeBlueCard">
            <BlueVerificationCard
              :card="activeBlueCard"
              @open-certificate="handleOpenCertificate"
            />
          </div>

          <!-- Empty State / Standby Screen -->
          <div
            v-else
            class="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center flex flex-col items-center justify-center space-y-4"
          >
            <div class="w-20 h-20 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
              <svg class="w-10 h-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div class="max-w-sm space-y-1">
              <h3 class="text-base font-bold text-slate-200">Forensic Verifier Standby</h3>
              <p class="text-xs text-slate-400">
                Upload a Nigerian bank receipt, input a 30-digit NIBSS session ID, or query a Zcash Shielded transaction with a viewing key to render the Blue Tick Certificate.
              </p>
            </div>
            <div class="pt-2">
              <button
                @click="handleSelectPreset('preset-valid-gtb-opay')"
                class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-sm"
              >
                Run Preset 1: Genuine GTBank Receipt Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODULE 4: LIVE VERIFICATION AUDIT LEDGER TABLE AT BOTTOM OF PAGE -->
      <section class="pt-6 border-t border-slate-800">
        <VerificationHistoryDrawer
          :items="auditHistoryItems"
          @select-history-item="handleSelectHistoryItem"
        />
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500 mt-12">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center space-x-2">
          <span>DualVerifier • Built for BlockchainUNN Hackathon</span>
          <span>•</span>
          <span class="text-blue-400">Track: Intelligence: AI & Web3 Without Borders</span>
        </div>
        <div class="flex items-center space-x-4 font-mono text-[11px]">
          <span>Zcash Shielded Orchard & Sapling</span>
          <span>•</span>
          <span>Gemini 1.5 Flash Vision</span>
          <span>•</span>
          <span>30-Digit NIBSS Math</span>
        </div>
      </div>
    </footer>

    <!-- MODULE 3: PRINTABLE / SHAREABLE "BLUE TICK" QR VERIFICATION CERTIFICATE MODAL -->
    <ProofCertificateModal
      :isOpen="isCertificateModalOpen"
      :card="certificateModalCard"
      @close="isCertificateModalOpen = false"
      @trigger-replay-from-modal="handleTriggerReplay"
    />

    <!-- Shielded Memos Ledger Slide-Over Drawer -->
    <div v-if="isLedgerOpen" class="fixed inset-0 z-50 overflow-hidden">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isLedgerOpen = false"></div>
      <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div class="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                🛡️
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Zcash Shielded Memo Ledger</h3>
                <p class="text-[11px] text-slate-400 font-mono">ZIP-302 Encrypted 512-Byte Anti-Replay Attestations</p>
              </div>
            </div>
            <button @click="isLedgerOpen = false" class="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
              <span class="text-slate-400 block text-[10px] uppercase font-mono">Anchored Memos</span>
              <span class="text-xl font-bold text-blue-400 font-mono">{{ shieldedMemos.length }}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
              <span class="text-slate-400 block text-[10px] uppercase font-mono">Replays Blocked</span>
              <span class="text-xl font-bold text-amber-400 font-mono">{{ totalReplaysBlocked }}</span>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div v-if="shieldedMemos.length === 0" class="text-center py-12 text-slate-500 text-xs">
              No shielded memos anchored yet. Verify a bank receipt to anchor the first proof!
            </div>
            <div
              v-for="(rec, idx) in shieldedMemos"
              :key="idx"
              class="p-3.5 rounded-xl bg-slate-850 border border-slate-800 text-xs space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  Block #{{ rec.zcashBlockHeight }} • {{ rec.zcashPool }}
                </span>
                <span
                  class="text-[10px] font-mono px-2 py-0.5 rounded"
                  :class="rec.claimCount > 1 ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'text-slate-400'"
                >
                  Claims: {{ rec.claimCount }}
                </span>
              </div>
              <p class="font-mono text-slate-200 text-xs font-semibold truncate">{{ rec.sender }} ➔ {{ rec.receiver }}</p>
              <p class="font-mono text-emerald-400 font-bold text-xs">₦{{ Number(rec.amount).toLocaleString() }}</p>
              <div class="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400 break-words">
                {{ rec.memoUtf8 }}
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                <a :href="`https://blockchair.com/zcash/transaction/${rec.zcashAnchorTxId}`" target="_blank" class="text-blue-400 hover:underline">
                  View Zcash TxID ➔
                </a>
                <button @click="handleResetRecord(rec.proofHash)" class="text-slate-500 hover:text-rose-400">
                  Reset Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Visual Modal -->
    <ReceiptVisualModal
      :isOpen="isReceiptModalOpen"
      :receipt="currentPresetVisual"
      @close="isReceiptModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import confetti from 'canvas-confetti';
import NavbarLogo from './components/NavbarLogo.vue';
import DemoPresetBar from './components/DemoPresetBar.vue';
import ModeToggle from './components/ModeToggle.vue';
import LocalBankVerifier from './components/LocalBankVerifier.vue';
import ZcashChainVerifier from './components/ZcashChainVerifier.vue';
import BlueVerificationCard from './components/BlueVerificationCard.vue';
import ProofCertificateModal from './components/ProofCertificateModal.vue';
import VerificationHistoryDrawer, { HistoryAuditItem } from './components/VerificationHistoryDrawer.vue';
import ReceiptVisualModal from './components/ReceiptVisualModal.vue';

const activeRail = ref<'LOCAL_BANK' | 'ZCASH'>('LOCAL_BANK');
const isLoading = ref(false);
const isLedgerOpen = ref(false);
const isReceiptModalOpen = ref(false);
const isCertificateModalOpen = ref(false);

const activeBlueCard = ref<any>(null);
const certificateModalCard = ref<any>(null);
const shieldedMemos = ref<any[]>([]);
const currentPresetVisual = ref<any>(null);

const localVerifierRef = ref<any>(null);
const zcashVerifierRef = ref<any>(null);

let demoPresets: any[] = [];

// Pre-populated realistic session entries for the live audit ledger
const auditHistoryItems = ref<HistoryAuditItem[]>([
  {
    id: 'hist-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    rail: 'LOCAL_BANK',
    sender: 'Alhaji Ibrahim Danladi (Zenith Bank)',
    receiver: 'Chukwudi Superstores (Moniepoint)',
    amount: '₦120,000.00',
    currency: 'NGN',
    proofHash: '0x4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    status: 'VERIFIED',
    badgeTitle: 'VERIFIED AUTHENTIC',
    fullBlueCard: {
      rail: 'LOCAL_BANK',
      status: 'VERIFIED',
      badgeTitle: 'VERIFIED AUTHENTIC',
      badgeColor: 'emerald',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      proofHash: '0x4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      routingPipeline: {
        sender: {
          title: 'Originating Sender (Web2)',
          identifier: 'Alhaji Ibrahim Danladi',
          institution: 'Zenith Bank PLC (000015)',
          bankLogoColor: '#c51b24',
          verified: true
        },
        rail: {
          type: 'NIBSS Instant Payment (NIP)',
          identifier: '000015250410123045982143658709',
          timestamp: '10 Apr 2025, 12:30:45',
          protocol: 'CBN Gateway + Zcash Shielded Memo Anchor',
          verified: true
        },
        receiver: {
          title: 'Settled Recipient (Merchant)',
          identifier: 'Chukwudi Superstores (2210984532)',
          institution: 'Moniepoint MFB',
          amountFormatted: '₦120,000.00',
          currency: 'NGN',
          verified: true
        }
      },
      forensics: {
        flags: []
      },
      zcashShieldedAnchor: {
        proofHash: '0x4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        zcashTxId: '0x99281a8c3d2e1f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
        blockHeight: 2548810,
        zcashPool: 'ORCHARD',
        memoUtf8: '[DUALVERIFIER-ZCASH-PROOF-2026] PROOF:0x4f8a...9f0a | AMT:120000 NGN | FROM:Zenith Bank | TO:Moniepoint | AT:2025-04-10T12:30:45Z',
        claimCount: 1,
        firstAnchoredIso: new Date(Date.now() - 3600000).toISOString(),
        isReplayAttack: false,
        explorerUrl: 'https://blockchair.com/zcash/transaction/0x99281a8c3d2e1f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a'
      }
    }
  },
  {
    id: 'hist-2',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    rail: 'ZCASH',
    sender: 'Shielded Orchard Pool (Halo 2)',
    receiver: 'u1q4k9n7e8...a6c8e0g2',
    amount: '5.10000000 ZEC',
    currency: 'ZEC',
    proofHash: '0x7e2d9a1c4b5f8e0a3d6c9b2e5a8f1d4c7b0e3a6f9d2c5b8e1a4d7c0f3b6e9a2d',
    status: 'VERIFIED',
    badgeTitle: 'SHIELDED VERIFIED (SELECTIVE DISCLOSURE)',
    fullBlueCard: {
      rail: 'ZCASH',
      status: 'VERIFIED',
      badgeTitle: 'SHIELDED VERIFIED (SELECTIVE DISCLOSURE)',
      badgeColor: 'blue',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      proofHash: '0x7e2d9a1c4b5f8e0a3d6c9b2e5a8f1d4c7b0e3a6f9d2c5b8e1a4d7c0f3b6e9a2d',
      routingPipeline: {
        sender: {
          title: 'Sender Pool (From)',
          identifier: 'Shielded Pool (Halo 2 ZK)',
          institution: 'Zcash Orchard Pool',
          bankLogoColor: '#3b82f6',
          verified: true
        },
        rail: {
          type: 'Zcash z-to-z (Shielded Orchard)',
          identifier: '0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
          timestamp: 'Zcash Mainnet • Block #2548980',
          protocol: 'Zcash Mainnet • Block #2548980',
          verified: true
        },
        receiver: {
          title: 'Recipient (To)',
          identifier: 'u1q4k9n7e8...a6c8e0g2',
          institution: 'Unified Address (ZIP-316)',
          amountFormatted: '5.10000000 ZEC',
          currency: 'ZEC',
          verified: true
        }
      },
      zcashDetails: {
        txid: '0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
        blockHeight: 2548980,
        confirmations: 122,
        memo: {
          selectiveDisclosureActive: true,
          decryptedText: 'BUNN Merchant Payment: Global Settlement 5.10 ZEC | Zero-Knowledge Proven'
        },
        selectiveDisclosure: {
          isValidDisclosure: true,
          disclosureStatement: 'Decrypted via Selective Disclosure (Unified Viewing Key uview1...). Note amount and 512-byte memo revealed.'
        }
      },
      forensics: { flags: [] }
    }
  }
]);

const totalReplaysBlocked = computed(() => {
  return shieldedMemos.value.reduce((sum, r) => sum + Math.max(0, (r.claimCount || 1) - 1), 0);
});

// MODULE 2: Mirror claimed hashes to frontend localStorage
function mirrorHashToLocalStorage(proofHash: string, metadata: any) {
  try {
    const raw = localStorage.getItem('dualverifier_claimed_hashes') || '{}';
    const store = JSON.parse(raw);
    if (!store[proofHash]) {
      store[proofHash] = {
        firstVerifiedAt: new Date().toISOString(),
        claimCount: 1,
        metadata
      };
    } else {
      store[proofHash].claimCount += 1;
      store[proofHash].lastReplayedAt = new Date().toISOString();
    }
    localStorage.setItem('dualverifier_claimed_hashes', JSON.stringify(store));
  } catch (err) {
    // Ignore localStorage errors
  }
}

async function fetchShieldedMemos() {
  try {
    const res = await fetch('/api/zcash/memos');
    const json = await res.json();
    if (json.success && json.records) {
      shieldedMemos.value = json.records;
    }
  } catch (err) {
    console.warn('Failed to load memos:', err);
  }
}

async function fetchAuditHistory() {
  try {
    const res = await fetch('/api/history');
    const json = await res.json();
    if (json.success && json.history && json.history.length > 0) {
      for (const item of json.history) {
        if (!auditHistoryItems.value.some(h => h.proofHash === item.memoHash)) {
          auditHistoryItems.value.push({
            id: `server-${item.id}`,
            timestamp: item.timestamp,
            rail: item.rail,
            sender: item.sender,
            receiver: item.receiver,
            amount: item.amountFormatted,
            currency: item.currency,
            proofHash: item.memoHash,
            status: item.status,
            badgeTitle: item.badgeTitle,
            fullBlueCard: null
          });
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load history:', err);
  }
}

async function fetchPresets() {
  try {
    const res = await fetch('/api/presets');
    const json = await res.json();
    if (json.success && json.presets) {
      demoPresets = json.presets;
    }
  } catch (err) {
    console.warn('Failed to load presets:', err);
  }
}

onMounted(() => {
  fetchPresets();
  fetchShieldedMemos();
  fetchAuditHistory();
});

function fireConfetti() {
  try {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ffffff']
    });
  } catch (err) {}
}

function appendToAuditHistory(card: any) {
  const newItem: HistoryAuditItem = {
    id: `audit-${Date.now()}`,
    timestamp: card.timestamp || new Date().toISOString(),
    rail: card.rail,
    sender: card.routingPipeline?.sender?.identifier || 'Sender',
    receiver: card.routingPipeline?.receiver?.identifier || 'Receiver',
    amount: card.routingPipeline?.receiver?.amountFormatted || 'N/A',
    currency: card.routingPipeline?.receiver?.currency || '',
    proofHash: card.proofHash,
    status: card.status,
    badgeTitle: card.badgeTitle,
    fullBlueCard: card
  };

  // Prepend to list so newest is on top
  auditHistoryItems.value.unshift(newItem);
  mirrorHashToLocalStorage(card.proofHash, {
    sender: newItem.sender,
    receiver: newItem.receiver,
    amount: newItem.amount
  });
}

async function handleVerifyLocal(payload: any) {
  isLoading.value = true;
  try {
    let res: Response;
    if (payload.mode === 'file') {
      res = await fetch('/api/verify/local', {
        method: 'POST',
        body: payload.formData
      });
    } else {
      res = await fetch('/api/verify/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.data)
      });
    }

    const data = await res.json();
    if (data.success && data.blueCard) {
      activeBlueCard.value = data.blueCard;
      appendToAuditHistory(data.blueCard);
      if (data.blueCard.status === 'VERIFIED') fireConfetti();
      await fetchShieldedMemos();
    } else {
      alert(data.error || 'Verification failed');
    }
  } catch (err: any) {
    alert(err.message || 'Connection error');
  } finally {
    isLoading.value = false;
  }
}

async function handleVerifyZcash(payload: any) {
  isLoading.value = true;
  try {
    const res = await fetch('/api/verify/zcash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success && data.blueCard) {
      activeBlueCard.value = data.blueCard;
      appendToAuditHistory(data.blueCard);
      if (data.blueCard.status === 'VERIFIED') fireConfetti();
    } else {
      alert(data.error || 'Zcash verification error');
    }
  } catch (err: any) {
    alert(err.message || 'Connection error');
  } finally {
    isLoading.value = false;
  }
}

function handleSelectPreset(presetId: string) {
  const p = demoPresets.find(item => item.id === presetId);
  if (p) {
    currentPresetVisual.value = p.receiptVisual || null;
    if (p.rail === 'LOCAL_BANK') {
      activeRail.value = 'LOCAL_BANK';
      handleVerifyLocal({
        mode: 'json',
        data: p.payload
      });
    } else {
      activeRail.value = 'ZCASH';
      handleVerifyZcash(p.payload);
    }
    return;
  }

  // Fallback if presets endpoint not yet cached
  if (presetId === 'demo-1-valid-gtb-150k' || presetId === 'preset-valid-gtb-opay') {
    activeRail.value = 'LOCAL_BANK';
    handleVerifyLocal({
      mode: 'json',
      data: {
        sessionId: '000013260315143022100004998231',
        senderBank: 'Guaranty Trust Bank (GTBank)',
        senderName: 'Chibuike Okonkwo',
        receiverBank: 'OPay Digital Services Limited',
        receiverName: 'Lekki Gadget Depot Ltd',
        receiverAccount: '9012345678',
        amount: 150000,
        currency: 'NGN',
        receiptTimestamp: '2026-03-15T14:30:22+01:00',
        claimantMerchant: 'Lekki Gadget Depot Ltd'
      }
    });
  } else if (presetId === 'demo-2-fake-opay-alert' || presetId === 'preset-forged-fake-alert') {
    activeRail.value = 'LOCAL_BANK';
    handleVerifyLocal({
      mode: 'json',
      data: {
        sessionId: '000014240101000000111111111111',
        senderBank: 'Guaranty Trust Bank (GTBank)',
        senderName: 'Adeola Bakare (Spoofed)',
        receiverBank: 'OPay Digital Services Limited',
        receiverName: 'Emmanuel Chukwuma (Store Owner)',
        receiverAccount: '8034567890',
        amount: 85000,
        currency: 'NGN',
        receiptTimestamp: '2026-11-04T14:30:00+01:00',
        simulatedTamperScore: 24,
        flaggedSoftware: 'CANVA / FAKE ALERT APK GENERATOR'
      }
    });
  } else if (presetId === 'demo-3-zcash-shielded-u1' || presetId === 'preset-zcash-shielded-disclosure') {
    activeRail.value = 'ZCASH';
    handleVerifyZcash({
      txid: '0xf9b8c2d1e0a987654321fedcba0987654321fedcba0987654321fedcba098765',
      unifiedAddress: 'u1z0987654321abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef0123456789',
      viewingKey: 'uview1q8h0e8d7s6a5z4x3c2v1b0n9m8l7k6j5h4g3f2d1s0a9z8y7x6w5v4u3t2r1'
    });
  } else if (presetId === 'demo-4-reused-receipt-replay') {
    handleTriggerReplay();
  }
}

function handleTriggerReplay() {
  activeRail.value = 'LOCAL_BANK';
  handleVerifyLocal({
    mode: 'json',
    data: {
      sessionId: '000013260315143022100004998231',
      senderBank: 'Guaranty Trust Bank (GTBank)',
      senderName: 'Chibuike Okonkwo',
      receiverBank: 'OPay Digital Services Limited',
      receiverName: 'Lekki Gadget Depot Ltd',
      receiverAccount: '9012345678',
      amount: 150000,
      currency: 'NGN',
      receiptTimestamp: '2026-03-15T14:30:22+01:00',
      claimantMerchant: 'Victoria Island Branch (Replay Attempt)'
    }
  });
}

function handleOpenCertificate(card: any) {
  certificateModalCard.value = card;
  isCertificateModalOpen.value = true;
}

function handleSelectHistoryItem(item: HistoryAuditItem) {
  activeBlueCard.value = item.fullBlueCard;
  certificateModalCard.value = item.fullBlueCard;
  isCertificateModalOpen.value = true;
  activeRail.value = item.rail;
}

async function handleResetRecord(proofHash: string) {
  try {
    await fetch(`/api/zcash/reset/${proofHash}`, { method: 'POST' });
    await fetchShieldedMemos();
    if (activeBlueCard.value?.proofHash === proofHash) {
      activeBlueCard.value = null;
    }
  } catch (err) {
    console.warn('Failed to reset proof:', err);
  }
}
</script>
