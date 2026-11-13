<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
    <!-- Backdrop with blur -->
    <div class="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity" @click="$emit('close')"></div>

    <!-- Modal Dialog Window -->
    <div class="relative w-full max-w-2xl bg-[#0E1424] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">How DualVerifier Stops Scammers</h3>
            <p class="text-xs text-slate-400 font-mono">5-Layer Forensic Defense & Stellar Web3 Escrow</p>
          </div>
        </div>

        <button
          @click="$emit('close')"
          class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- Layer 1 -->
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-mono font-bold flex items-center justify-center">1</span>
              <span class="text-sm font-bold text-white">Binary & EXIF Tamper Forensics</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">Catches Canva / APKs</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed pl-8">
            Inspects image buffer headers for digital photo-editor signatures (Canva, Photoshop, Pixellab, Snapseed, or fake-alert APK generators). If detected, status locks to <strong class="text-rose-400">TAMPERED</strong> and amount sets to ₦0.00.
          </p>
        </div>

        <!-- Layer 2 -->
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-mono font-bold flex items-center justify-center">2</span>
              <span class="text-sm font-bold text-white">NIBSS Session ID Deconstruction</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">Mathematical Proof</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed pl-8">
            Deconstructs the 30-digit Nigerian bank reference: digits 1–6 verify the CBN bank routing code (e.g. GTBank <code class="text-slate-300">000013</code>), digits 7–18 verify the real timestamp, and entropy scoring flags fake sequential numbers.
          </p>
        </div>

        <!-- Layer 3 -->
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">3</span>
              <span class="text-sm font-bold text-white">NIBSS Clearing Switch Cross-Correlation</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Altered Amount Trap</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed pl-8">
            Cross-references the session ID against the inter-bank clearing gateway. If a scammer modifies ₦150k to ₦500k, or changes the beneficiary store name, DualVerifier flags <strong class="text-amber-400">AMOUNT MISMATCH</strong> and freezes settlement.
          </p>
        </div>

        <!-- Layer 4 -->
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-mono font-bold flex items-center justify-center">4</span>
              <span class="text-sm font-bold text-white">Cryptographic Anti-Replay Protection</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Double-Spending Trap</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed pl-8">
            Anchors a deterministic SHA-256 fingerprint on the Stellar blockchain. If a customer tries to redeem a genuine receipt a second time at another branch, the system halts with <strong class="text-amber-400">REPLAY BLOCKED</strong>.
          </p>
        </div>

        <!-- Layer 5 -->
        <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center">5</span>
              <span class="text-sm font-bold text-white">Pollar Gasless USDC Smart Settlement</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Zero-Gas Web3</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed pl-8">
            Genuine verified transactions immediately unlock USDC digital dollar escrows on Stellar. Pollar’s paymaster sponsors 100% of network fees — cashiers need zero XLM and zero seed phrases.
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <span class="text-xs text-slate-400 font-mono">BlockchainUNN Hackathon • Intelligence Track</span>
        <button
          @click="$emit('close')"
          class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          Got It, Back to Verifier
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

