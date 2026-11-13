<template>
  <div class="space-y-5">
    <!-- Header & Network Badges -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
      <div>
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>Pollar Stellar Gasless Explorer</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono border border-blue-500/30">
            @pollar/core
          </span>
        </h3>
        <p class="text-xs text-slate-400">Query Stellar transactions, inspect smart account balances, and verify gasless escrow release.</p>
      </div>

      <!-- Network Indicator -->
      <div class="flex items-center space-x-2 text-xs font-mono text-emerald-400">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Stellar Testnet • Pollar Paymaster</span>
      </div>
    </div>

    <!-- Pollar Smart Wallet Connection Banner -->
    <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div class="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Pollar Smart Account</span>
            <span v-if="isConnected" class="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
              Connected
            </span>
            <span v-else class="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
              Guest
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-sm">
            {{ isConnected ? connectedAddress : '1-click social login, zero seed phrases, 100% sponsored gas fees.' }}
          </p>
        </div>
      </div>

      <button
        @click="toggleWalletConnect"
        type="button"
        class="px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0"
        :class="isConnected ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-blue-600 hover:bg-blue-500 text-white'"
      >
        <span>{{ isConnected ? 'Disconnect' : 'Connect Wallet' }}</span>
      </button>
    </div>

    <!-- Main Stellar Tx Hash Input -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Stellar Transaction Hash (TxID)
        </label>
        <button
          @click="pasteTxId"
          class="text-xs text-blue-400 hover:underline font-mono flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste Hash
        </button>
      </div>
      <div class="relative">
        <input
          v-model="txidInput"
          @keyup.enter="handleVerify"
          type="text"
          placeholder="e.g. a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e"
          class="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white font-mono text-xs placeholder:text-slate-600 outline-none"
        />
        <button
          v-if="txidInput"
          @click="txidInput = ''"
          class="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Quick Load Sample Test Vectors (Gestalt Similarity & Recognition) -->
    <div>
      <div class="text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider">
        Quick Test Vectors:
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          @click="loadSample('authentic')"
          class="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
        >
          <div class="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center justify-between">
            <span>GTBank ₦150k Escrow</span>
            <span class="text-[10px] text-emerald-400 font-mono">98.68 USDC</span>
          </div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
            Tx: a8f5b3c2... (0 XLM Gas)
          </div>
        </button>

        <button
          type="button"
          @click="loadSample('replay')"
          class="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
        >
          <div class="text-xs font-bold text-white group-hover:text-amber-400 flex items-center justify-between">
            <span>Replay Attack Caught</span>
            <span class="text-[10px] text-amber-400 font-mono">Attempt #3</span>
          </div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
            Tx: c3d4e5f6... (Locked)
          </div>
        </button>
      </div>
    </div>

    <!-- Action Button -->
    <button
      @click="handleVerify"
      :disabled="isLoading || (!txidInput && !walletInput)"
      type="button"
      class="w-full py-4 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg"
      :class="[
        isLoading || (!txidInput && !walletInput)
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]'
      ]"
    >
      <svg v-if="isLoading" class="animate-spin w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-else>Inspect Stellar Escrow</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'verify', payload: { txid: string; walletAddress?: string; sessionId?: string }): void;
}>();

const txidInput = ref('a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e');
const walletInput = ref('GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01');
const isConnected = ref(true);
const connectedAddress = ref('GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01');

function toggleWalletConnect() {
  if (isConnected.value) {
    isConnected.value = false;
    connectedAddress.value = '';
    walletInput.value = '';
  } else {
    isConnected.value = true;
    connectedAddress.value = 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01';
    walletInput.value = 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01';
  }
}

async function pasteTxId() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      txidInput.value = text.trim();
      handleVerify();
    }
  } catch (err) {
    console.warn('Clipboard read failed:', err);
  }
}

function loadSample(type: 'authentic' | 'replay') {
  if (type === 'authentic') {
    txidInput.value = 'a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e';
    walletInput.value = 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01';
  } else {
    txidInput.value = 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4';
    walletInput.value = 'GBIKEJA3PHONE9HUB7STELLAR2MERCHANT8LAGOS01';
  }
  handleVerify();
}

function handleVerify() {
  if (!txidInput.value && !walletInput.value) return;
  emit('verify', {
    txid: txidInput.value.trim(),
    walletAddress: walletInput.value.trim()
  });
}

defineExpose({
  loadPreset(data: any) {
    if (data.txid) txidInput.value = data.txid;
    if (data.walletAddress) {
      walletInput.value = data.walletAddress;
      connectedAddress.value = data.walletAddress;
      isConnected.value = true;
    }
  }
});
</script>
