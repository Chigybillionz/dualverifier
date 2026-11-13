<template>
  <div v-if="isOpen && card" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity no-print" @click="$emit('close')"></div>

    <!-- Modal Content: Certificate Pass -->
    <div class="relative w-full max-w-2xl bg-slate-900 border border-slate-750 text-slate-100 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans print:shadow-none print:border-2 print:border-black print:bg-white print:text-black">
      <!-- Watermark / Security Hologram Header -->
      <div
        class="p-6 border-b flex items-center justify-between transition-colors"
        :class="[
          card.status === 'VERIFIED'
            ? card.rail === 'LOCAL_BANK' ? 'bg-emerald-950/50 border-emerald-500/30' : 'bg-blue-950/50 border-blue-500/30'
            : card.status === 'DUPLICATE'
            ? 'bg-amber-950/50 border-amber-500/30'
            : 'bg-rose-950/50 border-rose-500/30'
        ]"
      >
        <div class="flex items-center space-x-3.5">
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0"
            :class="[
              card.status === 'VERIFIED'
                ? card.rail === 'LOCAL_BANK' ? 'bg-emerald-500 text-slate-950' : 'bg-blue-500 text-white'
                : card.status === 'DUPLICATE'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-rose-500 text-white'
            ]"
          >
            {{ card.rail === 'LOCAL_BANK' ? '₦' : 'ⓩ' }}
          </div>

          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                DualVerifier Official Attestation Pass
              </span>
              <span class="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {{ proofId }}
              </span>
            </div>

            <h3
              class="text-base sm:text-lg font-black tracking-tight"
              :class="[
                card.status === 'VERIFIED'
                  ? card.rail === 'LOCAL_BANK' ? 'text-emerald-400' : 'text-blue-400'
                  : card.status === 'DUPLICATE'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              ]"
            >
              {{ certificateTitle }}
            </h3>
          </div>
        </div>

        <button @click="$emit('close')" class="text-slate-400 hover:text-white p-2 no-print">
          ✕
        </button>
      </div>

      <!-- Certificate Body -->
      <div class="p-6 sm:p-8 space-y-6 bg-slate-900/60 print:bg-white">
        <!-- Replay Alert Banner if Duplicate -->
        <div
          v-if="card.status === 'DUPLICATE'"
          class="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-1"
        >
          <div class="font-bold flex items-center gap-1.5 text-amber-300">
            <span>⚠️ REPLAY ATTACK INTERCEPTED</span>
          </div>
          <p class="leading-relaxed">
            This receipt was previously settled on-chain. Pollar Stellar double-spend protection intercepted this duplicate claim attempt.
          </p>
        </div>

        <!-- Settlement Highlight Card -->
        <div class="text-center py-4 px-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1 print:border-black print:bg-slate-50">
          <p class="text-[11px] font-mono uppercase tracking-wider text-slate-400">Verified Cleared Settlement</p>
          <h2
            class="text-3xl sm:text-4xl font-black font-mono tracking-tight"
            :class="card.rail === 'LOCAL_BANK' ? 'text-emerald-400' : 'text-amber-400 print:text-black'"
          >
            {{ card.routingPipeline.receiver.amountFormatted }}
          </h2>
          <div class="pt-1 flex items-center justify-center space-x-2 text-xs font-mono">
            <span class="w-2 h-2 rounded-full" :class="card.status === 'VERIFIED' ? 'bg-emerald-400' : 'bg-amber-400'"></span>
            <span class="text-slate-300">{{ card.routingPipeline.rail.type }}</span>
            <span class="text-slate-600">•</span>
            <span class="text-slate-400">{{ formatHumanTime(card.timestamp) }}</span>
          </div>
        </div>

        <!-- Forensic Counterparty Summary Table -->
        <div class="space-y-3 text-xs font-sans">
          <div class="grid grid-cols-2 py-2 border-b border-slate-800 print:border-slate-300">
            <span class="text-slate-400 font-medium">Originating Counterparty</span>
            <span class="text-right font-bold text-white print:text-black">{{ card.routingPipeline.sender.identifier }}</span>
          </div>

          <div class="grid grid-cols-2 py-2 border-b border-slate-800 print:border-slate-300">
            <span class="text-slate-400 font-medium">Originating Institution / Pool</span>
            <span class="text-right font-mono font-medium text-slate-300 print:text-black">{{ card.routingPipeline.sender.institution }}</span>
          </div>

          <div class="grid grid-cols-2 py-2 border-b border-slate-800 print:border-slate-300">
            <span class="text-slate-400 font-medium">Destination Counterparty (Merchant)</span>
            <span class="text-right font-bold text-white print:text-black">{{ card.routingPipeline.receiver.identifier }}</span>
          </div>

          <div class="grid grid-cols-2 py-2 border-b border-slate-800 print:border-slate-300">
            <span class="text-slate-400 font-medium">Destination Channel / Address</span>
            <span class="text-right font-mono font-medium text-slate-300 truncate print:text-black" :title="card.routingPipeline.receiver.institution">
              {{ card.routingPipeline.receiver.institution }}
            </span>
          </div>

          <div class="grid grid-cols-2 py-2 border-b border-slate-800 print:border-slate-300">
            <span class="text-slate-400 font-medium">Rail Identifier / Reference</span>
            <span class="text-right font-mono font-bold text-blue-400 truncate print:text-black" :title="card.routingPipeline.rail.identifier">
              {{ card.routingPipeline.rail.identifier }}
            </span>
          </div>

          <div class="py-2 border-b border-slate-800 print:border-slate-300 space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-400 font-medium">On-Chain Ledger Anchor & SHA-256 Fingerprint</span>
              <span class="text-xs font-mono text-emerald-400 font-bold">Pollar / Stellar Verified</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 break-words border border-slate-800 print:border-slate-300 print:bg-white print:text-black">
              {{ memoSealText }}
            </div>
          </div>
        </div>

        <!-- Inline SVG QR Code & Cryptographic Stamp -->
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 print:border-black print:bg-white">
          <div class="flex items-center space-x-4">
            <!-- Inline SVG QR Code Generated Directly -->
            <div class="w-20 h-20 rounded-xl bg-white p-1.5 flex-shrink-0 shadow-md flex items-center justify-center">
              <div v-if="svgQrCode" v-html="svgQrCode" class="w-full h-full flex items-center justify-center"></div>
              <div v-else class="w-full h-full bg-slate-200 animate-pulse rounded"></div>
            </div>

            <div class="space-y-1 text-xs">
              <p class="font-bold text-white print:text-black font-mono">Scan to Verify Cryptographic Proof</p>
              <p class="text-[11px] text-slate-400 leading-tight">
                Self-contained verification payload anchored via Pollar SDK (@pollar/core) on the Stellar blockchain.
              </p>
              <p class="text-[10px] font-mono text-emerald-400 print:text-black">
                Hash: {{ card.proofHash.slice(0, 18) }}...{{ card.proofHash.slice(-8) }}
              </p>
            </div>
          </div>

          <!-- Official Stamp Seal -->
          <div class="hidden sm:block text-right">
            <div class="w-16 h-16 rounded-full border-2 border-emerald-500/60 p-1 flex items-center justify-center text-center rotate-[-12deg]">
              <span class="text-[9px] font-black uppercase text-emerald-400 font-mono leading-tight">
                DUAL<br />VERIFIED<br />2026
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action Buttons (Excluded from Print) -->
      <div class="p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
        <div class="flex items-center space-x-2">
          <!-- Print / Save as PDF Button -->
          <button
            @click="triggerPrint"
            class="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center space-x-2 shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <span>🖨️ Print / Save as PDF</span>
          </button>

          <!-- Copy Shareable JSON -->
          <button
            @click="copyProofJson"
            class="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-blue-500/50 transition-all flex items-center space-x-2 active:scale-95"
          >
            <span>📋 {{ copied ? 'Copied Proof JSON!' : 'Copy Proof JSON' }}</span>
          </button>
        </div>

        <!-- Test Replay Button for Judges -->
        <button
          @click="testReplayProtection"
          class="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 hover:border-amber-400 transition-all flex items-center space-x-2 active:scale-95"
          title="Re-verify this exact receipt to demonstrate the Duplicate Replay Trap catching it live"
        >
          <span>🔄 Test Replay / Double-Spend Protection</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps<{
  isOpen: boolean;
  card: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'trigger-replay-from-modal', payload: any): void;
}>();

