<template>
  <section id="my-authentication-history" class="space-y-6 pt-4 sm:pt-6">
    <!-- 1. Dedicated Header & User Identity Banner -->
    <div class="rounded-3xl bg-gradient-to-r from-[#0E1424] via-[#121B30] to-[#0E1424] border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
      <!-- Glow ambient light -->
      <div class="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <!-- Title & Decentralized Identity (DID) -->
        <div class="space-y-2">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-[11px] font-mono font-semibold text-blue-300">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Private User Space • Cryptographically Isolated</span>
          </div>

          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>🛡️ My Authentication History</span>
            <span
              class="text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold"
              :class="isDeveloper ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'"
            >
              {{ isDeveloper ? 'Developer Account' : 'Authenticated User' }}
            </span>
          </h2>

          <!-- DID Pill & Contextual Device Metadata -->
          <div class="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
            <!-- DID Identifier -->
            <div class="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <span class="text-slate-500">DID:</span>
              <span class="text-blue-400 font-bold truncate max-w-[180px] sm:max-w-xs" :title="currentUser?.did">
                {{ currentUser?.did ? truncateDid(currentUser.did) : 'did:key:...' }}
              </span>
              <button
                @click="copyDid"
                class="text-slate-400 hover:text-white ml-1 p-0.5"
                :title="isCopied ? 'Copied!' : 'Copy DID'"
              >
                {{ isCopied ? '✓' : '📋' }}
              </button>
            </div>

            <!-- Active Device Indicator -->
            <div class="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <span class="text-slate-500">Device:</span>
              <span class="text-emerald-400 font-bold">
                {{ currentSession?.deviceName || clientDeviceInfo.deviceName }}
              </span>
            </div>

            <!-- Privacy-Preserving IP -->
            <div class="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              <span class="text-slate-500">IP:</span>
              <span class="font-mono text-slate-300">{{ currentSession?.ipAddress || '102.89.xxx.xxx' }}</span>
            </div>
          </div>
        </div>

        <!-- Account Actions (Switch User / Testing Lab) -->
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            @click="isSwitchModalOpen = true"
            type="button"
            class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500/50 text-xs font-mono font-bold transition-all shadow-sm flex items-center space-x-2 active:scale-95"
          >
            <span>👤 Switch Account / Device</span>
          </button>

          <button
            @click="fetchMyHistory"
            :disabled="isLoading"
            type="button"
            class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all active:scale-95"
            title="Refresh My History"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. THE 5 CORE METRIC SECTIONS (Requirement 3: Dedicated Dashboard) -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
      <!-- 1. My Authentication History (Total) -->
      <div class="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between space-y-2">
        <div class="flex items-center justify-between text-slate-400">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider">My History</span>
          <span class="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs">📜</span>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {{ userStats?.totalVerifications || historyRecords.length }}
          </div>
          <span class="text-[10px] text-slate-400">Total Account Records</span>
        </div>
      </div>

      <!-- 2. My Successful Verifications -->
      <div class="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between space-y-2">
        <div class="flex items-center justify-between text-emerald-400">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Successful</span>
          <span class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">✓</span>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {{ userStats?.successfulVerifications || countByStatus('SUCCESS') }}
          </div>
          <span class="text-[10px] text-slate-400">Authentic Attestations</span>
        </div>
      </div>

      <!-- 3. My Failed Verifications -->
      <div class="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between space-y-2">
        <div class="flex items-center justify-between text-rose-400">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Failed / Forged</span>
          <span class="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs">⚠</span>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
            {{ userStats?.failedVerifications || (countByStatus('FAILED') + countByStatus('TAMPERED')) }}
          </div>
          <span class="text-[10px] text-slate-400">Tampered / Invalid</span>
        </div>
      </div>

      <!-- 4. My Recent Authentication Activity -->
      <div class="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between space-y-2">
        <div class="flex items-center justify-between text-cyan-400">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Recent Activity</span>
          <span class="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs">⚡</span>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
            {{ userStats?.recentActivityCount || 0 }}
          </div>
          <span class="text-[10px] text-slate-400">Active Past 7 Days</span>
        </div>
      </div>

      <!-- 5. My Verification Transactions -->
      <div class="col-span-2 md:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/90 shadow-md flex flex-col justify-between space-y-2">
        <div class="flex items-center justify-between text-amber-400">
          <span class="text-[11px] font-mono font-bold uppercase tracking-wider">Transactions</span>
          <span class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs">💰</span>
        </div>
        <div>
          <div class="text-lg sm:text-xl font-extrabold text-amber-400 font-mono truncate" :title="userStats?.totalTransactionValueFormatted">
            {{ userStats?.totalTransactionValueFormatted || '₦0.00' }}
          </div>
          <span class="text-[10px] text-slate-400">Cumulative Settled Value</span>
        </div>
      </div>
    </div>

    <!-- 3. CONTROLS: SEARCH, STATUS TABS & DEVICE-AWARE FILTERING -->
    <div class="rounded-2xl bg-[#0E1424] border border-slate-800 p-4 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <!-- Status Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            v-for="tab in filterTabs"
            :key="tab.id"
            @click="selectedStatus = tab.id; handleFilterChange()"
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all',
              selectedStatus === tab.id
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Device Filter Dropdown & Search Bar -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Device-Aware Filter (Requirement 4: Device Isolation) -->
          <div class="relative">
            <select
              v-model="selectedDeviceId"
              @change="handleFilterChange"
              class="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            >
              <option value="ALL">All My Devices (Account-Wide)</option>
              <option :value="clientDeviceInfo.deviceId">This Device Only ({{ clientDeviceInfo.deviceName }})</option>
              <option v-for="d in distinctDevices" :key="d.deviceId" :value="d.deviceId">
                {{ d.deviceName }} ({{ d.verificationCount }} recs)
              </option>
            </select>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <input
              v-model="searchQuery"
              @keyup.enter="handleFilterChange"
              type="text"
              placeholder="Search reference, DID..."
              class="w-44 sm:w-56 bg-slate-900 border border-slate-800 text-xs font-mono rounded-xl pl-8 pr-3 py-2 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
            <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. USER AUTHENTICATION HISTORY TABLE -->
    <div class="rounded-2xl border border-slate-800 bg-[#0E1424] overflow-hidden shadow-xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 text-center text-slate-400 space-y-3">
        <svg class="animate-spin h-8 w-8 text-blue-400 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xs font-mono">Retrieving your private authentication records from server...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="historyRecords.length === 0" class="p-12 text-center space-y-4">
        <div class="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto text-xl">
          🔒
        </div>
        <div class="max-w-md mx-auto space-y-1.5">
          <h4 class="text-sm font-bold text-white">Your Authentication History is Completely Private</h4>
          <p class="text-xs text-slate-400 leading-relaxed">
            No verification records have been recorded for your account (DID: {{ currentUser?.did ? truncateDid(currentUser.did) : '' }}).
            Verifications performed by you on this device or other devices will appear privately here. Developer diagnostic logs are strictly separated.
          </p>
        </div>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" class="py-3 px-4">Record ID / Time</th>
              <th scope="col" class="py-3 px-4">Method / DID</th>
              <th scope="col" class="py-3 px-4">Device & Session</th>
              <th scope="col" class="py-3 px-4">Counterparties</th>
              <th scope="col" class="py-3 px-4">Amount</th>
              <th scope="col" class="py-3 px-4">Status Verdict</th>
              <th scope="col" class="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 font-sans">
            <tr
              v-for="rec in historyRecords"
              :key="rec.id"
              class="hover:bg-slate-850/60 transition-colors group cursor-pointer"
              @click="handleSelectRecord(rec)"
            >
              <!-- Record ID & Timestamp -->
              <td class="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                <div class="font-bold text-slate-200">{{ rec.id }}</div>
                <div class="text-[10px] text-slate-500">{{ formatTimestamp(rec.createdAt) }}</div>
              </td>

              <!-- Auth Method & DID -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-mono font-bold block w-fit mb-1"
                  :class="rec.authenticationMethod.includes('PASSKEY') ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'"
                >
                  {{ rec.authenticationMethod }}
                </span>
                <span class="font-mono text-[10px] text-slate-400 truncate max-w-[120px] block" :title="rec.did">
                  {{ truncateDid(rec.did) }}
                </span>
              </td>

              <!-- Device & Session Info (Device-Aware Isolation) -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center space-x-1.5 font-medium text-slate-300">
                  <span>{{ rec.deviceType === 'mobile' ? '📱' : '💻' }}</span>
                  <span class="truncate max-w-[140px]">{{ rec.deviceName }}</span>
                </div>
                <div class="text-[10px] font-mono text-slate-500">
                  IP: {{ rec.ipAddress }} • Ses: {{ rec.sessionId.slice(-6) }}
                </div>
              </td>

              <!-- Counterparties -->
              <td class="py-3.5 px-4">
                <div class="text-xs font-semibold text-slate-200 truncate max-w-xs">
                  {{ rec.verificationResult?.sender || 'N/A' }}
                </div>
                <div class="text-[11px] text-slate-400 truncate max-w-xs flex items-center gap-1">
                  <span class="text-slate-500">➔</span>
                  <span>{{ rec.verificationResult?.receiver || 'N/A' }}</span>
                </div>
              </td>

              <!-- Amount -->
              <td class="py-3.5 px-4 font-mono font-bold whitespace-nowrap text-emerald-400">
                {{ rec.verificationResult?.amount || 'N/A' }}
              </td>

              <!-- Verification Verdict Badge -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1"
                  :class="[
                    rec.verificationStatus === 'SUCCESS'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : rec.verificationStatus === 'DUPLICATE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  ]"
                >
                  <span>{{ rec.verificationStatus === 'SUCCESS' ? '✓' : '!' }}</span>
                  <span>{{ rec.verificationResult?.badgeTitle || rec.verificationStatus }}</span>
                </span>
              </td>

              <!-- Action: View Certificate -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <button
                  @click.stop="handleSelectRecord(rec)"
                  class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-blue-300 border border-slate-700 hover:border-blue-500/50 transition-colors inline-flex items-center gap-1"
                >
                  <span>View Proof</span>
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="pagination.totalPages > 1" class="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
        <div>
          Showing page {{ pagination.page }} of {{ pagination.totalPages }} ({{ pagination.total }} records)
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- 5. DEVELOPER DIAGNOSTICS LOGS (Requirement 8: Strict Segregation) -->
    <div v-if="isDeveloper" class="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/50 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2 text-xs font-bold font-mono text-amber-300">
          <span>🛠️ DEVELOPER DIAGNOSTIC LOGS (INTERNAL SYSTEM DEBUGGING)</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            Isolated from User Accounts
          </span>
        </div>
        <button
          @click="showDevLogs = !showDevLogs"
          class="text-xs font-mono text-amber-400 hover:underline"
        >
          {{ showDevLogs ? 'Hide Logs ▲' : 'Show Diagnostic Logs ▼' }}
        </button>
      </div>
      <p class="text-[11px] text-amber-200/80 leading-relaxed font-mono">
        These test vectors (e.g. Canva fake alert simulations) are strictly segregated from ordinary user accounts.
        Normal users will never see these internal records.
      </p>

      <div v-if="showDevLogs && devLogs.length > 0" class="space-y-2 pt-2">
        <div
          v-for="d in devLogs"
          :key="d.id"
          class="p-3 rounded-xl bg-slate-950 border border-amber-900/40 text-xs font-mono space-y-1 text-slate-300"
        >
          <div class="flex items-center justify-between">
            <span class="text-amber-400 font-bold">{{ d.id }}</span>
            <span class="text-[10px] text-slate-500">{{ formatTimestamp(d.createdAt) }}</span>
          </div>
          <div class="text-[11px] text-slate-400">Ref: {{ d.transactionReference }} • Device: {{ d.deviceName }}</div>
          <div class="text-rose-400 font-bold text-[11px]">{{ d.verificationResult?.badgeTitle }}</div>
        </div>
      </div>
    </div>

    <!-- Account Switcher Modal -->
    <DidAccountModal
      :isOpen="isSwitchModalOpen"
      @close="isSwitchModalOpen = false"
      @account-changed="handleAccountSwitched"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  currentUser,
  currentSession,
  isDeveloper,
  detectDeviceInfo,
  getAuthHeaders,
  type AuthenticationHistoryRecord,
  type UserStats,
  type UserDevice
} from '../utils/auth';
import { apiUrl } from '../utils/api';
import DidAccountModal from './DidAccountModal.vue';

