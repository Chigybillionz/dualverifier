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
          Judge Live Demo
        </span>
        <span class="text-xs text-slate-500 hidden sm:inline">•</span>
        <span class="text-xs text-slate-300 hidden sm:inline font-medium">
          BlockchainUNN Hackathon Stage Test Vectors:
        </span>
      </div>

      <!-- 4 One-Click Judge Test Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Demo 1: Valid GTBank ₦150k Receipt + Ironwood Memo Seal -->
        <button
          @click="$emit('select-preset', 'demo-1-valid-gtb-150k')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 hover:border-emerald-400 transition-all shadow-sm group active:scale-95"
          title="Valid ₦150,000 GTBank-to-OPay transfer sealed into Zcash Ironwood (NU6.3) 512-byte encrypted memo"
        >
          <span>✅</span>
          <span>Demo 1: Valid GTBank ₦150k Receipt + Ironwood Memo Seal</span>
        </button>

        <!-- Demo 2: Fake OPay Alert (Session ID Timestamp Mismatch) -->
        <button
          @click="$emit('select-preset', 'demo-2-fake-opay-alert')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/50 hover:border-rose-400 transition-all shadow-sm group active:scale-95"
          title="Fake-alert receipt spoofed with Access Bank code 000014 and repeating dummy serials"
        >
          <span>🚨</span>
          <span>Demo 2: Fake OPay Alert (Timestamp Mismatch)</span>
        </button>

        <!-- Demo 3: Zcash Shielded u1 Tx + Viewing Key Decryption -->
        <button
          @click="$emit('select-preset', 'demo-3-zcash-shielded-u1')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-600/50 hover:border-blue-400 transition-all shadow-sm group active:scale-95"
          title="Zcash Unified Address (u1...) + Viewing Key selective disclosure decrypting 512-byte memo"
        >
          <span>🛡️</span>
          <span>Demo 3: Zcash Shielded u1 Tx + Viewing Key</span>
        </button>

        <!-- Demo 4: Re-Used Receipt Double-Spend Attack Trap -->
        <button
          @click="$emit('select-preset', 'demo-4-reused-receipt-replay')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-600/50 hover:border-amber-400 transition-all shadow-sm group active:scale-95"
          title="Re-verify Demo 1 receipt to demonstrate Zcash Ironwood Shielded Memo catching duplicate receipt replay"
        >
          <span>⚠️</span>
          <span>Demo 4: Re-Used Receipt Double-Spend Trap</span>
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
          DualVerifier 3-Minute Hackathon Pitch Script (Judge Flow)
        </span>
        <button @click="showScript = false" class="text-slate-400 hover:text-white">✕</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
        <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
          <p class="font-bold text-emerald-400 mb-1">Step 1: Web2 Receipt Verification + Ironwood Seal</p>
          <p class="text-slate-400 leading-relaxed">
            Click <strong>Demo 1</strong>: The 30-digit NIBSS code decodes deterministically. The SHA-256 fingerprint is immediately anchored inside a <strong>Zcash Ironwood (NU6.3) 512-Byte Encrypted Memo</strong>.
          </p>
        </div>
        <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
          <p class="font-bold text-rose-400 mb-1">Step 2: Catching Fake Alerts & Forgeries</p>
          <p class="text-slate-400 leading-relaxed">
            Click <strong>Demo 2</strong>: Engine catches fake alert with Access Bank code mismatch (000014), timestamp difference (>8,400s), and repeating 111111111111 serials in crimson!
          </p>
        </div>
        <div class="p-3 rounded-xl bg-slate-850 border border-slate-800">
          <p class="font-bold text-blue-400 mb-1">Step 3: Web3 Privacy & Anti-Replay Trap</p>
          <p class="text-slate-400 leading-relaxed">
            Click <strong>Demo 3</strong> to see Selective Disclosure on Ironwood Orchard note, then click <strong>Demo 4</strong> to demonstrate the real-time double-spend intercept!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineEmits<{
  (e: 'select-preset', id: string): void;
  (e: 'trigger-replay'): void;
}>();

const showScript = ref(false);
</script>
