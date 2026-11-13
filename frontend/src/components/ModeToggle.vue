<template>
  <div class="inline-flex rounded-2xl bg-slate-900 p-1.5 border border-slate-800 shadow-md">
    <!-- Mode 1: Local Bank Verifier (NIBSS) -->
    <button
      @click="$emit('update:mode', 'LOCAL_BANK')"
      type="button"
      :class="[
        'px-5 py-2.5 text-xs font-mono font-bold rounded-xl transition-all flex items-center space-x-2',
        mode === 'LOCAL_BANK'
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-400 hover:text-white'
      ]"
    >
      <span class="w-2 h-2 rounded-full" :class="mode === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-slate-500'"></span>
      <span>Bank Receipt Verifier</span>
      <span class="text-[10px] opacity-75 font-normal">(NIBSS)</span>
    </button>

    <!-- Mode 2: Pollar Stellar Gasless Verifier -->
    <button
      @click="$emit('update:mode', 'POLLAR_STELLAR')"
      type="button"
      :class="[
        'px-5 py-2.5 text-xs font-mono font-bold rounded-xl transition-all flex items-center space-x-2',
        mode === 'POLLAR_STELLAR' || mode === 'ZCASH'
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'text-slate-400 hover:text-white'
      ]"
    >
      <span class="w-2 h-2 rounded-full" :class="mode === 'POLLAR_STELLAR' || mode === 'ZCASH' ? 'bg-emerald-400' : 'bg-slate-500'"></span>
      <span>Pollar Stellar Escrow</span>
      <span class="text-[10px] opacity-75 font-normal">(0 Gas)</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH';
}>();

defineEmits<{
  (e: 'update:mode', mode: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH'): void;
}>();
</script>
