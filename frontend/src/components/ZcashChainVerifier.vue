<template>
  <div class="space-y-6">
    <!-- Header & Pool Badges -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
      <div>
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>Zcash Shielded & Transparent Explorer</span>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-mono border border-blue-800">
            ZIP-316 Unified Addresses
          </span>
        </h3>
        <p class="text-xs text-slate-400">Verifies Orchard & Sapling ZK-SNARK notes, selective disclosure viewing keys, and 512-byte memos.</p>
      </div>

      <!-- Network Indicator -->
      <div class="flex items-center space-x-2 text-xs font-mono text-slate-400">
        <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        <span>Zcash Mainnet (Zebra / Zallet)</span>
      </div>
    </div>

    <!-- Main Zcash TxID Input -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Zcash Transaction ID (TxID)
        </label>
        <button
          @click="pasteTxId"
          class="text-xs text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste TxID
        </button>
      </div>
      <div class="relative">
        <input
          v-model="txidInput"
          type="text"
          placeholder="e.g. 0x8f4d92a10e7b915c43efb82c31e9c20a4b7e8d6f1a3b5c7e9d0f2a4b6c8e0a12"
          class="w-full bg-slate-900 border border-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-2xl px-4 py-3.5 text-slate-100 font-mono text-sm placeholder:text-slate-600 transition-all outline-none"
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

    <!-- Unified Address Input (u1...) -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
          <span>Recipient Zcash Address</span>
          <span
            v-if="addressBadge"
            :class="[
              'text-[10px] px-2 py-0.2 rounded-full font-sans font-semibold',
              addressBadge.color
            ]"
          >
            {{ addressBadge.label }}
          </span>
        </label>
      </div>
      <input
        v-model="unifiedAddressInput"
        type="text"
        placeholder="u1q4k9n7e8... (Unified Address) or zs1... (Sapling) or t1... (Transparent)"
        class="w-full bg-slate-900 border border-slate-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-2xl px-4 py-3 text-slate-100 font-mono text-xs placeholder:text-slate-600 transition-all outline-none"
      />

      <!-- MODULE 1: ZIP-316 Unified Address Receiver Breakdown Box -->
      <div v-if="isUnifiedAddress" class="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
        <div class="text-[11px] font-bold text-blue-400 font-mono uppercase tracking-wider flex items-center justify-between">
          <span>ZIP-316 Bundled Receiver Breakdown:</span>
          <span class="text-[10px] text-slate-400 font-mono">Halo 2 / Groth16</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
          <!-- Receiver 1: Orchard / Ironwood -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-blue-500/30">
            <div class="flex items-center justify-between mb-0.5">
              <span class="font-bold text-blue-300">Orchard Pool</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p class="text-[10px] text-emerald-400 font-bold">Active (Zero-Knowledge)</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Halo 2 recursive note commitments</p>
          </div>

          <!-- Receiver 2: Sapling -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <div class="flex items-center justify-between mb-0.5">
              <span class="font-bold text-slate-300">Sapling Pool</span>
              <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
            <p class="text-[10px] text-blue-300">Compatible (Groth16)</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Backward-compatible shielded note</p>
          </div>

          <!-- Receiver 3: Transparent Fallback -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <div class="flex items-center justify-between mb-0.5">
              <span class="font-bold text-slate-400">Transparent P2PKH</span>
              <span class="w-2 h-2 rounded-full bg-slate-600"></span>
            </div>
            <p class="text-[10px] text-slate-500">Disabled / Optional</p>
            <p class="text-[10px] text-slate-500 mt-0.5">Suppressed for maximal privacy</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODULE 1: Selective Disclosure & Ephemeral Client-Scoped Viewing Key Guard -->
    <div class="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-3 shadow-inner">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
            🔑
          </div>
          <span class="text-xs font-bold text-slate-200">
            Selective Disclosure (Unified Viewing Key)
          </span>
        </div>

        <!-- Ephemeral Guard Badge -->
        <span
          class="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-800/80 flex items-center gap-1"
          title="Unlike legacy web explorers, DualVerifier wipes key material from memory immediately after decrypting the proof"
        >
          <span>🔒 Ephemeral Zero-Log Decryption (ZIP-310 UIVK Scoped)</span>
        </span>
      </div>

      <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
        <p>
          Supply an incoming viewing key (<code class="text-blue-300 font-mono">uview1...</code> or <code class="text-blue-300 font-mono">uivk1...</code>) to decrypt shielded amounts and 512-byte memos.
        </p>
        <p class="text-[10px] text-slate-500 font-mono">
          💡 <span class="text-slate-400 font-semibold">Zallet CLI Export:</span>
          <code class="text-amber-300">zallet rpc z_exportviewingkey "&lt;u1_address&gt;" true</code> (Scopes decryption strictly to transaction notes without exposing private spending keys).
        </p>
      </div>

      <div class="relative">
        <input
          v-model="viewingKeyInput"
          type="text"
          placeholder="e.g. uview1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6..."
          class="w-full bg-slate-850 border border-slate-750 focus:border-blue-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 outline-none"
        />
      </div>
    </div>

    <!-- Quick Zcash Test Presets -->
    <div class="flex items-center justify-between text-xs pt-1">
      <span class="text-slate-400">Or load Zcash test transactions:</span>
      <div class="flex items-center space-x-2">
        <button
          @click="loadZcashPreset('shielded-disclosure')"
          class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-blue-300 border border-slate-700 hover:border-blue-500/50 transition-colors"
        >
          Orchard ZK + uview1 (Decrypted)
        </button>
        <button
          @click="loadZcashPreset('shielded-hidden')"
          class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-colors"
        >
          Orchard ZK (Encrypted Memo)
        </button>
      </div>
    </div>

    <!-- Action Button -->
    <div class="pt-2">
      <button
        @click="executeVerification"
        :disabled="isLoading || !txidInput"
        class="w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-sans shadow-blue-500/25 active:scale-[0.99]"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <svg v-else class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>

        <span>{{ isLoading ? 'Executing Zero-Knowledge Decryption & RPC Trace...' : 'Verify Zcash Settlement & Decrypt Memo' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'verify', payload: any): void;
}>();