const copied = ref(false);
const svgQrCode = ref('');

const proofId = computed(() => {
  if (!props.card?.proofHash) return 'DV-2026-0001';
  return `DV-2026-${props.card.proofHash.substring(2, 6).toUpperCase()}`;
});

const certificateTitle = computed(() => {
  if (props.card?.status === 'DUPLICATE') return 'DUPLICATE / ALREADY CLAIMED ATTESTATION';
  if (props.card?.rail === 'LOCAL_BANK') return 'AUTHENTIC NIBSS INTERBANK SETTLEMENT';
  return 'VERIFIED POLLAR STELLAR SETTLEMENT';
});

const memoSealText = computed(() => {
  if (props.card?.pollarAnchor?.stellarMemoText) {
    return `STELLAR_TX: ${props.card.pollarAnchor.stellarTxHash.slice(0, 20)}... | MEMO: ${props.card.pollarAnchor.stellarMemoText} | WALLET: ${props.card.pollarAnchor.merchantPollarWallet.slice(0, 16)}... | GASLESS: SPONSORED`;
  }
  if (props.card?.zcashShieldedAnchor?.memoUtf8) {
    return props.card.zcashShieldedAnchor.memoUtf8;
  }
  if (props.card?.zcashDetails?.memo?.decryptedText) {
    return props.card.zcashDetails.memo.decryptedText;
  }
  return `PROOF_HASH: ${props.card?.proofHash} | POLLAR_STELLAR_ANCHOR | TESTNET`;
});

function formatHumanTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium' });
}

async function generateSvgQr() {
  if (!props.card) return;
  const proofPayload = {
    proofId: proofId.value,
    proofHash: props.card.proofHash,
    rail: props.card.rail,
    status: props.card.status,
    amount: props.card.routingPipeline?.receiver?.amountFormatted,
    sender: props.card.routingPipeline?.sender?.identifier,
    receiver: props.card.routingPipeline?.receiver?.identifier,
    reference: props.card.routingPipeline?.rail?.identifier,
    memoSeal: memoSealText.value,
    timestamp: props.card.timestamp
  };

  try {
    const jsonStr = JSON.stringify(proofPayload);
    const svgStr = await QRCode.toString(jsonStr, {
      type: 'svg',
      margin: 1,
      color: { dark: '#020617', light: '#ffffff' }
    });
    svgQrCode.value = svgStr;
  } catch (err) {
    console.warn('QR Code generation failed:', err);
  }
}

watch(() => props.card, () => {
  generateSvgQr();
}, { deep: true });

onMounted(() => {
  generateSvgQr();
});

function triggerPrint() {
  window.print();
}

function copyProofJson() {
  if (!props.card) return;
  const proofPayload = {
    proofId: proofId.value,
    proofHash: props.card.proofHash,
    rail: props.card.rail,
    status: props.card.status,
    amount: props.card.routingPipeline?.receiver?.amountFormatted,
    sender: props.card.routingPipeline?.sender?.identifier,
    receiver: props.card.routingPipeline?.receiver?.identifier,
    reference: props.card.routingPipeline?.rail?.identifier,
    memoSeal: memoSealText.value,
    timestamp: props.card.timestamp
  };
  navigator.clipboard.writeText(JSON.stringify(proofPayload, null, 2));
  copied.value = true;
  setTimeout(() => (copied.value = false), 2500);
}

function testReplayProtection() {
  emit('trigger-replay-from-modal', props.card);
  emit('close');
}
</script>

