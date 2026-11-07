<template>
  <div class="bg-[#161116] border-b border-[#2d242f] py-3 px-4 sm:px-6 backdrop-blur-xl transition-colors">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
      <!-- Title & Live Status -->
      <div class="flex items-center space-x-2.5">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4B728] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[#F4B728]"></span>
        </span>
        <span class="text-xs font-bold uppercase tracking-widest text-[#F4B728] font-mono">
          Hackathon Stage Presets
        </span>
        <span class="text-xs text-stone-600 hidden sm:inline">|</span>
        <span class="text-xs text-stone-300 hidden sm:inline font-mono">
          One-Click Test Vectors:
        </span>
      </div>

      <!-- 4 One-Click Judge Test Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Demo 1: Valid GTBank ₦150k Receipt + Ironwood Memo Seal -->
        <button
          @click="$emit('select-preset', 'demo-1-valid-gtb-150k')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#1c161d] hover:bg-[#251d27] text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-sm active:scale-95"
          title="Valid ₦150,000 GTBank-to-OPay transfer sealed into Zcash Ironwood (NU6.3) 512-byte encrypted memo"
        >
          <span>✓</span>
          <span>1: Valid GTBank ₦150k</span>
        </button>

        <!-- Demo 2: Fake OPay Alert (Session ID Timestamp Mismatch) -->
        <button
          @click="$emit('select-preset', 'demo-2-fake-opay-alert')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#1c161d] hover:bg-[#251d27] text-rose-400 border border-rose-500/30 hover:border-rose-400 transition-all shadow-sm active:scale-95"
          title="Fake-alert receipt spoofed with Access Bank code 000014 and repeating dummy serials"
        >
          <span>⚠</span>
          <span>2: Fake Canva Alert</span>
        </button>

        <!-- Demo 3: Zcash Shielded u1 Tx + Viewing Key Decryption -->
        <button
          @click="$emit('select-preset', 'demo-3-zcash-shielded-u1')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#1c161d] hover:bg-[#251d27] text-[#F4B728] border border-[#F4B728]/30 hover:border-[#F4B728] transition-all shadow-sm active:scale-95"
          title="Zcash Unified Address (u1...) + Viewing Key selective disclosure decrypting 512-byte memo"
        >
          <span>🛡</span>
          <span>3: Shielded u1 + View Key</span>
        </button>

        <!-- Demo 4: Re-Used Receipt Double-Spend Attack Trap -->
        <button
          @click="$emit('select-preset', 'demo-4-reused-receipt-replay')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#1c161d] hover:bg-[#251d27] text-amber-400 border border-amber-500/30 hover:border-amber-400 transition-all shadow-sm active:scale-95"
          title="Re-verify Demo 1 receipt to demonstrate Zcash Ironwood Shielded Memo catching duplicate receipt replay"
        >
          <span>⟳</span>
          <span>4: Replay Trap</span>
        </button>

        <!-- Pitch Script Modal Toggle -->
        <button
          @click="showScript = !showScript"
          class="p-1.5 rounded-lg bg-[#191419] hover:bg-[#211b22] text-stone-400 hover:text-white border border-[#2d242f] transition-colors"
          title="Toggle Judge Pitch Guide"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Judge Pitch Script Drawer -->
    <div v-if="showScript" class="max-w-7xl mx-auto mt-3 p-4 rounded-xl bg-[#191419] border border-[#F4B728]/30 text-xs space-y-2">
      <div class="flex items-center justify-between border-b border-[#2d242f] pb-2">
        <span class="font-bold text-[#F4B728] flex items-center gap-1.5 font-mono">
          <span>🛡️</span>
          DualVerifier 3-Minute Hackathon Pitch Script (Judge Flow)
        </span>
        <button @click="showScript = false" class="text-stone-400 hover:text-white">✕</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-stone-300">
        <div class="p-3 rounded-lg bg-[#120e12] border border-[#2d242f]">
          <p class="font-bold text-emerald-400 mb-1 font-mono">Step 1: Web2 Receipt + Ironwood Seal</p>
          <p class="text-stone-400 leading-relaxed text-[11px]">
            Click <strong>Demo 1</strong>: The 30-digit NIBSS code decodes deterministically. The SHA-256 fingerprint is immediately anchored inside a <strong>Zcash Ironwood (NU6.3) 512-Byte Encrypted Memo</strong>.
          </p>
        </div>
        <div class="p-3 rounded-lg bg-[#120e12] border border-[#2d242f]">
          <p class="font-bold text-rose-400 mb-1 font-mono">Step 2: Catching Fake Alerts & Forgeries</p>
          <p class="text-stone-400 leading-relaxed text-[11px]">
            Click <strong>Demo 2</strong>: Engine catches fake alert with Access Bank code mismatch (000014), timestamp difference (>8,400s), and repeating 111111111111 serials in crimson!
          </p>
        </div>
        <div class="p-3 rounded-lg bg-[#120e12] border border-[#2d242f]">
          <p class="font-bold text-[#F4B728] mb-1 font-mono">Step 3: Web3 Privacy & Anti-Replay Trap</p>
          <p class="text-stone-400 leading-relaxed text-[11px]">
            Click <strong>Demo 3 & 4</strong>: Unified Address selective disclosure reveals note amounts. Re-verifying Demo 1 triggers the anti-double-spend trap in high-contrast Amber!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineEmits<{
  (e: 'select-preset', presetId: string): void;
  (e: 'trigger-replay'): void;
}>();

const showScript = ref(false);
</script>