const emit = defineEmits<{
  (e: 'select-record', record: AuthenticationHistoryRecord): void;
}>();

const historyRecords = ref<AuthenticationHistoryRecord[]>([]);
const userStats = ref<UserStats | null>(null);
const distinctDevices = ref<UserDevice[]>([]);
const devLogs = ref<AuthenticationHistoryRecord[]>([]);
const isLoading = ref(false);
const isCopied = ref(false);
const isSwitchModalOpen = ref(false);
const showDevLogs = ref(false);

const clientDeviceInfo = detectDeviceInfo();

const selectedStatus = ref('ALL');
const selectedDeviceId = ref('ALL');
const searchQuery = ref('');

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1
});

const filterTabs = [
  { id: 'ALL', label: 'All Records' },
  { id: 'SUCCESS', label: '✓ Successful' },
  { id: 'TAMPERED', label: '🚨 Forged / Tampered' },
  { id: 'DUPLICATE', label: '🔁 Replay Blocked' }
];

function truncateDid(did: string): string {
  if (!did) return '';
  if (did.length <= 24) return did;
  return `${did.slice(0, 14)}...${did.slice(-8)}`;
}

function copyDid() {
  if (currentUser.value?.did) {
    navigator.clipboard.writeText(currentUser.value.did);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  }
}

