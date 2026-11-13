<template>
  <header class="border-b border-slate-800/80 bg-[#090D1A]/95 backdrop-blur-xl sticky top-0 z-40 transition-colors">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
      
      <!-- 1. Left: Official DualVerifier Brand Logo -->
      <div class="flex items-center space-x-3 shrink-0">
        <a href="#" class="flex items-center group">
          <div class="h-10 sm:h-12 flex items-center justify-center rounded-xl bg-white px-2.5 py-1 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all border border-slate-200">
            <img
              src="/logo.png"
              alt="DualVerifier - Verified Identity • Trusted Payments"
              class="h-full w-auto object-contain"
            />
          </div>
        </a>
      </div>

      <!-- 2. Center: Primary Dual-Rail Switcher (Desktop & Tablet) -->
      <nav class="hidden md:flex items-center p-1 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-inner">
        <button
          @click="$emit('update:activeRail', 'LOCAL_BANK')"
          type="button"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2',
            activeRail === 'LOCAL_BANK'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          ]"
        >
          <span class="w-2 h-2 rounded-full" :class="activeRail === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-slate-500'"></span>
          <span>Bank Receipt Verifier</span>
          <span class="text-[10px] opacity-75 font-normal px-1.5 py-0.2 rounded bg-black/30">NIBSS</span>
        </button>

        <button
          @click="$emit('update:activeRail', 'POLLAR_STELLAR')"
          type="button"
          :class="[
            'px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-2',
            activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          ]"
        >
          <span class="w-2 h-2 rounded-full" :class="activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH' ? 'bg-blue-400' : 'bg-slate-500'"></span>
          <span>Stellar Web3 Explorer</span>
          <span class="text-[10px] opacity-75 font-normal px-1.5 py-0.2 rounded bg-black/30">Gasless</span>
        </button>
      </nav>

      <!-- 3. Right: Utility Controls (DID Account, History Icon, Guide, Ledger) -->
      <div class="flex items-center space-x-2 shrink-0">
        <!-- DID User Identity Pill -->
        <button
          @click="$emit('open-did-account')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-blue-500/50 text-xs font-mono transition-all shadow-sm active:scale-95"
          title="Manage Decentralized Identity & Devices"
        >
          <span class="w-2 h-2 rounded-full" :class="isDeveloper ? 'bg-amber-400' : 'bg-emerald-400'"></span>
          <span class="font-bold text-blue-400 hidden sm:inline">{{ currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'DID' }}</span>
          <span class="text-slate-400 font-mono text-[11px] truncate max-w-[80px] sm:max-w-[100px]">
            {{ currentUser?.did ? currentUser.did.slice(0, 10) + '...' : 'did:key...' }}
          </span>
        </button>

        <!-- Personal Authentication History Icon (Clear History Trigger) -->
        <button
          @click="$emit('open-history')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 hover:text-white border border-blue-500/40 hover:border-blue-400 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
          title="Open My Authentication History"
        >
          <!-- Clear History / Activity Icon -->
          <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-[11px] sm:text-xs uppercase tracking-wider">My History</span>
          <span
            v-if="(userHistoryCount || 0) > 0"
            class="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-mono font-bold shadow-sm"
          >
            {{ userHistoryCount }}
          </span>
        </button>

        <!-- Anti-Fraud Guide Trigger (Nielsen #10: Help & Docs) -->
        <button
          @click="$emit('open-guide')"
          type="button"
          class="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all shadow-sm active:scale-95"
          title="Learn how DualVerifier stops fake alerts"
        >
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="hidden lg:inline">How It Works</span>
          <span class="lg:hidden">Guide</span>
        </button>

        <!-- Claims Ledger Drawer Trigger -->
        <button
          @click="$emit('open-ledger')"
          type="button"
          class="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all shadow-sm active:scale-95"
          title="View Public Stellar Claims Ledger"
        >
          <span class="text-[11px] uppercase tracking-wider">On-Chain Anchors</span>
          <span
            v-if="memoCount > 0"
            class="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono"
          >
            {{ memoCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Mobile-Only Rail Selector (clean, centered, touch-friendly) -->
    <div class="md:hidden px-3 pb-2.5 pt-0.5 border-t border-slate-800/60 bg-[#0B0F19]">
      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          @click="$emit('update:activeRail', 'LOCAL_BANK')"
          type="button"
          :class="[
            'py-2 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5',
            activeRail === 'LOCAL_BANK'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activeRail === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-slate-500'"></span>
          <span>Bank Receipt (NIBSS)</span>
        </button>

        <button
          @click="$emit('update:activeRail', 'POLLAR_STELLAR')"
          type="button"
          :class="[
            'py-2 text-[11px] font-mono font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5',
            activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH' ? 'bg-blue-400' : 'bg-slate-500'"></span>
          <span>Stellar Web3 (0 Gas)</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { currentUser, isDeveloper } from '../utils/auth';

defineProps<{
  activeRail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH';
  memoCount: number;
  userHistoryCount?: number;
}>();

defineEmits<{
  (e: 'update:activeRail', rail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH'): void;
  (e: 'open-ledger'): void;
  (e: 'open-guide'): void;
  (e: 'open-history'): void;
  (e: 'open-did-account'): void;
}>();
</script>
