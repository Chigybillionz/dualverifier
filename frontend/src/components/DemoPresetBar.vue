<template>
  <div class="bg-slate-900/90 border-b border-slate-800/80 py-3 px-4 sm:px-6 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
      <!-- Title & Live Status -->
      <div class="flex items-center space-x-2.5">
        <span class="flex h-2.5 w-2.5 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
          Hackathon Stage Presets
        </span>
        <span class="text-xs text-slate-500 hidden sm:inline">•</span>
        <span class="text-xs text-slate-300 hidden sm:inline font-medium">
          3-Minute Judge Live Presentation Test Vectors:
        </span>
      </div>

      <!-- Presets Action Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Preset 1: Genuine GTB -> OPay -->
        <button
          @click="$emit('select-preset', 'preset-valid-gtb-opay')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 hover:border-emerald-400 transition-all shadow-sm group"
          title="Genuine ₦50,000 GTBank-to-OPay transfer with Zcash 512-Byte Shielded Memo proof"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
          <span>Preset 1: Genuine GTB ➔ OPay</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200 font-mono">Zcash Memo</span>
        </button>

        <!-- Preset 2: Forged Fake Alert -->
        <button
          @click="$emit('select-preset', 'preset-forged-fake-alert')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/50 hover:border-rose-400 transition-all shadow-sm group"
          title="Fake-alert receipt spoofed with Access Bank code 000014 and repeating dummy serials"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400 group-hover:scale-125 transition-transform"></span>
          <span>Preset 2: Forged Fake Alert</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-rose-800 text-rose-200 font-mono">Crimson Alert</span>
        </button>

        <!-- Preset 3: Zcash Shielded Orchard -->
        <button
          @click="$emit('select-preset', 'preset-zcash-shielded-disclosure')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-600/50 hover:border-blue-400 transition-all shadow-sm group"
          title="Zcash Unified Address (u1...) + Viewing Key selective disclosure decrypting 512-byte memo"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform"></span>
          <span>Preset 3: Zcash Shielded (uview1...)</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-blue-800 text-blue-200 font-mono">Selective Disclosure</span>
        </button>

        <!-- Replay Attack Interception Demo -->
        <button
          @click="$emit('trigger-replay')"
          class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 hover:border-amber-400 transition-all shadow-sm group"
          title="Re-verify Preset 1 to demonstrate Zcash Shielded Memo catching duplicate receipt replay"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Test Replay Attack</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-800 text-amber-200 font-mono">Anti-Double-Spend</span>
        </button>

        <!-- Pitch Script Modal Toggle -->
        <button
          @click="showScript = !showScript"
          class="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title="Toggle Judge Pitch Guide"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Judge Pitch Script Drawer -->
    <div v-if="showScript" class="max-w-7xl mx-auto mt-3 p-4 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs space-y-2">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <span class="font-bold text-blue-400 flex items-center gap-1.5 font-mono">
          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          DualVerifier 3-Minute Hackathon Pitch Script
        </span>
        <button @click="showScript = false" class="text-slate-400 hover:text-white">✕</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
        <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
          <p class="font-bold text-emerald-400 mb-1">Minute 1: The Problem</p>
          <p class="text-slate-400 leading-relaxed">
            Merchants in Nigeria lose millions to manipulated bank receipts (fake-alert APKs, Canva edits, duplicate screenshot claims). Simultaneously, Web3 merchants cannot verify privacy-preserving Zcash shielded payments without exposing their entire wallet.
          </p>
        </div>
        <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
          <p class="font-bold text-emerald-300 mb-1">Minute 2: Rail 1 (Local Bank + Zcash Memo)</p>
          <p class="text-slate-400 leading-relaxed">
            Click <strong>Preset 1</strong>: 30-digit NIBSS code decodes deterministically. The SHA-256 fingerprint is anchored inside a <strong>Zcash 512-Byte Encrypted Memo</strong>. Next, click <strong>Preset 2</strong>: Engine catches fake alert with Access Bank code mismatch and repeating 111111111111 serials in crimson!
          </p>
        </div>
        <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
          <p class="font-bold text-blue-400 mb-1">Minute 3: Rail 2 (Zcash Selective Disclosure)</p>
          <p class="text-slate-400 leading-relaxed">
            Click <strong>Preset 3</strong>: Demonstrates Zcash Unified Address (`u1...`) + Unified Viewing Key (`uview1...`). Decrypts 2.45 ZEC and the 512-byte memo without revealing private keys! Finally, click <strong>Test Replay Attack</strong> to show the Zcash memo registry blocking duplicate receipts!
          </p>
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
