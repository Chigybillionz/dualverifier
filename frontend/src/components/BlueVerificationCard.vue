<template>
  <div
    class="blue-card-print relative rounded-2xl overflow-hidden transition-all duration-300 shadow-xl border backdrop-blur-xl"
    :class="[
      card.status === 'VERIFIED'
        ? 'bg-[#0B0F19] border-emerald-500/40 shadow-emerald-500/10'
        : card.status === 'DUPLICATE'
        ? 'bg-[#0B0F19] border-amber-500/50 shadow-amber-500/10'
        : 'bg-[#0B0F19] border-rose-500/50 shadow-rose-500/10'
    ]"
  >
    <!-- 1. VERDICT HERO BANNER (HCI Gulf of Evaluation: Instant Status Perception) -->
    <div
      class="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      :class="[
        card.status === 'VERIFIED'
          ? 'bg-emerald-950/40 border-emerald-500/30'
          : card.status === 'DUPLICATE'
          ? 'bg-amber-950/40 border-amber-500/30'
          : 'bg-rose-950/40 border-rose-500/30'
      ]"
    >
      <div class="flex items-center space-x-3.5">
        <!-- Status Icon -->
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          :class="[
            card.status === 'VERIFIED'
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
              : card.status === 'DUPLICATE'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse'
              : 'bg-rose-500 text-white shadow-rose-500/30'
          ]"
        >
          <!-- Verified Shield -->
          <svg v-if="card.status === 'VERIFIED'" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <!-- Duplicate Replay Alert -->
          <svg v-else-if="card.status === 'DUPLICATE'" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <!-- Forged / Tampered -->
          <svg v-else class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <div>
          <div class="flex items-center space-x-2">
            <span
              class="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
              :class="[
                card.status === 'VERIFIED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : card.status === 'DUPLICATE'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              ]"
            >
              {{ card.rail === 'LOCAL_BANK' ? 'NIBSS Bank Rail + Pollar Escrow' : 'Pollar Stellar Rail' }}
            </span>
            <span class="text-xs text-slate-400 font-mono">{{ formatTimestamp(card.timestamp) }}</span>
          </div>

          <h2
            class="text-lg sm:text-xl font-bold tracking-tight mt-0.5"
            :class="[
              card.status === 'VERIFIED'
                ? 'text-emerald-300'
                : card.status === 'DUPLICATE'
                ? 'text-amber-300'
                : 'text-rose-400'
            ]"
          >
            {{
              card.status === 'VERIFIED'
                ? '✓ 100% Genuine Payment Verified'
                : card.status === 'DUPLICATE'
                ? '⚠️ Duplicate Receipt Replay Blocked'
                : (card.badgeTitle ? `🚨 ${card.badgeTitle}` : '🚨 Fake / Manipulated Alert Detected')
            }}
          </h2>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center space-x-2">
        <button
          @click="$emit('open-certificate', card)"
          class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <span>📜 Attestation Certificate</span>
        </button>

        <button
          @click="copyProofHash"
          class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-mono flex items-center space-x-1.5 transition-colors"
          title="Copy proof hash"
        >
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{{ copied ? 'Copied!' : 'Hash' }}</span>
        </button>
      </div>
    </div>

    <!-- 2. CORE TRANSFER SUMMARY (Gestalt Common Region & Nielsen Minimalist Design) -->
    <div class="p-6 space-y-6">
      <!-- Big Amount & Pollar Escrow Banner -->
      <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">Transfer Amount</span>
          <div class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {{ card.routingPipeline?.receiver?.amountFormatted || '₦0.00' }}
          </div>
          <span v-if="card.routingPipeline?.receiver?.multiCurrency?.usdc" class="text-xs text-blue-400 font-mono font-medium">
            ≈ {{ card.routingPipeline.receiver.multiCurrency.usdc }}
          </span>
        </div>

        <!-- Pollar Escrow Release Pill -->
        <div class="sm:text-right p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Pollar Web3 Settlement</span>
          <div class="flex items-center sm:justify-end space-x-2">
            <span
              class="w-2 h-2 rounded-full"
              :class="card.status === 'VERIFIED' ? 'bg-emerald-400' : 'bg-rose-500'"
            ></span>
            <span
              class="text-xs font-bold font-mono"
              :class="card.status === 'VERIFIED' ? 'text-emerald-400' : 'text-rose-400'"
            >
              {{ card.status === 'VERIFIED' ? 'Escrow Released (Gasless)' : 'Escrow Locked' }}
            </span>
          </div>
          <span class="text-[10px] text-slate-400 block font-mono mt-0.5">0 XLM Fee (Sponsored by Pollar)</span>
        </div>
      </div>

      <!-- Human-Friendly Transfer Routing Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Sender Box -->
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Sender</span>
            <span class="text-[10px] text-emerald-400 font-mono">Bank Verified</span>
          </div>
          <div class="text-sm font-bold text-white truncate">
            {{ card.routingPipeline?.sender?.identifier || 'Account Holder' }}
          </div>
          <div class="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: card.routingPipeline?.sender?.bankLogoColor || '#10b981' }"></span>
            <span>{{ card.routingPipeline?.sender?.institution || 'Nigerian Bank' }}</span>
          </div>
        </div>

        <!-- Receiver Box -->
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Beneficiary (Merchant)</span>
            <span class="text-[10px] text-emerald-400 font-mono">Settlement Ready</span>
          </div>
          <div class="text-sm font-bold text-white truncate">
            {{ card.routingPipeline?.receiver?.identifier || 'Merchant Account' }}
          </div>
          <div class="text-xs text-slate-300 font-medium">
            {{ card.routingPipeline?.receiver?.institution || 'Settled Institution' }}
          </div>
        </div>
      </div>

      <!-- Session Reference / FinTech ID -->
      <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
        <span class="text-slate-400">Transaction Reference / NIBSS ID:</span>
        <span class="text-slate-200 font-bold tracking-wider select-all">
          {{ card.routingPipeline?.rail?.identifier || 'N/A' }}
        </span>
      </div>

      <!-- Red/Amber Warning Box if Tampered or Duplicate -->
      <div
        v-if="card.status !== 'VERIFIED' && card.forensics?.flags?.length"
        class="p-4 rounded-xl border space-y-2 text-xs"
        :class="card.status === 'DUPLICATE' ? 'bg-amber-950/30 border-amber-600/50 text-amber-200' : 'bg-rose-950/30 border-rose-600/50 text-rose-200'"
      >
        <div class="font-bold flex items-center space-x-2">
          <span>⚠️ Interception Reason:</span>
        </div>
        <ul class="list-disc list-inside space-y-1 font-mono text-[11px]">
          <li v-for="(flag, idx) in card.forensics.flags" :key="idx">{{ flag }}</li>
        </ul>
      </div>

      <!-- 3. COLLAPSIBLE DEEP FORENSICS ACCORDION (Nielsen #8 & #10: Progressive Disclosure) -->
      <div class="border-t border-slate-800 pt-4">
        <button
          @click="showDetails = !showDetails"
          class="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between transition-colors"
        >
          <div class="flex items-center space-x-2">
            <span>🔬</span>
            <span class="font-semibold text-white">Cryptographic Proof & Blockchain Ledger Details</span>
          </div>
          <span class="text-blue-400">{{ showDetails ? '▲ Hide Details' : '▼ View Deep Forensics' }}</span>
        </button>

        <!-- Deep Forensics Details Drawer -->
        <div v-if="showDetails" class="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4 text-xs font-mono">
          <!-- Pollar Stellar Anchor Details -->
          <div v-if="card.pollarAnchor" class="space-y-2">
            <span class="text-emerald-400 font-bold block border-b border-slate-800 pb-1">⚡ Stellar On-Chain Anchor:</span>
            <div class="space-y-1 text-slate-400 text-[11px]">
              <div><span class="text-slate-500">Stellar Tx Hash: </span>
                <a :href="card.pollarAnchor.explorerUrl" target="_blank" class="text-blue-400 hover:underline">
                  {{ card.pollarAnchor.stellarTxHash }} ↗
                </a>
              </div>
              <div><span class="text-slate-500">Ledger Sequence: </span>#{{ card.pollarAnchor.stellarLedgerSeq }}</div>
              <div><span class="text-slate-500">Merchant Pollar Wallet: </span>{{ card.pollarAnchor.merchantPollarWallet }}</div>
              <div><span class="text-slate-500">Gas Sponsorship: </span>{{ card.pollarAnchor.sponsorFee }}</div>
              <div><span class="text-slate-500">Anchored Memo: </span>{{ card.pollarAnchor.stellarMemoText }}</div>
            </div>
          </div>

          <!-- NIBSS Mathematical Segment Breakdown -->
          <div v-if="card.forensics?.nibssAnalysis" class="space-y-2">
            <span class="text-blue-400 font-bold block border-b border-slate-800 pb-1">📐 NIBSS 30-Digit Decoding:</span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="p-2.5 rounded bg-slate-900">
                <span class="text-slate-500 block text-[10px]">Bank Code (Digits 1-6)</span>
                <span class="text-slate-200 font-bold">{{ card.forensics.nibssAnalysis.bankCodeSegment?.raw }}</span>
                <span class="text-emerald-400 block text-[10px] mt-0.5">{{ card.forensics.nibssAnalysis.bankCodeSegment?.resolvedBank?.shortName || 'CBN Code' }}</span>
              </div>
              <div class="p-2.5 rounded bg-slate-900">
                <span class="text-slate-500 block text-[10px]">WAT Timestamp (Digits 7-18)</span>
                <span class="text-slate-200 font-bold">{{ card.forensics.nibssAnalysis.timestampSegment?.raw }}</span>
                <span class="text-slate-400 block text-[10px] mt-0.5 truncate">{{ card.forensics.nibssAnalysis.timestampSegment?.parsedHuman }}</span>
              </div>
              <div class="p-2.5 rounded bg-slate-900">
                <span class="text-slate-500 block text-[10px]">Entropy Score (Digits 19-30)</span>
                <span class="text-slate-200 font-bold">{{ card.forensics.nibssAnalysis.entropySegment?.entropyScore }}/100</span>
                <span class="text-emerald-400 block text-[10px] mt-0.5">High Randomness</span>
              </div>
            </div>
          </div>

          <!-- SHA-256 Proof Fingerprint -->
          <div class="p-2.5 rounded bg-slate-900 text-[11px]">
            <span class="text-slate-500 block text-[10px] mb-0.5">Deterministic SHA-256 Receipt Fingerprint:</span>
            <span class="text-emerald-400 select-all break-all">{{ card.proofHash }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  card: any;
}>();

defineEmits<{
  (e: 'open-certificate', card: any): void;
}>();

const copied = ref(false);
const showDetails = ref(false);

function formatTimestamp(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function copyProofHash() {
  if (props.card?.proofHash) {
    try {
      await navigator.clipboard.writeText(props.card.proofHash);
      copied.value = true;
      setTimeout(() => (copied.value = false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  }
}
</script>
