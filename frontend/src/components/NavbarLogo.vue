<template>
  <header class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Left: Interlocking Shield Logo & Branding -->
      <div class="flex items-center space-x-3.5">
        <div class="relative w-11 h-11 flex-shrink-0 group">
          <!-- Interlocking Dual-Rail Zcash & Bank Shield SVG -->
          <svg class="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-105" viewBox="0 0 120 120" fill="none">
            <defs>
              <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#34d399" />
                <stop offset="100%" stop-color="#059669" />
              </linearGradient>
              <linearGradient id="zcashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#60a5fa" />
                <stop offset="100%" stop-color="#2563eb" />
              </linearGradient>
              <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fbbf24" />
                <stop offset="100%" stop-color="#d97706" />
              </linearGradient>
              <filter id="halo" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <!-- Outer Shield Ring: Web2 Banking Rail (Emerald) -->
            <path d="M60 14 L88 28 V58 C88 78 76 94 60 102 C44 94 32 78 32 58 V28 Z" fill="#090d16" stroke="url(#emeraldGrad)" stroke-width="2.5" />
            
            <!-- Interlocking Shield Ring: Zcash Shielded Rail (Blue & Amber) -->
            <ellipse cx="60" cy="60" rx="46" ry="24" transform="rotate(-30 60 60)" stroke="url(#zcashGrad)" stroke-width="2" opacity="0.8" filter="url(#halo)" />
            <ellipse cx="60" cy="60" rx="46" ry="24" transform="rotate(30 60 60)" stroke="url(#amberGrad)" stroke-width="1.8" opacity="0.6" />

            <!-- Central Zcash Z with Shield Check -->
            <path d="M52 48 H68 L52 70 H68" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Central Halo 2 Privacy Node -->
            <circle cx="60" cy="59" r="3" fill="#10b981" filter="url(#halo)" />
          </svg>
        </div>

        <div>
          <div class="flex items-center space-x-2.5">
            <h1 class="text-xl font-extrabold tracking-tight text-white flex items-center font-sans">
              Dual<span class="text-blue-400">Verifier</span>
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/80 shadow-sm">
              Zcash & NIBSS
            </span>
          </div>
          <p class="text-xs text-slate-400 hidden sm:block font-medium">
            Privacy-Preserving Dual-Rail Transaction Verifier & Forensic Explorer
          </p>
        </div>
      </div>

      <!-- Center: BlockchainUNN Hackathon Track Pill -->
      <div class="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-slate-300 font-medium">BlockchainUNN Hackathon</span>
        <span class="text-slate-600">•</span>
        <span class="text-blue-400 font-mono font-medium">Intelligence: AI & Web3 Without Borders</span>
      </div>

      <!-- Right: Zcash Network Status & Memo Ledger Drawer -->
      <div class="flex items-center space-x-3">
        <!-- Zcash Mainnet / Lightwalletd Beacon -->
        <div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Zcash Mainnet (Orchard ZK)</span>
        </div>

        <!-- Shielded Memo Ledger Button -->
        <button
          @click="$emit('open-ledger')"
          class="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 hover:border-blue-500/50 transition-all text-xs font-medium shadow-sm group"
        >
          <svg class="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Shielded Memos</span>
          <span
            v-if="memoCount > 0"
            class="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30"
          >
            {{ memoCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  memoCount: number;
}>();

defineEmits<{
  (e: 'open-ledger'): void;
}>();
</script>
