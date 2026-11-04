<template>
  <div class="space-y-6">
    <!-- Sub-tab mode selector: File Upload vs Direct Session ID -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div class="flex items-center space-x-2">
        <button
          @click="inputMode = 'upload'"
          :class="[
            'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2',
            inputMode === 'upload'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          ]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Upload Receipt (AI Vision OCR)</span>
        </button>

        <button
          @click="inputMode = 'session'"
          :class="[
            'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-2',
            inputMode === 'session'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          ]"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span>Direct 30-Digit NIBSS Session ID</span>
        </button>
      </div>

      <!-- Quick Pill -->
      <div class="hidden sm:flex items-center text-xs text-slate-400 font-mono">
        <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
        <span>CBN Institution Gateway</span>
      </div>
    </div>

    <!-- MODE 1: File Dropzone & Multimodal OCR -->
    <div v-if="inputMode === 'upload'" class="space-y-4">
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
        :class="[
          'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group',
          isDragging
            ? 'border-emerald-400 bg-emerald-950/25 shadow-lg shadow-emerald-500/20'
            : selectedFile
            ? 'border-emerald-500/60 bg-emerald-950/15'
            : 'border-slate-800 hover:border-emerald-500/50 bg-slate-900/60 hover:bg-slate-850'
        ]"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          class="hidden"
          @change="handleFileSelect"
        />

        <!-- Preview if file selected -->
        <div v-if="selectedFile" class="flex flex-col items-center space-y-3">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-200">{{ selectedFile.name }}</p>
            <p class="text-xs text-slate-400">{{ (selectedFile.size / 1024).toFixed(1) }} KB • Ready for Vision OCR & Zcash Memo Anchor</p>
          </div>
          <button
            @click.stop="clearFile"
            class="text-xs text-rose-400 hover:text-rose-300 underline"
          >
            Remove file
          </button>
        </div>

        <!-- Default Drop Placeholder -->
        <div v-else class="flex flex-col items-center space-y-3">
          <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all shadow-inner">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-200">
              Drag & drop Nigerian bank receipt here, or <span class="text-emerald-400 underline">browse</span>
            </p>
            <p class="text-xs text-slate-400">
              Supports OPay, Moniepoint, GTBank, Zenith, Access, Kuda, PalmPay (PNG, JPG, PDF up to 10MB)
            </p>
          </div>
          <div class="inline-flex items-center space-x-2 text-[11px] text-slate-400 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Gemini 1.5 Flash Vision OCR + Zcash 512-Byte Encrypted Memo</span>
          </div>
        </div>
      </div>

      <!-- Quick sample receipts buttons -->
      <div class="flex items-center justify-between text-xs pt-1">
        <span class="text-slate-400">Or test with demo templates:</span>
        <div class="flex items-center space-x-2">
          <button
            @click="loadSampleReceipt('valid-gtb')"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition-colors"
          >
            Valid GTBank Receipt
          </button>
          <button
            @click="loadSampleReceipt('fake-alert')"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-colors"
          >
            Fake Alert (Canva Spoofed)
          </button>
        </div>
      </div>
    </div>

    <!-- MODE 2: Direct 30-Digit NIBSS Session ID Input -->
    <div v-else class="space-y-4">
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            30-Digit NIBSS Session ID / Reference Number
          </label>
          <span
            :class="[
              'text-xs font-mono px-2 py-0.5 rounded-lg',
              cleanSessionId.length === 30
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            ]"
          >
            {{ cleanSessionId.length }} / 30 digits
          </span>
        </div>
        <div class="relative">
          <input
            v-model="rawSessionInput"
            type="text"
            placeholder="e.g. 000013250324114215984716382910"
            maxlength="34"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-2xl px-4 py-3.5 text-slate-100 font-mono text-sm tracking-wider placeholder:text-slate-600 transition-all outline-none"
          />
          <button
            v-if="rawSessionInput"
            @click="rawSessionInput = ''"
            class="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Real-Time Segment Breakdown Box (Live Math Preview) -->
      <div v-if="cleanSessionId.length >= 6" class="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          NIBSS 30-Digit Structural Segmentation:
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
          <!-- Segment 1: Bank Code -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Digits 1–6 (Bank Code):</span>
            <span class="text-emerald-400 font-bold text-sm">{{ cleanSessionId.substring(0, 6) }}</span>
            <span class="text-[10px] text-slate-300 block truncate mt-0.5">
              {{ resolvedLiveBank || 'Resolving...' }}
            </span>
          </div>

          <!-- Segment 2: Execution Time -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Digits 7–18 (YYMMDDHHMMSS):</span>
            <span class="text-teal-400 font-bold text-sm">
              {{ cleanSessionId.substring(6, 18) || '••••••••••••' }}
            </span>
            <span class="text-[10px] text-slate-300 block truncate mt-0.5">
              {{ liveParsedTime || 'Execution Timestamp' }}
            </span>
          </div>

          <!-- Segment 3: Serial Sequence -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Digits 19–30 (Serial Entropy):</span>
            <span class="text-cyan-400 font-bold text-sm">
              {{ cleanSessionId.substring(18, 30) || '••••••••••••' }}
            </span>
            <span class="text-[10px] text-slate-300 block truncate mt-0.5">
              {{ liveEntropyCheck }}
            </span>
          </div>
        </div>
      </div>

      <!-- Claimed Sender Bank Selector for Cross-Check -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Claimed Sender Bank on Receipt</label>
          <select
            v-model="claimedSenderBank"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm outline-none font-sans"
          >
            <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank - 000013)</option>
            <option value="Access Bank PLC">Access Bank PLC (000014)</option>
            <option value="Zenith Bank PLC">Zenith Bank PLC (000015)</option>
            <option value="First Bank of Nigeria">First Bank of Nigeria (000011)</option>
            <option value="United Bank for Africa">United Bank for Africa (000016)</option>
            <option value="Wema Bank / ALAT">Wema Bank / ALAT (000017)</option>
            <option value="Moniepoint Microfinance Bank">Moniepoint Microfinance Bank (090405)</option>
            <option value="OPay Digital Services">OPay Digital Services (100004)</option>
            <option value="PalmPay Limited">PalmPay Limited (100033)</option>
            <option value="Kuda Microfinance Bank">Kuda Microfinance Bank (090267)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">Claimed Transfer Amount (₦)</label>
          <input
            v-model="claimedAmount"
            type="number"
            placeholder="50000"
            class="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm font-mono outline-none"
          />
        </div>
      </div>
    </div>

    <!-- ACTION BUTTON: Verify & Anchor to Zcash Shielded Memo -->
    <div class="pt-2">
      <button
        @click="executeVerification"
        :disabled="isLoading || (!selectedFile && cleanSessionId.length < 10)"
        class="w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-sans shadow-emerald-500/25 active:scale-[0.99]"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <svg v-else class="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>

        <span>{{ isLoading ? 'Decoding NIBSS & Anchoring to Zcash 512B Memo...' : 'Verify Transfer & Anchor to Zcash Shielded Memo' }}</span>
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

