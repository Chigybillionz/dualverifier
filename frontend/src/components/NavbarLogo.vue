<template>
  <header class="border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Left: Official DualVerifier Brand Logo -->
      <div class="flex items-center space-x-3">
        <a href="#" class="flex items-center group">
          <!-- The New Crisp DualVerifier Horizontal Logo -->
          <div class="h-11 sm:h-12 flex items-center justify-center rounded-xl bg-white px-2.5 py-1 shadow-md shadow-blue-500/10 group-hover:shadow-blue-500/25 transition-all">
            <img
              src="/logo.png"
              alt="DualVerifier - Verified Identity • Trusted Payments"
              class="h-full w-auto object-contain"
            />
          </div>
        </a>
      </div>

      <!-- Center: HCI Usability Badge / Track -->
      <div class="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium">
        <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        <span class="text-slate-300">AI Fraud Protection</span>
        <span class="text-slate-600">•</span>
        <span class="text-blue-400 font-mono">Pollar Gasless Escrow</span>
      </div>

      <!-- Right: Live Status & Ledger Drawer Button -->
      <div class="flex items-center space-x-3">
        <!-- Live Node Status Indicator -->
        <div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Stellar Testnet • Live</span>
        </div>

        <!-- Audit Ledger Drawer Button -->
        <button
          @click="$emit('open-ledger')"
          class="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-blue-500/40 transition-all text-xs font-mono font-semibold shadow-sm group"
        >
          <svg class="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span class="hidden sm:inline uppercase tracking-wider">Claims Ledger</span>
          <span
            v-if="memoCount > 0"
            class="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono border border-blue-500/30 font-bold"
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
