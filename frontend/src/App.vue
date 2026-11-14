<template>
  <div class="min-h-screen bg-[#090D1A] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
    <!-- 1. Top Navigation Bar with DualVerifier + Pollar Brand & Integrated Rail Selector -->
    <NavbarLogo
      :activeRail="activeRail"
      :memoCount="shieldedMemos.length"
      :userHistoryCount="personalHistoryCount"
      @update:activeRail="activeRail = $event"
      @open-ledger="isLedgerOpen = true"
      @open-guide="isGuideOpen = true"
      @open-history="scrollToHistory"
      @open-did-account="isDidModalOpen = true"
    />

    <!-- 2. 1-Click Test Lab (Sticky, Evenly-Aligned Scenarios) -->
    <DemoPresetBar
      :activePresetId="currentActivePresetId"
      @select-preset="handleSelectPreset"
      @trigger-replay="handleTriggerReplay"
    />

    <!-- 3. Main Workspace Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pb-12 space-y-6">
      
      <!-- 3-Step Guided Workflow Pipeline (Horizontally scrollable on mobile without overflow) -->
      <div id="verifier-section" class="py-2 border-b border-white/10">
        <div class="flex items-center justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar px-4 py-3 text-xs font-mono select-none">
          <div class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 shrink-0">
            <span class="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">1</span>
            <span>Provide Receipt / Ref ID</span>
          </div>
          <span class="text-slate-600 shrink-0">➔</span>
          <div class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 shrink-0">
            <span class="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">2</span>
            <span>AI Forensics & NIBSS Match</span>
          </div>
          <span class="text-slate-600 shrink-0">➔</span>
          <div class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-emerald-500/40 text-emerald-400 font-bold shrink-0">
            <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">3</span>
            <span>Gasless USDC Escrow Payout</span>
          </div>
        </div>
      </div>

      <!-- Main Dual-Column Workspace (Gestalt: Proximity & Common Region) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- LEFT COLUMN: Verifier Input Command Center (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="bg-[#0F1624] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <!-- Accent Top Line in Emerald / Blue -->
            <div
              class="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
              :class="activeRail === 'LOCAL_BANK' ? 'bg-gradient-to-r from-blue-500 to-emerald-400' : 'bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400'"
            ></div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <span
                  class="w-2.5 h-2.5 rounded-full animate-pulse"
                  :class="activeRail === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-blue-400'"
                ></span>
                <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider font-mono text-white">
                  {{ activeRail === 'LOCAL_BANK' ? 'Bank Receipt Verifier (NIBSS)' : 'Pollar Stellar Web3 Explorer' }}
                </h3>
              </div>

              <!-- Button to view visual receipt if available -->
              <button
                v-if="activeRail === 'LOCAL_BANK' && currentPresetVisual"
                @click="isReceiptModalOpen = true"
                class="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 transition-colors"
                title="View original receipt image"
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
              @reset-verification="activeBlueCard = null"
            />

            <!-- Rail 2 Component -->
            <PollarChainVerifier
              v-else
              ref="pollarVerifierRef"
              :isLoading="isLoading"
              @verify="handleVerifyPollar"
            />
          </div>

          <!-- Pollar Gasless Protocol Explainer Card -->
          <div id="privacy-protocol" class="p-4 rounded-2xl bg-[#0F1624] border border-white/10 text-xs space-y-2">
            <div class="font-bold text-slate-200 flex items-center justify-between font-mono">
              <span class="text-blue-400 flex items-center gap-1.5">
                <span>🛡️ Pollar Smart Escrow</span>
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                0 XLM Gas • Stellar Testnet
              </span>
            </div>
            <p class="text-slate-400 leading-relaxed text-[11px]">
              Every verified Nigerian banking transfer anchors a cryptographic proof onto Stellar via <strong class="text-slate-200">Pollar (@pollar/core)</strong>. Pollar's paymaster sponsors 100% of user network fees, allowing merchants to settle in USDC with zero XLM and zero seed phrases.
            </p>
          </div>
        </div>

        <!-- RIGHT COLUMN: The Hero Verification Card (7 cols) -->
        <div id="verification-result" class="lg:col-span-7 space-y-4">
          <div v-if="activeBlueCard">
            <BlueVerificationCard
              :card="activeBlueCard"
              @open-certificate="handleOpenCertificate"
              @reset-replay="handleResetReplay"
            />
          </div>

          <!-- Empty State / Standby Screen (Nielsen #1: Visibility of System Status) -->
          <div
            v-else
            class="rounded-3xl border border-white/10 bg-[#0F1624] p-6 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl"
          >
            <div class="w-14 h-14 rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <svg class="w-7 h-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            <div class="max-w-md space-y-1.5">
              <h3 class="text-base sm:text-lg font-bold text-white">Verification Engine Standby</h3>
              <p class="text-xs text-slate-400 leading-relaxed">
                Upload a payment receipt on the left, paste a session reference ID, or tap any 1-click test scenario above to see instant forensic verification.
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                @click="handleSelectPreset('demo-1-valid-gtb-150k')"
                class="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                ✓ Test Valid ₦150k
              </button>

              <button
                @click="handleSelectPreset('demo-2-fake-opay-alert')"
                class="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-rose-600/80 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-500/20 active:scale-95"
              >
                🚨 Test Fake Canva Alert
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- DEDICATED USER AUTHENTICATION HISTORY DASHBOARD (Requirement 3: Dedicated Dashboard) -->
      <AuthenticationHistoryDashboard
        ref="authHistoryDashboardRef"
        @select-record="handleSelectAuthRecord"
        @record-deleted="handleRecordDeleted"
        @history-cleared="handleHistoryCleared"
      />

      <!-- MODULE 4: LIVE ON-CHAIN CLAIMS LEDGER (PUBLIC BLOCKCHAIN ANCHORS) -->
      <section id="audit-ledger" class="pt-2 sm:pt-4 border-t border-slate-800/80">
        <details class="group rounded-3xl bg-[#0E1424] border border-slate-800 p-4">
          <summary class="cursor-pointer font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white flex items-center justify-between list-none select-none">
            <span class="flex items-center gap-2">
              <span>📜 Live Verification Claims Ledger</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {{ auditHistoryItems.length }}
              </span>
            </span>
            <span class="text-slate-500 text-xs transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div class="mt-4">
            <VerificationHistoryDrawer
              :items="auditHistoryItems"
              @select-history-item="handleSelectHistoryItem"
            />
          </div>
        </details>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 bg-[#060912] py-6 text-xs text-slate-500 mt-8">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center space-x-2">
          <span>DualVerifier • Built for BlockchainUNN Hackathon</span>
          <span>•</span>
          <span class="text-blue-400">Intelligence: AI & Web3 Without Borders</span>
        </div>
        <div class="flex items-center space-x-4 font-mono text-[11px]">
          <span>Pollar SDK (@pollar/core)</span>
          <span>•</span>
          <span>Stellar Testnet</span>
          <span>•</span>
          <span>Gemini Vision</span>
        </div>
      </div>
    </footer>

    <!-- Anti-Fraud Guide Modal (Nielsen #10: Help & Documentation) -->
    <AntiFraudGuideModal
      :isOpen="isGuideOpen"
      @close="isGuideOpen = false"
    />

    <!-- DID Account & Device Isolation Modal (Requirement 1, 4 & 7) -->
    <DidAccountModal
      :isOpen="isDidModalOpen"
      @close="isDidModalOpen = false"
      @account-changed="handleAccountChanged"
    />

    <!-- MODULE 3: PRINTABLE / SHAREABLE QR VERIFICATION CERTIFICATE MODAL -->
    <ProofCertificateModal
      :isOpen="isCertificateModalOpen"
      :card="certificateModalCard"
      @close="isCertificateModalOpen = false"
      @trigger-replay-from-modal="handleTriggerReplay"
    />

    <!-- Pollar Stellar Escrow Ledger Slide-Over Drawer -->
    <div v-if="isLedgerOpen" class="fixed inset-0 z-50 overflow-hidden">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isLedgerOpen = false"></div>
      <div class="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div class="w-screen max-w-md bg-[#0E1424] border-l border-slate-800 p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 sm:space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                🛡️
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">Pollar Stellar Claims Ledger</h3>
                <p class="text-[11px] text-slate-400 font-mono">Decentralized Gasless Escrows & Anti-Double-Spend Registry</p>
              </div>
            </div>
            <button @click="isLedgerOpen = false" class="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span class="text-slate-400 block text-[10px] uppercase font-mono">Anchored Escrows</span>
              <span class="text-xl font-bold text-blue-400 font-mono">{{ shieldedMemos.length }}</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span class="text-slate-400 block text-[10px] uppercase font-mono">Replays Blocked</span>
              <span class="text-xl font-bold text-amber-400 font-mono">{{ totalReplaysBlocked }}</span>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1">
            <div v-if="shieldedMemos.length === 0" class="text-center py-12 text-slate-500 text-xs">
              No escrows anchored yet. Verify a bank receipt to anchor the first proof!
            </div>
            <div
              v-for="(rec, idx) in shieldedMemos"
              :key="idx"
              class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  Ledger #{{ rec.stellarLedgerSeq || rec.zcashBlockHeight }} • {{ rec.stellarNetwork || rec.zcashPool || 'Stellar Testnet' }}
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
              <div class="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 break-words">
                {{ rec.stellarMemoText || rec.memoUtf8 || rec.proofHash }}
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                <a :href="rec.explorerUrl || `https://stellar.expert/explorer/testnet/tx/${rec.stellarTxHash}`" target="_blank" class="text-blue-400 hover:underline">
                  View Stellar TxID ➔
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
import LocalBankVerifier from './components/LocalBankVerifier.vue';
import PollarChainVerifier from './components/PollarChainVerifier.vue';
import BlueVerificationCard from './components/BlueVerificationCard.vue';
import ProofCertificateModal from './components/ProofCertificateModal.vue';
import AntiFraudGuideModal from './components/AntiFraudGuideModal.vue';
import VerificationHistoryDrawer, { HistoryAuditItem } from './components/VerificationHistoryDrawer.vue';
import ReceiptVisualModal from './components/ReceiptVisualModal.vue';
import AuthenticationHistoryDashboard from './components/AuthenticationHistoryDashboard.vue';
import DidAccountModal from './components/DidAccountModal.vue';
import {
  initAuth,
  currentUser,
  currentSession,
  isDeveloper,
  getAuthHeaders,
  type AuthenticationHistoryRecord
} from './utils/auth';
import { apiUrl } from './utils/api';
import { MOCK_DEMO_PRESETS } from './data/mockDemoPresets';

const activeRail = ref<'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH'>('LOCAL_BANK');
const currentActivePresetId = ref<string | null>(null);
const isLoading = ref(false);
const isLedgerOpen = ref(false);
const isGuideOpen = ref(false);
const isReceiptModalOpen = ref(false);
const isCertificateModalOpen = ref(false);
const isDidModalOpen = ref(false);

const activeBlueCard = ref<any>(null);
const certificateModalCard = ref<any>(null);
const shieldedMemos = ref<any[]>([]);
const currentPresetVisual = ref<any>(null);

const localVerifierRef = ref<any>(null);
const pollarVerifierRef = ref<any>(null);
const authHistoryDashboardRef = ref<any>(null);

const personalHistoryCount = ref(0);

let demoPresets: any[] = [...MOCK_DEMO_PRESETS];

// Session audit ledger starts clean - zero cross-account data leaks
const auditHistoryItems = ref<HistoryAuditItem[]>([]);

const totalReplaysBlocked = computed(() => {
  return shieldedMemos.value.reduce((sum, r) => sum + Math.max(0, (r.claimCount || 1) - 1), 0);
});

// Mirror claimed hashes to frontend localStorage
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
    const res = await fetch(apiUrl('/api/pollar/escrows'));
    const json = await res.json();
    if (json.success && json.records) {
      shieldedMemos.value = json.records;
      return;
    }
  } catch (err) {}
}

async function fetchPersonalHistory() {
  try {
    const res = await fetch(apiUrl('/api/authentication-history/me?limit=1'), {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stats) {
        personalHistoryCount.value = data.stats.totalVerifications || 0;
      }
    }
  } catch (err) {
    console.warn('Failed to load personal history stats:', err);
  }
}

async function fetchPresets() {
  try {
    const res = await fetch(apiUrl('/api/presets'));
    const json = await res.json();
    if (json.success && json.presets && json.presets.length > 0) {
      demoPresets = json.presets;
    }
  } catch (err) {
    console.warn('Failed to load presets, using pre-bundled hackathon test vectors:', err);
  }
}

onMounted(async () => {
  await initAuth();
  fetchPresets();
  fetchShieldedMemos();
  fetchPersonalHistory();
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
  if (payload.mode === 'file') {
    currentActivePresetId.value = null;
  }
  isLoading.value = true;
  try {
    const authHeaders = getAuthHeaders();
    let res: Response;
    if (payload.mode === 'file') {
      const headers: Record<string, string> = {};
      if (authHeaders['Authorization']) {
        headers['Authorization'] = authHeaders['Authorization'];
      }
      res = await fetch(apiUrl('/api/verify/local'), {
        method: 'POST',
        headers,
        body: payload.formData
      });
    } else {
      res = await fetch(apiUrl('/api/verify/local'), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload.data)
      });
    }

    const data = await res.json();
    if (data.success && data.blueCard) {
      activeBlueCard.value = data.blueCard;
      appendToAuditHistory(data.blueCard);
      authHistoryDashboardRef.value?.refresh?.();
      await fetchPersonalHistory();
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

async function handleVerifyPollar(payload: any) {
  isLoading.value = true;
  try {
    const res = await fetch(apiUrl('/api/verify/pollar'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success && data.blueCard) {
      activeBlueCard.value = data.blueCard;
      appendToAuditHistory(data.blueCard);
      authHistoryDashboardRef.value?.refresh?.();
      await fetchPersonalHistory();
      if (data.blueCard.status === 'VERIFIED') fireConfetti();
    } else {
      alert(data.error || 'Pollar verification error');
    }
  } catch (err: any) {
    alert(err.message || 'Connection error');
  } finally {
    isLoading.value = false;
  }
}

function handleSelectPreset(presetId: string) {
  currentActivePresetId.value = presetId;
  const p = demoPresets.find(item => item.id === presetId);
  if (p) {
    currentPresetVisual.value = p.receiptVisual || null;
    if (p.rail === 'LOCAL_BANK') {
      activeRail.value = 'LOCAL_BANK';
      localVerifierRef.value?.loadPreset?.(p.payload);
      handleVerifyLocal({
        mode: 'json',
        data: p.payload
      });
    } else {
      activeRail.value = 'POLLAR_STELLAR';
      pollarVerifierRef.value?.loadPreset?.(p.payload);
      handleVerifyPollar(p.payload);
    }
    return;
  }

  // Fallback if presets endpoint not yet cached
  if (presetId === 'demo-1-valid-gtb-150k' || presetId === 'preset-valid-gtb-opay') {
    activeRail.value = 'LOCAL_BANK';
    const payload = {
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
    };
    localVerifierRef.value?.loadPreset?.(payload);
    handleVerifyLocal({
      mode: 'json',
      data: payload
    });
  } else if (presetId === 'demo-2-fake-opay-alert' || presetId === 'preset-forged-fake-alert') {
    activeRail.value = 'LOCAL_BANK';
    const payload = {
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
    };
    localVerifierRef.value?.loadPreset?.(payload);
    handleVerifyLocal({
      mode: 'json',
      data: payload
    });
  } else if (presetId === 'demo-3-pollar-stellar-settlement' || presetId === 'demo-3-zcash-shielded-u1') {
    activeRail.value = 'POLLAR_STELLAR';
    const payload = {
      txid: 'a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e',
      walletAddress: 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
      sessionId: '000013260315143022100004998231'
    };
    pollarVerifierRef.value?.loadPreset?.(payload);
    handleVerifyPollar(payload);
  } else if (presetId === 'demo-4-reused-receipt-replay') {
    handleTriggerReplay();
  }
}

function handleTriggerReplay() {
  currentActivePresetId.value = 'demo-4-reused-receipt-replay';
  activeRail.value = 'LOCAL_BANK';
  const replayPayload = {
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
  };
  localVerifierRef.value?.loadPreset?.(replayPayload);
  handleVerifyLocal({
    mode: 'json',
    data: replayPayload
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

function handleSelectAuthRecord(rec: AuthenticationHistoryRecord) {
  const card = {
    rail: rec.verificationResult.rail,
    status: rec.verificationStatus === 'SUCCESS' ? 'VERIFIED' : rec.verificationStatus,
    badgeTitle: rec.verificationResult.badgeTitle,
    badgeColor: rec.verificationResult.badgeColor,
    timestamp: rec.createdAt,
    proofHash: rec.verificationResult.proofHash,
    routingPipeline: {
      sender: {
        title: 'Originating Sender',
        identifier: rec.verificationResult.sender,
        institution: 'Verified DID Channel',
        bankLogoColor: '#3b82f6',
        verified: true
      },
      rail: {
        type: rec.verificationResult.rail === 'LOCAL_BANK' ? 'NIBSS Instant Payment (NIP)' : 'Pollar Stellar Escrow',
        identifier: rec.transactionReference,
        timestamp: new Date(rec.createdAt).toLocaleString(),
        protocol: 'DualVerifier Engine',
        verified: true
      },
      receiver: {
        title: 'Settled Recipient',
        identifier: rec.verificationResult.receiver,
        institution: 'Merchant Wallet',
        amountFormatted: rec.verificationResult.amount,
        currency: rec.verificationResult.currency,
        verified: rec.verificationStatus === 'SUCCESS'
      }
    },
    forensics: {
      flags: rec.verificationResult.flags || []
    }
  };

  activeBlueCard.value = card;
  certificateModalCard.value = card;
  isCertificateModalOpen.value = true;
  activeRail.value = rec.verificationResult.rail;
}

function scrollToHistory() {
  const el = document.getElementById('my-authentication-history');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

async function handleAccountChanged() {
  activeBlueCard.value = null;
  certificateModalCard.value = null;
  auditHistoryItems.value = [];
  authHistoryDashboardRef.value?.refresh?.();
  await fetchPersonalHistory();
}

async function handleResetRecord(proofHash: string) {
  try {
    await fetch(apiUrl(`/api/zcash/reset/${proofHash}`), { method: 'POST' });
    await fetchShieldedMemos();
    if (activeBlueCard.value?.proofHash === proofHash) {
      activeBlueCard.value = null;
    }
  } catch (err) {
    console.warn('Failed to reset proof:', err);
  }
}

async function handleResetReplay(card: any) {
  try {
    const target = card.routingPipeline?.rail?.identifier || card.proofHash;
    const res = await fetch(apiUrl('/api/verify/reset-receipt'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: target, proofHash: card.proofHash })
    });
    const data = await res.json();
    if (data.success) {
      activeBlueCard.value = null;
      await fetchShieldedMemos();
      authHistoryDashboardRef.value?.refresh?.();
      await fetchPersonalHistory();
      alert(`Receipt ${target} replay lock reset! You can now redo verification.`);
    }
  } catch (err) {
    console.warn('Failed to reset replay:', err);
  }
}

async function handleRecordDeleted(payload: any) {
  await fetchPersonalHistory();
  await fetchShieldedMemos();
  const ref = payload?.transactionReference;
  if (ref && (activeBlueCard.value?.proofHash === ref || activeBlueCard.value?.routingPipeline?.rail?.identifier === ref)) {
    activeBlueCard.value = null;
  }
}

async function handleHistoryCleared() {
  activeBlueCard.value = null;
  personalHistoryCount.value = 0;
  await fetchShieldedMemos();
}
</script>
