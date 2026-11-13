<template>
  <div class="bg-[#0B0F19]/80 border-b border-slate-800/80 py-3 px-4 sm:px-6 backdrop-blur-md">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
      <!-- Title & Live Indicator -->
      <div class="flex items-center space-x-2 text-xs font-mono">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span class="font-bold text-slate-200">1-Click Test Scenarios:</span>
        <span class="text-slate-500 hidden sm:inline">(Try these to test instant verification)</span>
      </div>

      <!-- 4 One-Click Scenario Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-2">
        <!-- Demo 1: Authentic GTBank N150k -->
        <button
          @click="$emit('select-preset', 'demo-1-valid-gtb-150k')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 hover:border-emerald-400 transition-all shadow-sm active:scale-95"
          title="Valid ₦150,000 GTBank transfer with genuine NIBSS session ID"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>1. Valid ₦150k Receipt</span>
        </button>

        <!-- Demo 2: Fake Canva Alert -->
        <button
          @click="$emit('select-preset', 'demo-2-fake-opay-alert')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-600/40 hover:border-rose-400 transition-all shadow-sm active:scale-95"
          title="Spoofed Canva fake alert with mismatched bank codes and synthetic serials"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>2. Fake Canva Alert</span>
        </button>

        <!-- Demo 3: Pollar Gasless Escrow -->
        <button
          @click="$emit('select-preset', 'demo-3-pollar-stellar-settlement')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-600/40 hover:border-blue-400 transition-all shadow-sm active:scale-95"
          title="Pollar Smart Account with 0 XLM gas fee and $98.68 USDC payout"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          <span>3. Pollar Gasless Escrow</span>
        </button>

        <!-- Demo 4: Replay Double-Spend Trap -->
        <button
          @click="$emit('select-preset', 'demo-4-reused-receipt-replay')"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/40 hover:border-amber-400 transition-all shadow-sm active:scale-95"
          title="Attempting to re-claim a previously settled receipt"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>4. Replay Fraud Trap</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'select-preset', presetId: string): void;
  (e: 'trigger-replay'): void;
}>();
</script>
