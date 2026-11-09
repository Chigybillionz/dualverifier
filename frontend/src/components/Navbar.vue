<template>
  <header class="border-b border-command-750/80 bg-command-900/90 backdrop-blur-xl sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Left: Brand Logo & Title -->
      <div class="flex items-center space-x-3.5">
        <div class="relative w-11 h-11 flex-shrink-0">
          <img src="/logo.png" alt="DualVerifier Logo" class="w-full h-full object-cover rounded-full drop-shadow-[0_0_12px_rgba(244,183,40,0.45)]" />
        </div>
        <div>
          <div class="flex items-center space-x-2.5">
            <h1 class="text-xl font-bold tracking-tight text-white flex items-center">
              Dual<span class="text-cyan-400">Verifier</span>
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              v1.0 MVP
            </span>
          </div>
          <p class="text-xs text-slate-400 hidden sm:block">
            Universal Web2 & Web3 Forensic Payment Explorer
          </p>
        </div>
      </div>

      <!-- Center: Hackathon Track Pill -->
      <div class="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-command-850/90 border border-command-700/60 shadow-inner">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs text-slate-300 font-medium">
          BlockchainUNN Hackathon
        </span>
        <span class="text-slate-600">•</span>
        <span class="text-xs text-cyan-400 font-mono font-medium">
          Intelligence: AI & Web3 Without Borders
        </span>
      </div>

      <!-- Right: Network Status & Audit Drawer Trigger -->
      <div class="flex items-center space-x-3">
        <!-- Base Network Badge -->
        <div class="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-command-800/90 border border-command-700 text-xs font-mono text-slate-300">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Base Sepolia (L2)</span>
        </div>

        <!-- Ledger Drawer Button -->
        <button
          @click="$emit('open-ledger')"
          class="relative inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-command-800 hover:bg-command-750 text-slate-200 hover:text-white border border-command-700 hover:border-cyan-500/50 transition-all text-xs font-medium"
        >
          <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>On-Chain Ledger</span>
          <span
            v-if="recordCount > 0"
            class="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30"
          >
            {{ recordCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  recordCount: number;
}>();

defineEmits<{
  (e: 'open-ledger'): void;
}>();
</script>