const inputMode = ref<'upload' | 'session'>('upload');
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

const rawSessionInput = ref('');
const claimedSenderBank = ref('Guaranty Trust Bank (GTBank)');
const claimedAmount = ref(50000);

const cleanSessionId = computed(() => {
  return rawSessionInput.value.replace(/[^0-9]/g, '');
});

const resolvedLiveBank = computed(() => {
  const code = cleanSessionId.value.substring(0, 6);
  if (code === '000013') return 'Guaranty Trust Bank (GTBank)';
  if (code === '000014') return 'Access Bank PLC';
  if (code === '000015') return 'Zenith Bank PLC';
  if (code === '000011') return 'First Bank of Nigeria';
  if (code === '000016') return 'United Bank for Africa (UBA)';
  if (code === '000017') return 'Wema Bank (ALAT)';
  if (code === '090405') return 'Moniepoint MFB';
  if (code === '100004') return 'OPay Digital Services';
  if (code === '100033') return 'PalmPay Limited';
  if (code === '090267') return 'Kuda Microfinance Bank';
  if (code.length === 6) return `Bank Code [${code}]`;
  return '';
});

const liveParsedTime = computed(() => {
  const t = cleanSessionId.value.substring(6, 18);
  if (t.length === 12) {
    const yy = t.substring(0, 2);
    const mm = t.substring(2, 4);
    const dd = t.substring(4, 6);
    const hh = t.substring(6, 8);
    const min = t.substring(8, 10);
    return `20${yy}-${mm}-${dd} ${hh}:${min} WAT`;
  }
  return '';
});

const liveEntropyCheck = computed(() => {
  const s = cleanSessionId.value.substring(18, 30);
  if (s.length === 12) {
    if (/^(\d)\1+$/.test(s)) return '⚠️ Repetitive Dummy (0 bits)';
    if ('0123456789012345'.includes(s)) return '⚠️ Sequential Sequence';
    return 'Cryptographic Entropy (OK)';
  }
  return 'Entropy Evaluator';
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
}

function handleFileDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0];
  }
}

function clearFile() {
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function loadSampleReceipt(type: 'valid-gtb' | 'fake-alert') {
  if (type === 'valid-gtb') {
    inputMode.value = 'session';
    rawSessionInput.value = '000013250324114215984716382910';
    claimedSenderBank.value = 'Guaranty Trust Bank (GTBank)';
    claimedAmount.value = 50000;
  } else {
    inputMode.value = 'session';
    rawSessionInput.value = '000014250518143000111111111111';
    claimedSenderBank.value = 'Guaranty Trust Bank (GTBank)'; // Mismatch!
    claimedAmount.value = 85000;
  }
}

function executeVerification() {
  if (inputMode.value === 'upload' && selectedFile.value) {
    const formData = new FormData();
    formData.append('receipt', selectedFile.value);
    emit('verify', { mode: 'file', formData });
  } else {
    emit('verify', {
      mode: 'json',
      data: {
        sessionId: cleanSessionId.value,
        senderBank: claimedSenderBank.value,
        amount: claimedAmount.value,
        currency: 'NGN'
      }
    });
  }
}

defineExpose({
  loadPreset: (sessionId: string, senderBank: string, amount: number) => {
    inputMode.value = 'session';
    rawSessionInput.value = sessionId;
    claimedSenderBank.value = senderBank;
    claimedAmount.value = amount;
    executeVerification();
  }
});
</script>
