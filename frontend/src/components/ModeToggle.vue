<template>
  <div class="inline-flex border border-[#2d242f] bg-[#120e12] rounded-none overflow-hidden shadow-lg">
    <!-- Mode 1: Local Bank Verifier (NIBSS) -->
    <button
      @click="$emit('update:mode', 'LOCAL_BANK')"
      :class="[
        'px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 flex items-center space-x-2 border-r border-[#2d242f]',
        mode === 'LOCAL_BANK'
          ? 'bg-[#F4B728]/10 text-[#F4B728] border-b-2 border-b-[#F4B728]'
          : 'text-stone-400 hover:text-white hover:bg-white/5 border-b-2 border-b-transparent'
      ]"
    >
      <span class="w-2 h-2 rounded-full" :class="mode === 'LOCAL_BANK' ? 'bg-[#F4B728]' : 'bg-stone-600'"></span>
      <span>NIBSS Bank Receipt</span>
      <span class="text-[10px] opacity-75 font-normal">(Web2)</span>
    </button>

    <!-- Mode 2: Zcash On-Chain Verifier -->
    <button
      @click="$emit('update:mode', 'ZCASH')"
      :class="[
        'px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-200 flex items-center space-x-2',
        mode === 'ZCASH'
          ? 'bg-[#F4B728]/10 text-[#F4B728] border-b-2 border-b-[#F4B728]'
          : 'text-stone-400 hover:text-white hover:bg-white/5 border-b-2 border-b-transparent'
      ]"
    >
      <span class="w-2 h-2 rounded-full" :class="mode === 'ZCASH' ? 'bg-[#F4B728]' : 'bg-stone-600'"></span>
      <span>Zcash Shielded Pool</span>
      <span class="text-[10px] opacity-75 font-normal">(Ironwood ZK)</span>
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