function formatTimestamp(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function countByStatus(status: string): number {
  return historyRecords.value.filter(r => r.verificationStatus === status).length;
}

async function fetchMyHistory() {
  isLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (selectedStatus.value !== 'ALL') params.append('status', selectedStatus.value);
    if (selectedDeviceId.value !== 'ALL') params.append('deviceId', selectedDeviceId.value);
    if (searchQuery.value.trim()) params.append('search', searchQuery.value.trim());
    params.append('page', String(pagination.value.page));
    params.append('limit', String(pagination.value.limit));

    const res = await fetch(apiUrl(`/api/authentication-history/me?${params.toString()}`), {
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      historyRecords.value = [];
      return;
    }

    const data = await res.json();
    if (data.success) {
      historyRecords.value = data.records || [];
      if (data.stats) userStats.value = data.stats;
      if (data.devices) distinctDevices.value = data.devices;
      if (data.pagination) pagination.value = data.pagination;
    }

    // If developer, fetch developer diagnostic logs
    if (isDeveloper.value) {
      fetchDevLogs();
    }
  } catch (err) {
    console.error('Failed to fetch personal authentication history:', err);
  } finally {
    isLoading.value = false;
  }
}

async function fetchDevLogs() {
  try {
    const res = await fetch(apiUrl('/api/authentication-history/developer-logs'), {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success && data.logs) {
      devLogs.value = data.logs;
    }
  } catch (err) {
    // Ignore
  }
}

function handleFilterChange() {
  pagination.value.page = 1;
  fetchMyHistory();
}

function changePage(newPage: number) {
  pagination.value.page = newPage;
  fetchMyHistory();
}

function handleAccountSwitched() {
  isSwitchModalOpen.value = false;
  pagination.value.page = 1;
  fetchMyHistory();
}

function handleSelectRecord(rec: AuthenticationHistoryRecord) {
  emit('select-record', rec);
}

onMounted(() => {
  fetchMyHistory();
});

defineExpose({
  refresh: fetchMyHistory
});
</script>

