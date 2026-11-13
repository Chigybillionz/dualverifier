<template>
  <header class="border-b border-white/10 bg-[#070B14]/95 backdrop-blur-xl sticky top-0 z-40 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
      
      <!-- 1. Left: Official DualVerifier Brand Logo Badge -->
      <div class="flex items-center space-x-3 shrink-0">
        <a href="#" class="flex items-center group">
          <div class="h-10 flex items-center justify-center rounded-xl bg-white px-2.5 py-1 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all border border-slate-200">
            <img
              src="/logo.png"
              alt="DualVerifier - Verified Identity • Trusted Payments"
              class="h-full w-auto object-contain"
            />
          </div>
        </a>
      </div>

      <!-- 2. Center Rail Switcher (Desktop & Tablet) -->
      <nav class="hidden md:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 gap-1">
        <button
          @click="$emit('update:activeRail', 'LOCAL_BANK')"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5',
            activeRail === 'LOCAL_BANK'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
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
            'px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5',
            activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          ]"
        >
          <span class="w-2 h-2 rounded-full" :class="activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH' ? 'bg-blue-400' : 'bg-slate-500'"></span>
          <span>Stellar Web3 Explorer</span>
          <span class="text-[10px] opacity-75 font-normal px-1.5 py-0.2 rounded bg-black/30">Gasless</span>
        </button>
      </nav>

      <!-- 3. Right Utility Cluster -->
      <!-- Desktop (>=1024px) -->
      <div class="hidden lg:flex items-center gap-2">
        <!-- DID User Identity Pill -->
        <button
          @click="$emit('open-did-account')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-blue-500/50 text-xs font-mono transition-all shadow-sm active:scale-95"
          title="Manage Decentralized Identity & Devices"
        >
          <span class="w-2 h-2 rounded-full" :class="isDeveloper ? 'bg-amber-400' : 'bg-emerald-400'"></span>
          <span class="font-bold text-blue-400">{{ currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Alice' }}</span>
          <span class="text-slate-400 font-mono text-[11px] truncate max-w-[90px]">
            {{ currentUser?.did ? currentUser.did.slice(0, 12) + '...' : 'did:key...' }}
          </span>
        </button>

        <!-- Personal Authentication History -->
        <button
          @click="$emit('open-history')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 hover:text-white border border-blue-500/40 hover:border-blue-400 text-xs font-mono font-bold transition-all shadow-sm active:scale-95"
          title="Open My Authentication History"
        >
          <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-[11px] uppercase tracking-wider">My History</span>
          <span
            v-if="(userHistoryCount || 0) > 0"
            class="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-mono font-bold shadow-sm"
          >
            {{ userHistoryCount }}
          </span>
        </button>

        <!-- Anti-Fraud Guide Trigger -->
        <button
          @click="$emit('open-guide')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 text-xs font-mono transition-all shadow-sm active:scale-95"
          title="Learn how DualVerifier stops fake alerts"
        >
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>How It Works</span>
        </button>

        <!-- Claims Ledger Trigger -->
        <button
          @click="$emit('open-ledger')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 text-xs font-mono transition-all shadow-sm active:scale-95"
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

      <!-- Mobile / Tablet Right Controls (<1024px) -->
      <div class="lg:hidden flex items-center gap-2">
        <!-- Compact DID Pill -->
        <button
          @click="$emit('open-did-account')"
          type="button"
          class="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-mono transition-all active:scale-95"
          title="Manage Decentralized Identity & Devices"
        >
          <span class="w-2 h-2 rounded-full" :class="isDeveloper ? 'bg-amber-400' : 'bg-emerald-400'"></span>
          <span class="font-bold text-blue-400">{{ currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Alice' }}</span>
        </button>

        <!-- Hamburger Drawer Button -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          type="button"
          class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <svg v-if="!isMobileMenuOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

    </div>

    <!-- Mobile-Only Rail Switcher: Segmented Control Directly Below Header -->
    <div class="md:hidden mx-4 mt-1 mb-3">
      <div class="grid grid-cols-2 gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
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

    <!-- Mobile Drawer Menu (<1024px Dropdown) -->
    <div v-if="isMobileMenuOpen" class="lg:hidden px-4 pb-3 pt-1 border-t border-white/10 space-y-2 bg-[#070B14]">
      <div class="flex flex-col gap-1.5">
        <button
          @click="$emit('open-history'); isMobileMenuOpen = false"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-blue-300 border border-white/10 text-xs font-mono font-bold"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>My History</span>
          </div>
          <span v-if="(userHistoryCount || 0) > 0" class="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-mono">
            {{ userHistoryCount }}
          </span>
        </button>

        <button
          @click="$emit('open-guide'); isMobileMenuOpen = false"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono font-medium"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>How It Works</span>
          </div>
          <span class="text-slate-500 text-xs">Guide ↗</span>
        </button>

        <button
          @click="$emit('open-ledger'); isMobileMenuOpen = false"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono font-medium"
        >
          <div class="flex items-center gap-2">
            <span class="text-blue-400">📜</span>
            <span>On-Chain Anchors</span>
          </div>
          <span v-if="memoCount > 0" class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
            {{ memoCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

const isMobileMenuOpen = ref(false);
</script>
