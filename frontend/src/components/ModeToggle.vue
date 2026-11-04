<template>
  <div class="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
    <!-- Mode 1: Local Bank Verifier (Emerald Theme) -->
    <button
      @click="$emit('update:mode', 'LOCAL_BANK')"
      :class="[
        'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-2.5',
        mode === 'LOCAL_BANK'
          ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      ]"
    >
      <span class="text-base">🏦</span>
      <span>Local Bank Verifier (NIBSS)</span>
      <span
        :class="[
          'text-[10px] px-2 py-0.5 rounded-full font-mono font-bold',
          mode === 'LOCAL_BANK' ? 'bg-emerald-950/80 text-emerald-300' : 'bg-slate-800 text-slate-400'
        ]"
      >
        Web2 Rail
      </span>
    </button>

    <!-- Mode 2: Zcash On-Chain Verifier (Electric Royal Blue & Amber Theme) -->
    <button
      @click="$emit('update:mode', 'ZCASH')"
      :class="[
        'px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center space-x-2.5',
        mode === 'ZCASH'
          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      ]"
    >
      <span class="text-base">🛡️</span>
      <span>Zcash Shielded Explorer (ZEC)</span>
      <span
        :class="[
          'text-[10px] px-2 py-0.5 rounded-full font-mono font-bold',
          mode === 'ZCASH' ? 'bg-blue-950/80 text-amber-300' : 'bg-slate-800 text-slate-400'
        ]"
      >
        Orchard ZK
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'LOCAL_BANK' | 'ZCASH';
}>();

defineEmits<{
  (e: 'update:mode', mode: 'LOCAL_BANK' | 'ZCASH'): void;
}>();
</script>

