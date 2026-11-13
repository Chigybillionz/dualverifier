<template>
  <div class="bg-[#090D1A]/90 border-b border-slate-800/80 py-2 sm:py-2.5 px-3 sm:px-6 lg:px-8 backdrop-blur-md sticky top-16 sm:top-20 z-30 transition-colors">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
      
      <!-- Label & Pulse Indicator -->
      <div class="flex items-center space-x-2 text-xs font-mono shrink-0">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span class="font-bold text-slate-200">1-Click Test Lab:</span>
        <span class="text-[11px] text-slate-400 hidden xl:inline">(Instant interactive fraud & settlement scenarios)</span>
      </div>

      <!-- Aligned Interactive Scenario Pills -->
      <div class="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none snap-x snap-mandatory flex-nowrap">
        
        <!-- Scenario 1: Valid ₦150k Payment -->
        <button
          @click="$emit('select-preset', 'demo-1-valid-gtb-150k')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 active:scale-95 shadow-sm snap-start select-none',
            activePresetId === 'demo-1-valid-gtb-150k'
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#090D1A] shadow-emerald-500/25'
              : 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-600/40 hover:border-emerald-500'
          ]"
          title="Legitimate GTBank ₦150,000 transfer - triggers gasless USDC escrow release"
        >
          <span class="w-2 h-2 rounded-full" :class="activePresetId === 'demo-1-valid-gtb-150k' ? 'bg-slate-950' : 'bg-emerald-400'"></span>
          <span>1. Valid ₦150k</span>
        </button>

        <!-- Scenario 2: Fake Canva Alert -->
        <button
          @click="$emit('select-preset', 'demo-2-fake-opay-alert')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 active:scale-95 shadow-sm snap-start select-none',
            activePresetId === 'demo-2-fake-opay-alert'
              ? 'bg-rose-500 text-white ring-2 ring-rose-400 ring-offset-2 ring-offset-[#090D1A] shadow-rose-500/25'
              : 'bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-600/40 hover:border-rose-500'
          ]"
          title="Canva-edited alert with bank code mismatch - locks escrow immediately"
        >
          <span class="w-2 h-2 rounded-full" :class="activePresetId === 'demo-2-fake-opay-alert' ? 'bg-white' : 'bg-rose-400'"></span>
          <span>2. Fake Canva</span>
        </button>

        <!-- Scenario 3: Pollar Stellar Escrow -->
        <button
          @click="$emit('select-preset', 'demo-3-pollar-stellar-settlement')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 active:scale-95 shadow-sm snap-start select-none',
            activePresetId === 'demo-3-pollar-stellar-settlement'
              ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-[#090D1A] shadow-blue-500/25'
              : 'bg-blue-950/50 hover:bg-blue-900/70 text-blue-300 border border-blue-600/40 hover:border-blue-500'
          ]"
          title="Direct Stellar on-chain transaction verification via Horizon RPC"
        >
          <span class="w-2 h-2 rounded-full" :class="activePresetId === 'demo-3-pollar-stellar-settlement' ? 'bg-white' : 'bg-blue-400'"></span>
          <span>3. Pollar Escrow</span>
        </button>

        <!-- Scenario 4: Replay Fraud Trap -->
        <button
          @click="$emit('select-preset', 'demo-4-reused-receipt-replay')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 active:scale-95 shadow-sm snap-start select-none',
            activePresetId === 'demo-4-reused-receipt-replay'
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#090D1A] shadow-amber-500/25'
              : 'bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border border-amber-600/40 hover:border-amber-500'
          ]"
          title="Reused legitimate receipt presented at another branch - blocked by Stellar registry"
        >
          <span class="w-2 h-2 rounded-full" :class="activePresetId === 'demo-4-reused-receipt-replay' ? 'bg-slate-950' : 'bg-amber-400'"></span>
          <span>4. Replay Trap</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activePresetId?: string | null;
}>();

defineEmits<{
  (e: 'select-preset', presetId: string): void;
  (e: 'trigger-replay'): void;
}>();
</script>
