<template>
  <div class="space-y-6">
    <!-- Header & Network Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-command-750 pb-4">
      <div>
        <h3 class="text-sm font-semibold text-slate-200">On-Chain RPC Explorer & Event Log Indexer</h3>
        <p class="text-xs text-slate-400">Verifies transaction finality, counterparty wallets, and canonical smart contract assets.</p>
      </div>

      <!-- Chain Selector -->
      <div class="flex items-center space-x-2">
        <label class="text-xs text-slate-400">Network:</label>
        <select
          v-model="selectedChain"
          class="bg-command-900 border border-command-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono outline-none"
        >
          <option value="base">Base Mainnet (Chain ID 8453)</option>
          <option value="base-sepolia">Base Sepolia Testnet (Chain ID 84532)</option>
          <option value="ethereum">Ethereum Mainnet (Chain ID 1)</option>
          <option value="arbitrum">Arbitrum One (Chain ID 42161)</option>
        </select>
      </div>
    </div>

    <!-- Main Transaction Hash Input -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
          Transaction Hash (0x...)
        </label>
        <button
          @click="pasteClipboard"
          class="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste Hash
        </button>
      </div>
      <div class="relative">
        <input
          v-model="txHashInput"
          type="text"
          placeholder="e.g. 0x8f4d92a10e7b915c43efb82c31e9c20a4b7e8d6f1a3b5c7e9d0f2a4b6c8e0a12"
          class="w-full bg-command-900 border border-command-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3.5 text-slate-100 font-mono text-sm placeholder:text-slate-600 transition-all outline-none"
        />
        <button
          v-if="txHashInput"
          @click="txHashInput = ''"
          class="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Optional Counterparty Filters (Anti-Spoofing Verification) -->
    <div class="p-4 rounded-xl bg-command-900/60 border border-command-750 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Counterparty Anti-Spoofing & Canonical Asset Validation (Optional)
        </span>
        <button
          @click="showAdvanced = !showAdvanced"
          class="text-xs text-cyan-400 hover:underline"
        >
          {{ showAdvanced ? 'Hide Options' : 'Configure Verification Rules' }}
        </button>
      </div>

      <div v-if="showAdvanced" class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <!-- Recipient Merchant Wallet -->
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Expected Recipient Wallet (Merchant):</label>
          <input
            v-model="claimedReceiver"
            type="text"
            placeholder="0x..."
            class="w-full bg-command-850 border border-command-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono outline-none"
          />
        </div>

        <!-- Sender Customer Wallet -->
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Claimed Sender Wallet (Optional):</label>
          <input
            v-model="claimedSender"
            type="text"
            placeholder="0x..."
            class="w-full bg-command-850 border border-command-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono outline-none"
          />
        </div>

        <!-- Canonical Token Contract -->
        <div>
          <label class="block text-[11px] text-slate-400 mb-1">Expected Token Contract:</label>
          <input
            v-model="claimedContract"
            type="text"
            placeholder="e.g. 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (Base USDC)"
            class="w-full bg-command-850 border border-command-700 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Quick test presets -->
    <div class="flex items-center justify-between text-xs pt-1">
      <span class="text-slate-400">Or quick-load Web3 test vectors:</span>
      <div class="flex items-center space-x-2">
        <button
          @click="loadWeb3Preset('usdc')"
          class="px-2.5 py-1 rounded bg-command-800 hover:bg-command-750 text-cyan-300 border border-command-700 hover:border-cyan-500/50 transition-colors"
        >
          250 Base USDC
        </button>
        <button
          @click="loadWeb3Preset('reverted')"
          class="px-2.5 py-1 rounded bg-command-800 hover:bg-command-750 text-rose-300 border border-command-700 hover:border-rose-500/50 transition-colors"
        >
          Reverted Tx Alert
        </button>
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-2">
      <button
        @click="executeVerification"
        :disabled="isLoading || !txHashInput"
        class="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-sans shadow-blue-500/25 active:scale-[0.99]"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>

        <span>{{ isLoading ? 'Querying RPC Node & Generating AI Trace...' : 'Index Blockchain RPC & Verify Settlement' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'verify', payload: any): void;
}>();

const selectedChain = ref('base');
const txHashInput = ref('');
const showAdvanced = ref(false);
const claimedReceiver = ref('0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB');
const claimedSender = ref('0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db');
const claimedContract = ref('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');

async function pasteClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) txHashInput.value = text.trim();
  } catch (err) {
    console.warn('Clipboard access denied');
  }
}

function loadWeb3Preset(type: 'usdc' | 'reverted') {
  if (type === 'usdc') {
    selectedChain.value = 'base';
    txHashInput.value = '0x8f4d92a10e7b915c43efb82c31e9c20a4b7e8d6f1a3b5c7e9d0f2a4b6c8e0a12';
    claimedReceiver.value = '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB';
    claimedSender.value = '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db';
    claimedContract.value = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  } else {
    selectedChain.value = 'base';
    txHashInput.value = '0xrevert_92a10e7b915c43efb82c31e9c20a4b7e8d6f1a3b5c7e9d0f2a4b6c8e0a12';
  }
}

function executeVerification() {
  if (!txHashInput.value) return;
  emit('verify', {
    txHash: txHashInput.value.trim(),
    chainKey: selectedChain.value,
    claimedReceiver: claimedReceiver.value || undefined,
    claimedSender: claimedSender.value || undefined,
    claimedContract: claimedContract.value || undefined
  });
}

// Expose method so parent presets can trigger directly
defineExpose({
  loadPreset: (txHash: string, chainKey = 'base', receiver?: string, sender?: string, contract?: string) => {
    selectedChain.value = chainKey;
    txHashInput.value = txHash;
    if (receiver) claimedReceiver.value = receiver;
    if (sender) claimedSender.value = sender;
    if (contract) claimedContract.value = contract;
    executeVerification();
  }
});
</script>

