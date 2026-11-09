<template>
  <header class="border-b border-[#2d242f] bg-[#120e12]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Left: Zcash Official Gold Circular Emblem + DualVerifier Brand -->
      <div class="flex items-center space-x-3.5">
        <a href="#" class="flex items-center space-x-3 group">
          <!-- Official DualVerifier Zcash Verification Shield Emblem (Onchain + Local Verified) -->
          <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg shadow-[#F4B728]/25 group-hover:scale-105 transition-transform flex-shrink-0 border border-[#F4B728]/40 bg-black">
            <img src="/logo.png" alt="DualVerifier Logo" class="w-full h-full object-cover rounded-full" />
          </div>

          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xl font-bold tracking-tight text-white font-sans">
                Dual<span class="text-[#F4B728]">Verifier</span>
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F4B728]/15 text-[#F4B728] border border-[#F4B728]/30">
                ZCASH NU6.3
              </span>
            </div>
            <p class="text-[11px] text-stone-400 hidden sm:block tracking-wide">
              Privacy-Preserving Dual-Rail Forensic Explorer
            </p>
          </div>
        </a>
      </div>

      <!-- Right: Telemetry & Ledger Button -->
      <div class="flex items-center space-x-3">
        <!-- Live Node Status Indicator -->
        <div class="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#191419] border border-[#2d242f] text-[11px] font-mono text-stone-300">
          <span class="w-2 h-2 rounded-full bg-[#F4B728] animate-pulse"></span>
          <span>ORCHARD SHIELDED • LIVE</span>
        </div>

        <!-- Audit Ledger Drawer Button -->
        <button
          @click="$emit('open-ledger')"
          class="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#191419] hover:bg-[#211b22] text-stone-200 hover:text-white border border-[#2d242f] hover:border-[#F4B728]/50 transition-all text-xs font-mono font-semibold shadow-sm group"
        >
          <svg class="w-4 h-4 text-[#F4B728] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="uppercase tracking-wider">Claims Ledger</span>
          <span
            v-if="memoCount > 0"
            class="px-1.5 py-0.5 rounded bg-[#F4B728]/20 text-[#F4B728] text-[10px] font-mono border border-[#F4B728]/30 font-bold"
          >
            {{ memoCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  memoCount: number;
}>();

defineEmits<{
  (e: 'open-ledger'): void;
}>();
</script>