const txidInput = ref('');
const unifiedAddressInput = ref('u1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6t8v0x2z4a6c8e0g2');
const viewingKeyInput = ref('uview1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6t8v0x2z4a6c8e0g2');

const isUnifiedAddress = computed(() => {
  const addr = unifiedAddressInput.value.trim();
  return addr.startsWith('u1') || addr.startsWith('utest1');
});

const addressBadge = computed(() => {
  const addr = unifiedAddressInput.value.trim();
  if (addr.startsWith('u1') || addr.startsWith('utest1')) {
    return { label: 'Orchard Unified (ZIP-316)', color: 'bg-blue-950 text-blue-300' };
  }
  if (addr.startsWith('zs1')) {
    return { label: 'Sapling Shielded', color: 'bg-emerald-950 text-emerald-300' };
  }
  if (addr.startsWith('t1') || addr.startsWith('t3')) {
    return { label: 'Transparent (Legacy)', color: 'bg-slate-800 text-slate-300' };
  }
  return null;
});

async function pasteTxId() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) txidInput.value = text.trim();
  } catch (err) {
    console.warn('Clipboard read failed');
  }
}

function loadZcashPreset(type: 'shielded-disclosure' | 'shielded-hidden') {
  txidInput.value = '0x8f4d92a10e7b915c43efb82c31e9c20a4b7e8d6f1a3b5c7e9d0f2a4b6c8e0a12';
  unifiedAddressInput.value = 'u1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6t8v0x2z4a6c8e0g2';
  if (type === 'shielded-disclosure') {
    viewingKeyInput.value = 'uview1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6t8v0x2z4a6c8e0g2';
  } else {
    viewingKeyInput.value = '';
  }
}

function executeVerification() {
  if (!txidInput.value) return;
  emit('verify', {
    txid: txidInput.value.trim(),
    unifiedAddress: unifiedAddressInput.value.trim() || undefined,
    viewingKey: viewingKeyInput.value.trim() || undefined
  });
}

defineExpose({
  loadPreset: (txid: string, unifiedAddress?: string, viewingKey?: string) => {
    txidInput.value = txid;
    if (unifiedAddress) unifiedAddressInput.value = unifiedAddress;
    if (viewingKey !== undefined) viewingKeyInput.value = viewingKey;
    executeVerification();
  }
});
</script>
