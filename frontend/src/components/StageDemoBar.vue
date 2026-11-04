<template>
  <div class="bg-gradient-to-r from-command-900 via-command-850 to-command-900 border-b border-command-750/70 py-3 px-4 sm:px-6">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
      <!-- Title & Pitch Mode Badge -->
      <div class="flex items-center space-x-2.5">
        <span class="flex h-2.5 w-2.5 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
          Stage Demo Controls
        </span>
        <span class="text-xs text-slate-400 hidden sm:inline">|</span>
        <span class="text-xs text-slate-300 hidden sm:inline font-medium">
          BlockchainUNN 3-Minute Live Pitch Presets:
        </span>
      </div>

      <!-- Preset Buttons Group -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Preset 1: Genuine GTB -> OPay -->
        <button
          @click="$emit('select-preset', 'preset-valid-gtb-opay')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-600/50 hover:border-emerald-400 transition-all shadow-sm group"
          title="Valid ₦50,000 GTBank to OPay transfer with verified 30-digit NIBSS code"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
          <span>Preset 1: Genuine GTB ➔ OPay</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800/80 text-emerald-200 font-mono">Authentic</span>
        </button>

        <!-- Preset 2: Forged Fake Alert -->
        <button
          @click="$emit('select-preset', 'preset-forged-fake-alert')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-600/50 hover:border-rose-400 transition-all shadow-sm group"
          title="Spoofed GTBank fake-alert receipt with Access Bank code 000014 and repeating dummy serials"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400 group-hover:scale-125 transition-transform"></span>
          <span>Preset 2: Forged Fake Alert</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-rose-800/80 text-rose-200 font-mono">Crimson Alert</span>
        </button>

        <!-- Preset 3: Live Base USDC -->
        <button
          @click="$emit('select-preset', 'preset-live-onchain-usdc')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-950/70 hover:bg-blue-900/90 text-blue-300 border border-blue-600/50 hover:border-blue-400 transition-all shadow-sm group"
          title="Base L2 RPC indexer check for 250 USDC counterparty payment with plain-English summary"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform"></span>
          <span>Preset 3: Base USDC Transfer</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-blue-800/80 text-blue-200 font-mono">Web3 Rail</span>
        </button>

        <!-- Replay Attack Live Test -->
        <button
          @click="$emit('trigger-replay')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-950/70 hover:bg-amber-900/90 text-amber-300 border border-amber-600/50 hover:border-amber-400 transition-all shadow-sm group"
          title="Re-verify Preset 1 to demonstrate Smart Contract Registry catching duplicate claim"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Test Replay Attack</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-800/80 text-amber-200 font-mono">Anti-Double-Spend</span>
        </button>

        <!-- Pitch Script Modal Toggle -->
        <button
          @click="showScript = !showScript"
          class="p-1.5 rounded-lg bg-command-800 hover:bg-command-750 text-slate-400 hover:text-white border border-command-700 transition-colors"
          title="View 3-Minute Pitch Script Guide"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Pitch Script Collapsible Drawer -->
    <div v-if="showScript" class="max-w-7xl mx-auto mt-3 p-4 rounded-xl bg-command-900 border border-cyan-500/30 text-xs space-y-2">
      <div class="flex items-center justify-between border-b border-command-750 pb-2">
        <span class="font-bold text-cyan-400 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          DualVerifier 3-Minute Judge Pitch Flow
        </span>
        <button @click="showScript = false" class="text-slate-400 hover:text-white">✕</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
        <div class="p-2.5 rounded bg-command-850 border border-command-750">
          <p class="font-semibold text-cyan-300 mb-1">Minute 1: The Problem</p>
          <p class="text-slate-400">Highlight how Nigerian merchants lose millions daily to fake-alert APKs and Canva-edited receipts, while Web3 merchants struggle with unintelligible hex traces on block explorers.</p>
        </div>
        <div class="p-2.5 rounded bg-command-850 border border-command-750">
          <p class="font-semibold text-emerald-300 mb-1">Minute 2: Rail 1 (Local Bank Forensics)</p>
          <p class="text-slate-400">Click <strong>Preset 1</strong>: Watch the 30-digit NIBSS Session ID decode deterministically into CBN bank code, timestamp, and high entropy. Next click <strong>Preset 2</strong>: Engine catches fake alert with Access Bank code and 111111111111 repeating digits in red.</p>
        </div>
        <div class="p-2.5 rounded bg-command-850 border border-command-750">
          <p class="font-semibold text-amber-300 mb-1">Minute 3: Rail 2 + Anti-Replay On-Chain</p>
          <p class="text-slate-400">Click <strong>Preset 3</strong> to show direct Base RPC indexing and Gemini plain-English summary. Finally, click <strong>Test Replay Attack</strong> to show the Smart Contract Registry intercepting duplicate receipt spending across merchants!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showScript = ref(false);

defineEmits<{
  (e: 'select-preset', presetId: string): void;
  (e: 'trigger-replay'): void;
}>();
</script>

