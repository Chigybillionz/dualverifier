<template>
  <div class="space-y-4">
    <!-- Header with Stats -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <span>Recent Forensic Attestations & Zcash Memo Anchors</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 font-mono border border-blue-800">
            Live Audit Ledger
          </span>
        </h3>
        <p class="text-xs text-slate-400">
          Permanent session history of verified NIBSS transfers and Zcash shielded memos with double-spend protection.
        </p>
      </div>

      <div class="flex items-center space-x-2 text-xs font-mono">
        <span class="text-slate-400">Total Attested:</span>
        <span class="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-bold font-mono">{{ items.length }}</span>
      </div>
    </div>

    <!-- Live Ledger Table -->
    <div class="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" class="py-3 px-4">Time</th>
              <th scope="col" class="py-3 px-4">Rail</th>
              <th scope="col" class="py-3 px-4">Sender ➔ Receiver</th>
              <th scope="col" class="py-3 px-4">Amount</th>
              <th scope="col" class="py-3 px-4">Zcash 512B Memo Hash</th>
              <th scope="col" class="py-3 px-4">Verdict Badge</th>
              <th scope="col" class="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 font-sans">
            <tr
              v-for="(item, idx) in items"
              :key="idx"
              class="hover:bg-slate-850/60 transition-colors group cursor-pointer"
              @click="$emit('select-history-item', item)"
            >
              <!-- Time -->
              <td class="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                {{ formatTime(item.timestamp) }}
              </td>

              <!-- Rail -->
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  :class="item.rail === 'LOCAL_BANK' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-blue-950 text-blue-300 border border-blue-800'"
                >
                  {{ item.rail === 'LOCAL_BANK' ? 'Web2 NIBSS' : 'Web3 Zcash' }}
                </span>
              </td>

              <!-- Sender -> Receiver -->
              <td class="py-3 px-4 font-medium text-slate-200">
                <div class="flex items-center space-x-1.5 truncate max-w-xs">
                  <span class="truncate text-slate-300">{{ item.sender }}</span>
                  <span class="text-slate-500 font-mono">➔</span>
                  <span class="truncate text-white font-semibold">{{ item.receiver }}</span>
                </div>
              </td>

              <!-- Amount -->
              <td class="py-3 px-4 font-mono font-bold whitespace-nowrap" :class="item.rail === 'LOCAL_BANK' ? 'text-emerald-400' : 'text-amber-400'">
                {{ item.amount }}
              </td>

              <!-- Zcash 512B Memo Hash -->
              <td class="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap truncate max-w-[140px]" :title="item.proofHash">
                <span class="text-blue-400">{{ item.proofHash.slice(0, 8) }}...{{ item.proofHash.slice(-6) }}</span>
              </td>

              <!-- Verdict Badge -->
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  :class="[
                    item.status === 'VERIFIED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : item.status === 'DUPLICATE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  ]"
                >
                  {{ item.status === 'VERIFIED' ? 'AUTHENTIC' : item.status === 'DUPLICATE' ? 'REPLAY BLOCKED' : 'FORGERY DETECTED' }}
                </span>
              </td>

              <!-- Action: View Proof -->
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <button
                  @click.stop="$emit('select-history-item', item)"
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
    </div>
  </div>
</template>

<script setup lang="ts">
export interface HistoryAuditItem {
  id: string;
  timestamp: string;
  rail: 'LOCAL_BANK' | 'ZCASH';
  sender: string;
  receiver: string;
  amount: string;
  currency: string;
  proofHash: string;
  status: 'VERIFIED' | 'DUPLICATE' | 'TAMPERED';
  badgeTitle: string;
  fullBlueCard: any;
}

defineProps<{
  items: HistoryAuditItem[];
}>();

defineEmits<{
  (e: 'select-history-item', item: HistoryAuditItem): void;
}>();

function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
</script>
