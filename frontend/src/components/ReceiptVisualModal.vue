<template>
  <div v-if="isOpen && receipt" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden z-10 font-sans border-4 border-command-700">
      <!-- Top Receipt Header -->
      <div
        class="p-5 text-white flex items-center justify-between"
        :style="{ backgroundColor: isForged ? '#dd4f05' : '#dd4f05' }"
      >
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded bg-white/20 flex items-center justify-center font-bold text-sm">
            GT
          </div>
          <div>
            <h3 class="font-bold text-base leading-tight">{{ receipt.senderBank }}</h3>
            <p class="text-[11px] text-white/80">Electronic Funds Transfer Receipt</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-white/80 hover:text-white p-1">
          ✕
        </button>
      </div>

      <!-- Receipt Body -->
      <div class="p-6 space-y-5 bg-gradient-to-b from-slate-50 to-white">
        <!-- Amount & Status -->
        <div class="text-center space-y-1 pb-4 border-b border-slate-200">
          <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Transfer Amount</p>
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {{ receipt.amountFormatted }}
          </h2>
          <div class="pt-1">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
              :class="isForged ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="isForged ? 'bg-amber-500' : 'bg-emerald-500'"></span>
              {{ isForged ? 'Hanging / Visual Spoof' : 'Transfer Successful' }}
            </span>
          </div>
        </div>

        <!-- If forged, show visual callouts -->
        <div v-if="isForged" class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <div class="font-bold flex items-center gap-1 text-rose-700">
            <span>⚠️ Visual Forgery Callout</span>
          </div>
          <p class="text-[11px] leading-relaxed">
            Receipt claims GTBank (CBN Code 000013), but Session ID mathematically specifies <strong>000014 (Access Bank)</strong>.
            Serial digits end in dummy repetitions <strong>111111111111</strong>.
          </p>
        </div>

        <!-- Transaction Details Table -->
        <div class="space-y-3 text-xs">
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Sender Name</span>
            <span class="font-semibold text-slate-800 text-right">{{ receipt.senderName }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Sender Bank</span>
            <span class="font-semibold text-slate-800 text-right">{{ receipt.senderBank }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Recipient Name</span>
            <span class="font-semibold text-slate-800 text-right">{{ receipt.receiverName }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Recipient Bank</span>
            <span class="font-semibold text-slate-800 text-right">{{ receipt.receiverBank }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Account Number</span>
            <span class="font-mono font-semibold text-slate-800">{{ receipt.receiverAccount }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">Date & Time</span>
            <span class="font-mono text-slate-700 text-right">{{ receipt.timestamp }}</span>
          </div>
          <div class="py-1">
            <div class="flex justify-between mb-1">
              <span class="text-slate-500">NIBSS Session ID / Reference</span>
            </div>
            <div
              class="p-2 rounded font-mono text-[11px] break-all border"
              :class="isForged ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-slate-100 text-slate-800 border-slate-200'"
            >
              {{ receipt.sessionId }}
            </div>
          </div>
        </div>

        <!-- Footer Seal -->
        <div class="text-center pt-2">
          <p class="text-[10px] text-slate-400">
            Central Bank of Nigeria (CBN) Electronic Clearing Gateway
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  receipt: any;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const isForged = computed(() => {
  return props.receipt?.sessionId?.includes('111111111111') || props.receipt?.senderBankCode?.includes('Mismatch');
});
</script>

