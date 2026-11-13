<template>
  <div class="bg-[#0B0F19]/95 border-b border-slate-800/80 py-2 sm:py-2.5 px-4 sm:px-6 lg:px-8 backdrop-blur-md sticky top-14 sm:top-20 z-30">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
      <!-- Title: clean and compact -->
      <div class="flex items-center space-x-2 text-xs font-mono shrink-0">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span class="font-bold text-slate-200 hidden sm:inline">1-Click Test Scenarios:</span>
        <span class="font-bold text-slate-200 sm:hidden">Demos:</span>
      </div>

      <!-- Scrollable pills: evenly aligned, mobile touch-friendly -->
      <div class="flex items-center space-x-2 overflow-x-auto py-0.5 scrollbar-none w-full sm:w-auto justify-start sm:justify-end">
        <!-- Demo 1: Valid -->
        <button
          @click="$emit('select-preset', 'demo-1-valid-gtb-150k')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 shadow-sm',
            activePresetId === 'demo-1-valid-gtb-150k'
              ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0B0F19] font-bold'
              : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activePresetId === 'demo-1-valid-gtb-150k' ? 'bg-slate-950' : 'bg-emerald-400'"></span>
          <span>1. Valid ₦150k</span>
        </button>

        <!-- Demo 2: Fake Canva Alert -->
        <button
          @click="$emit('select-preset', 'demo-2-fake-opay-alert')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 shadow-sm',
            activePresetId === 'demo-2-fake-opay-alert'
              ? 'bg-rose-500 text-white ring-2 ring-rose-400 ring-offset-2 ring-offset-[#0B0F19] font-bold'
              : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-600/40'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activePresetId === 'demo-2-fake-opay-alert' ? 'bg-white' : 'bg-rose-400'"></span>
          <span>2. Fake Canva</span>
        </button>

        <!-- Demo 3: Pollar Stellar Escrow -->
        <button
          @click="$emit('select-preset', 'demo-3-pollar-stellar-settlement')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 shadow-sm',
            activePresetId === 'demo-3-pollar-stellar-settlement'
              ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0B0F19] font-bold'
              : 'bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-600/40'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activePresetId === 'demo-3-pollar-stellar-settlement' ? 'bg-white' : 'bg-blue-400'"></span>
          <span>3. Pollar Escrow</span>
        </button>

        <!-- Demo 4: Replay Trap -->
        <button
          @click="$emit('select-preset', 'demo-4-reused-receipt-replay')"
          type="button"
          :class="[
            'inline-flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 shadow-sm',
            activePresetId === 'demo-4-reused-receipt-replay'
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0B0F19] font-bold'
              : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/40'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activePresetId === 'demo-4-reused-receipt-replay' ? 'bg-slate-950' : 'bg-amber-400'"></span>
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
