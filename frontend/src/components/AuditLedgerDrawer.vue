<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-command-900 border-l border-command-750 p-6 flex flex-col shadow-2xl space-y-5">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between border-b border-command-750 pb-4">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">DualVerifier On-Chain Ledger</h3>
              <p class="text-[11px] text-slate-400 font-mono">DualVerifierRegistry.sol • Base Sepolia</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-command-800"
          >
            ✕
          </button>
        </div>

        <!-- Ledger Stats -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-command-850 border border-command-750">
            <span class="text-slate-400 block text-[10px] uppercase font-mono">Anchored Proofs</span>
            <span class="text-xl font-bold text-cyan-400 font-mono">{{ records.length }}</span>
          </div>
          <div class="p-3 rounded-xl bg-command-850 border border-command-750">
            <span class="text-slate-400 block text-[10px] uppercase font-mono">Replays Blocked</span>
            <span class="text-xl font-bold text-amber-400 font-mono">{{ totalReplaysBlocked }}</span>
          </div>
        </div>

        <!-- Records List -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div v-if="records.length === 0" class="text-center py-12 text-slate-500 text-xs">
            No verification proofs anchored yet. Run a verification to create the first on-chain proof!
          </div>

          <div
            v-for="(rec, idx) in records"
            :key="idx"
            class="p-3.5 rounded-xl bg-command-850/80 border border-command-750 hover:border-cyan-500/40 transition-all text-xs space-y-2 group"
          >
            <div class="flex items-center justify-between">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                :class="rec.railType === 1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-blue-950 text-blue-300 border border-blue-800'"
              >
                {{ rec.railType === 1 ? 'Web2 NIBSS' : 'Web3 EVM' }}
              </span>

              <span
                class="text-[10px] font-mono px-2 py-0.5 rounded"
                :class="rec.verificationCount > 1 ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800' : 'text-slate-500'"
              >
                Claims: {{ rec.verificationCount }}
              </span>
            </div>

            <div class="font-mono font-medium text-slate-200 truncate">
              {{ rec.routingSummary }}
            </div>

            <div class="space-y-1 text-[11px] font-mono text-slate-400">
              <div class="truncate">
                <span class="text-slate-500">Hash: </span>
                <span class="text-slate-300">{{ rec.proofHash.slice(0, 16) }}...{{ rec.proofHash.slice(-8) }}</span>
              </div>
              <div>
                <span class="text-slate-500">Block: </span>
                <span class="text-slate-300">#{{ rec.blockNumber }}</span>
                <span class="text-slate-600 ml-2">•</span>
                <span class="text-slate-400 ml-2">{{ formatTime(rec.verifiedAt) }}</span>
              </div>
            </div>

            <div class="pt-1 flex items-center justify-between border-t border-command-750/60">
              <a
                :href="`https://sepolia.basescan.org/tx/${rec.attestationTxHash}`"
                target="_blank"
                class="text-cyan-400 hover:text-cyan-300 text-[11px] underline font-mono flex items-center gap-1"
              >
                <span>View Attestation Tx</span>
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <button
                @click="$emit('reset-record', rec.proofHash)"
                class="text-slate-500 hover:text-rose-400 text-[10px] underline"
                title="Reset proof in registry to allow fresh verification test"
              >
                Reset for Demo
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-command-750 flex items-center justify-between text-xs text-slate-400">
          <span>DualVerifierRegistry Contract</span>
          <span class="font-mono text-cyan-400">0x89C5...2729</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  records: any[];
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'reset-record', proofHash: string): void;
}>();

const totalReplaysBlocked = computed(() => {
  return props.records.reduce((sum, r) => sum + Math.max(0, (r.verificationCount || 1) - 1), 0);
});

function formatTime(unixSec: number) {
  if (!unixSec) return '';
  return new Date(unixSec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
</script>

