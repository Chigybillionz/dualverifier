<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
    <div class="w-full max-w-lg bg-[#0E1424] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
            🆔
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">DID Identity & Device Manager</h3>
            <p class="text-[11px] text-slate-400 font-mono">Private User Isolation & Cross-Device Session Testing</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white p-1">✕</button>
      </div>

      <!-- Current Identity Card -->
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 font-mono uppercase text-[10px]">Active Authenticated Account</span>
          <span
            class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
            :class="isDeveloper ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'"
          >
            {{ currentUser?.role.toUpperCase() }}
          </span>
        </div>
        <div class="font-bold text-slate-100 text-sm">{{ currentUser?.displayName }}</div>
        <div class="p-2 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-blue-400 break-all select-all">
          {{ currentUser?.did }}
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
          <span>Device: {{ currentSession?.deviceName || clientDevice.deviceName }}</span>
          <span>IP: {{ currentSession?.ipAddress || '102.89.xxx.xxx' }}</span>
        </div>
      </div>

      <!-- Quick Switch Test Accounts (Matches Verification Requirements) -->
      <div class="space-y-2">
        <label class="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
          Switch Account / Identity Scenario:
        </label>
        <div class="space-y-2">
          <button
            v-for="acc in PRESET_ACCOUNTS"
            :key="acc.did"
            @click="switchPreset(acc)"
            type="button"
            class="w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group"
            :class="[
              currentUser?.did === acc.did
                ? 'bg-blue-950/40 border-blue-500/80 shadow-md shadow-blue-500/10'
                : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
            ]"
          >
            <div class="space-y-0.5">
              <div class="text-xs font-bold text-white group-hover:text-blue-300 flex items-center gap-1.5">
                <span>{{ acc.deviceType === 'mobile' ? '📱' : '💻' }}</span>
                <span>{{ acc.label }}</span>
                <span v-if="currentUser?.did === acc.did" class="text-[10px] text-emerald-400 font-mono font-normal">
                  (Active)
                </span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                {{ acc.did.slice(0, 22) }}... • {{ acc.authMethod }}
              </div>
            </div>
            <span class="text-xs text-blue-400 font-mono font-bold group-hover:translate-x-0.5 transition-transform">
              {{ currentUser?.did === acc.did ? '✓' : 'Switch ➔' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Custom DID Login (Arbitrary DID / Web3 Wallet / Passkey) -->
      <div class="space-y-2 pt-2 border-t border-slate-800">
        <label class="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider block">
          Or Enter Custom DID:
        </label>
        <div class="flex items-center space-x-2">
          <input
            v-model="customDidInput"
            type="text"
            placeholder="did:key:z6Mku... or did:pkh:stellar:..."
            class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 outline-none focus:border-blue-500"
          />
          <button
            @click="handleCustomLogin"
            :disabled="!customDidInput.trim()"
            class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-mono font-bold transition-all shrink-0"
          >
            Log In
          </button>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
        <button
          @click="handleLogout"
          class="text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
        >
          <span>🚪 Log Out (Clear Session)</span>
        </button>
        <button
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  currentUser,
  currentSession,
  isDeveloper,
  PRESET_ACCOUNTS,
  loginWithDid,
  logout,
  detectDeviceInfo
} from '../utils/auth';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'account-changed'): void;
}>();

const customDidInput = ref('');
const clientDevice = detectDeviceInfo();

async function switchPreset(acc: any) {
  const success = await loginWithDid({
    did: acc.did,
    displayName: acc.displayName,
    role: acc.role,
    deviceName: acc.device,
    deviceType: acc.deviceType,
    authenticationMethod: acc.authMethod
  });

  if (success) {
    emit('account-changed');
  }
}

async function handleCustomLogin() {
  if (!customDidInput.value.trim()) return;
  const did = customDidInput.value.trim();
  const success = await loginWithDid({
    did,
    displayName: `User (${did.slice(0, 10)}...)`,
    role: did.toLowerCase().includes('dev') ? 'developer' : 'user',
    authenticationMethod: 'DID_KEY_PASSKEY'
  });

  if (success) {
    customDidInput.value = '';
    emit('account-changed');
  }
}

async function handleLogout() {
  await logout();
  emit('account-changed');
}
</script>

