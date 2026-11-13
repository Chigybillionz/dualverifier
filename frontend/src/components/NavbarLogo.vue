<template>
  <header class="border-b border-slate-800/80 bg-[#090D1A]/95 backdrop-blur-xl sticky top-0 z-40 transition-colors">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
      
      <!-- 1. Left: Official DualVerifier Brand Logo -->
      <div class="flex items-center space-x-3 shrink-0">
        <a href="#" class="flex items-center group">
          <div class="h-10 sm:h-12 flex items-center justify-center rounded-xl bg-white px-2.5 py-1 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all border border-slate-200">
            <img
              src="/logo.png"
              alt="DualVerifier - Verified Identity • Trusted Payments"
              class="h-full w-auto object-contain"
            />
          </div>
        </a>
      </div>

      <!-- 2. Center: Primary Dual-Rail Switcher (Desktop & Tablet) -->
      <nav class="hidden md:flex items-center p-1 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-inner">
        <button
          @click="$emit('update:activeRail', 'LOCAL_BANK')"
          type="button"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2',
            activeRail === 'LOCAL_BANK'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          ]"
        >
          <span class="w-2 h-2 rounded-full" :class="activeRail === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-slate-500'"></span>
          <span>Bank Receipt Verifier</span>
          <span class="text-[10px] opacity-75 font-normal px-1.5 py-0.2 rounded bg-black/30">NIBSS</span>
        </button>

        <button
          @click="$emit('update:activeRail', 'POLLAR_STELLAR')"
          type="button"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2',
            activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          ]"
        >
          <span class="w-2 h-2 rounded-full" :class="activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH' ? 'bg-blue-400' : 'bg-slate-500'"></span>
          <span>Stellar Web3 Explorer</span>
          <span class="text-[10px] opacity-75 font-normal px-1.5 py-0.2 rounded bg-black/30">Gasless</span>
        </button>
      </nav>

      <!-- 3. Right: Utility Controls (Guide, Status, Ledger) -->
      <div class="flex items-center space-x-2 shrink-0">
        <!-- Anti-Fraud Guide Trigger (Nielsen #10: Help & Docs) -->
        <button
          @click="$emit('open-guide')"
          type="button"
          class="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all shadow-sm active:scale-95"
          title="Learn how DualVerifier stops fake alerts"
        >
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="hidden lg:inline">How It Works</span>
          <span class="lg:hidden">Guide</span>
        </button>

        <!-- Live Network Pill -->
        <div class="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Stellar Testnet</span>
        </div>

        <!-- Claims Ledger Drawer Trigger -->
        <button
          @click="$emit('open-ledger')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono font-semibold transition-all shadow-sm active:scale-95"
        >
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="text-[11px] sm:text-xs uppercase tracking-wider">Ledger</span>
          <span
            v-if="memoCount > 0"
            class="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono border border-blue-500/30 font-bold"
          >
            {{ memoCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile-Only Rail Selector (clean, centered, touch-friendly) -->
    <div class="md:hidden px-3 pb-2.5 pt-0.5 border-t border-slate-800/60 bg-[#0B0F19]">
      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          @click="$emit('update:activeRail', 'LOCAL_BANK')"
          type="button"
          :class="[
            'py-2 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5',
            activeRail === 'LOCAL_BANK'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activeRail === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-slate-500'"></span>
          <span>Bank Receipt (NIBSS)</span>
        </button>

        <button
          @click="$emit('update:activeRail', 'POLLAR_STELLAR')"
          type="button"
          :class="[
            'py-2 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5',
            activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH' ? 'bg-blue-400' : 'bg-slate-500'"></span>
          <span>Stellar Web3 (0 Gas)</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  activeRail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH';
  memoCount: number;
}>();

defineEmits<{
  (e: 'update:activeRail', rail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH'): void;
  (e: 'open-ledger'): void;
  (e: 'open-guide'): void;
}>();
</script>
