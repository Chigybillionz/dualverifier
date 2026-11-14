<template>
  <div class="space-y-4 sm:space-y-5">
    <!-- 1. Mode Selector: Upload Receipt vs Direct ID -->
    <div class="flex flex-wrap items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3 gap-2">
      <div class="inline-flex rounded-xl bg-slate-900 p-0.5 sm:p-1 border border-slate-800 shadow-sm">
        <button
          @click="inputMode = 'upload'"
          type="button"
          :class="[
            'px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-1.5',
            inputMode === 'upload'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Upload Receipt</span>
        </button>

        <button
          @click="inputMode = 'session'"
          type="button"
          :class="[
            'px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono font-bold rounded-lg transition-all flex items-center space-x-1.5',
            inputMode === 'session'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span>Direct ID</span>
        </button>
      </div>

      <!-- Optional Vision Key Config -->
      <button
        @click="isKeyModalOpen = true"
        type="button"
        class="inline-flex items-center space-x-1 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all font-mono shrink-0"
        :class="hasCustomApiKey ? 'bg-blue-950/60 border-blue-600/50 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="hasCustomApiKey ? 'bg-blue-400 animate-pulse' : 'bg-slate-500'"></span>
        <span>{{ hasCustomApiKey ? 'Vision Active' : 'Vision AI' }}</span>
      </button>
    </div>

    <!-- ── MODE A: FILE DROPZONE & AI OCR SCANNER ── -->
    <div v-if="inputMode === 'upload'" class="space-y-3 sm:space-y-4">
      <!-- File Dropzone -->
      <div
        v-if="!selectedFile"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
        :class="[
          'relative border-2 border-dashed rounded-2xl p-5 sm:p-8 text-center transition-all cursor-pointer group',
          isDragging
            ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/20'
            : 'border-slate-800 hover:border-blue-500/50 bg-slate-900/40 hover:bg-slate-900/80'
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

        <div class="flex flex-col items-center space-y-2 sm:space-y-3">
          <div class="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all">
            <svg class="w-5 h-5 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div class="space-y-1">
            <p class="text-xs sm:text-sm font-semibold text-slate-100">
              Drop bank receipt screenshot or <span class="text-blue-400 underline">browse</span>
            </p>
            <p class="text-[11px] text-slate-400">
              Supports OPay, Moniepoint, PalmPay, GTBank, Zenith, Access (PNG, JPG)
            </p>
          </div>
        </div>
      </div>

      <!-- Scanning Progress -->
      <div v-if="isScanning" class="p-5 rounded-2xl bg-slate-900 border border-blue-500/30 text-center space-y-3">
        <div class="flex items-center justify-center space-x-3">
          <svg class="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs font-semibold text-slate-200">{{ scanStepText }}</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
          <div class="bg-blue-500 h-1.5 transition-all duration-300" :style="{ width: `${scanPercent}%` }"></div>
        </div>
      </div>

      <!-- Document Verification Notice (Optional review helper) -->
      <div
        v-if="!isClassifying && classification && !classification.isPaymentReceipt && classification.documentType !== 'BLOCKCHAIN_TRANSACTION'"
        class="p-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 space-y-2"
      >
        <div class="flex items-center space-x-2 text-amber-300 text-xs font-bold">
          <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Receipt Verification Notice</span>
        </div>
        <p class="text-xs text-amber-200/90 leading-relaxed pl-6">
          {{ classification.reason }} Please verify the extracted reference and amount below before confirming.
        </p>
      </div>

      <!-- Scanned Receipt Summary Card (Clean, Minimalist HCI Layout) -->
      <div v-if="selectedFile && !isScanning" class="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-lg">
        <!-- Thumbnail & File Info Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center space-x-3">
            <div
              v-if="previewUrl"
              @click="showFullImage = true"
              class="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800 overflow-hidden cursor-pointer hover:border-blue-400 transition-all flex items-center justify-center group relative shrink-0"
              title="Click to view full image"
            >
              <img :src="previewUrl" alt="Receipt Preview" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs">{{ selectedFile.name }}</p>
              <p class="text-[11px] text-emerald-400 font-mono">✓ Genuine Receipt Detected</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="reScanReceipt"
              class="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
            >
              🔄 Re-Scan
            </button>
            <button
              @click="clearFile"
              class="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Clean Extracted Overview (Gestalt Proximity & Direct Manipulation) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-slate-500 block uppercase font-mono">Amount (₦)</span>
              <span class="text-[9px] text-blue-400 font-mono">Editable ✏️</span>
            </div>
            <div class="flex items-center mt-1">
              <span class="text-base font-extrabold text-white mr-1 font-mono">₦</span>
              <input
                v-model.number="extractedData.amount"
                type="number"
                class="bg-transparent text-base font-extrabold text-white w-full outline-none font-mono focus:text-blue-300"
                placeholder="0"
              />
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-slate-500 block uppercase font-mono">Reference / Session ID</span>
              <span class="text-[9px] text-emerald-400 font-mono">Editable ✏️</span>
            </div>
            <input
              v-model="extractedData.sessionId"
              type="text"
              class="bg-transparent text-xs font-mono font-bold text-emerald-400 w-full outline-none mt-1 break-all focus:text-white"
              placeholder="Session ID (30 digits)"
            />
          </div>

          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span class="text-[10px] text-slate-500 block uppercase font-mono">Sender</span>
            <span class="text-xs font-medium text-slate-200 truncate block">{{ extractedData.senderName || 'Account Holder' }}</span>
            <span class="text-[10px] text-slate-400 truncate block">{{ extractedData.senderBank }}</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span class="text-[10px] text-slate-500 block uppercase font-mono">Beneficiary</span>
            <span class="text-xs font-medium text-slate-200 truncate block">{{ extractedData.receiverName || 'Recipient' }}</span>
            <span class="text-[10px] text-slate-400 truncate block">{{ extractedData.receiverBank }}</span>
          </div>
        </div>

        <!-- Collapsible Manual Adjustments (Progressive Disclosure) -->
        <div class="pt-1">
          <button
            @click="showEditFields = !showEditFields"
            type="button"
            class="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 transition-colors"
          >
            <span>{{ showEditFields ? '▲ Hide manual field adjustments' : '✏️ Edit details or manual overrides' }}</span>
          </button>

          <div v-if="showEditFields" class="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div>
              <label class="text-[10px] text-slate-400 block mb-1 font-mono">Session ID / Reference Number</label>
              <input
                v-model="extractedData.sessionId"
                type="text"
                class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] text-slate-400 block mb-1 font-mono">Sender Bank</label>
                <select
                  v-model="extractedData.senderBank"
                  class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-blue-500"
                >
                  <option v-for="b in NIGERIAN_BANKS" :key="b" :value="b">{{ b }}</option>
                </select>
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1 font-mono">Amount (₦)</label>
                <input
                  v-model.number="extractedData.amount"
                  type="number"
                  class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODE B: DIRECT REFERENCE ID ── -->
    <div v-else class="space-y-4">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
          30-Digit NIBSS Session ID or 24-Digit FinTech Reference
        </label>
        <input
          v-model="manualSessionId"
          type="text"
          placeholder="e.g. 000013260315143022100004998231 or 261106010100277826159866"
          class="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3.5 text-white font-mono text-xs outline-none"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-slate-400 mb-1">Sender Bank</label>
          <select
            v-model="manualSenderBank"
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-blue-500"
          >
            <option v-for="b in NIGERIAN_BANKS" :key="b" :value="b">{{ b }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Amount (₦)</label>
          <input
            v-model.number="manualAmount"
            type="number"
            class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- ── BIG PRIMARY ACTION BUTTON (Norman's Stage 4: Execute Action) ── -->
    <button
      @click="executeVerification"
      :disabled="
        isLoading ||
        isScanning ||
        isClassifying ||
        (inputMode === 'upload' && !selectedFile) ||
        (inputMode === 'session' && cleanSessionId.length < 10)
      "
      type="button"
      class="w-full py-3.5 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans active:scale-[0.99] bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25"
    >
      <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-else>
        {{ isLoading ? 'Verifying Cryptography & Releasing Escrow...' : 'Verify Receipt & Release Pollar Escrow' }}
      </span>
    </button>

    <!-- Gemini Key Modal -->
    <div
      v-if="isKeyModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      @click.self="isKeyModalOpen = false"
    >
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 class="font-bold text-white text-sm">Google Gemini Vision OCR (Optional)</h3>
          <button @click="isKeyModalOpen = false" class="text-slate-400 hover:text-white">✕</button>
        </div>
        <p class="text-xs text-slate-300">
          DualVerifier works 100% on-device via Tesseract.js. For extra precision on faint or camera-skewed receipts, paste your Gemini API key below.
        </p>
        <input
          v-model="inputApiKey"
          type="password"
          placeholder="AIzaSy..."
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-blue-500"
        />
        <div class="flex justify-end space-x-2 pt-2">
          <button @click="isKeyModalOpen = false" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
          <button @click="saveApiKey" class="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Save Key</button>
        </div>
      </div>
    </div>

    <!-- Full Image Zoom Modal -->
    <div
      v-if="showFullImage && previewUrl"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
      @click.self="showFullImage = false"
    >
      <div class="relative max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl flex flex-col items-center">
        <button
          @click="showFullImage = false"
          class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center border border-slate-700"
        >
          ✕
        </button>
        <img :src="previewUrl" alt="Receipt Full" class="max-w-full max-h-[80vh] object-contain rounded-xl" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { performReceiptOcr } from '../utils/receiptOcr';
import { classifyReceiptDocument, type ReceiptClassification } from '../utils/receiptClassifier';
import { getAllCbnBanks, lookupCbnBank } from '../utils/cbnBankCodes';

const props = defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'verify', payload: any): void;
  (e: 'reset-verification'): void;
}>();

const NIGERIAN_BANKS = getAllCbnBanks().map(b => b.name);

const inputMode = ref<'upload' | 'session'>('upload');
const isDragging = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isScanning = ref(false);
const isClassifying = ref(false);
const scanPercent = ref(0);
const scanStepText = ref('Reading receipt image...');
const showFullImage = ref(false);
const showEditFields = ref(false);
const isKeyModalOpen = ref(false);
const inputApiKey = ref('');
const hasCustomApiKey = ref(false);

const classification = ref<ReceiptClassification | null>(null);

const extractedData = reactive({
  senderName: 'Chibuike Okonkwo',
  senderBank: 'Guaranty Trust Bank (GTBank)',
  receiverName: 'Lekki Gadget Depot Ltd',
  receiverBank: 'OPay Digital Services',
  receiverAccount: '••••••••••',
  amount: 150000,
  currency: 'NGN',
  sessionId: '000013260315143022100004998231',
  receiptTimestamp: new Date().toISOString(),
  simulatedTamperScore: 98,
  flaggedSoftware: '',
  confidenceNotes: '',
  ocrEngine: 'Tesseract.js (Client)'
});

const manualSessionId = ref('000013260315143022100004998231');
const manualSenderBank = ref('Guaranty Trust Bank (GTBank)');
const manualAmount = ref(150000);

const cleanSessionId = computed(() => {
  const raw = inputMode.value === 'upload' ? extractedData.sessionId : manualSessionId.value;
  return (raw || '').replace(/[^0-9]/g, '');
});

onMounted(() => {
  const key = localStorage.getItem('gemini_api_key');
  if (key) {
    hasCustomApiKey.value = true;
    inputApiKey.value = key;
  }
});

function saveApiKey() {
  if (inputApiKey.value.trim()) {
    localStorage.setItem('gemini_api_key', inputApiKey.value.trim());
    hasCustomApiKey.value = true;
  }
  isKeyModalOpen.value = false;
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    processFile(e.dataTransfer.files[0]);
  }
}

async function processFile(file: File) {
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  emit('reset-verification');

  // Reset extracted fields for new upload so past defaults never corrupt verification
  extractedData.sessionId = '';
  extractedData.amount = 0;
  extractedData.senderBank = '';
  extractedData.senderName = '';
  extractedData.receiverBank = '';
  extractedData.receiverName = '';
  extractedData.receiverAccount = '';
  extractedData.flaggedSoftware = '';
  extractedData.confidenceNotes = '';

  // Step 1: AI Document Classification (runs without blocking OCR)
  isClassifying.value = true;
  try {
    const apiKey = localStorage.getItem('gemini_api_key') || undefined;
    const result = await classifyReceiptDocument(file, { apiKey });
    classification.value = result;
  } catch (err) {
    console.warn('Classifier fallback:', err);
  } finally {
    isClassifying.value = false;
  }

  // Step 2: OCR Extraction
  isScanning.value = true;
  scanPercent.value = 20;
  scanStepText.value = 'Analyzing document layout...';

  try {
    const apiKey = localStorage.getItem('gemini_api_key') || undefined;
    const ocrResult = await performReceiptOcr(file, {
      apiKey,
      onProgress: (p) => {
        scanPercent.value = Math.round(p * 100);
        if (p > 0.6) scanStepText.value = 'Extracting transfer reference & amount...';
      }
    });

    if (ocrResult.sessionId) {
      extractedData.sessionId = ocrResult.sessionId;
      // Auto-resolve sender bank from 6-digit NIBSS code
      if (ocrResult.sessionId.length >= 6) {
        const bank = lookupCbnBank(ocrResult.sessionId.substring(0, 6));
        if (bank) {
          extractedData.senderBank = bank.name;
        }
      }
    }
    if (ocrResult.amount !== undefined && ocrResult.amount !== null && ocrResult.amount > 0) {
      extractedData.amount = ocrResult.amount;
    }
    if (ocrResult.senderBank && !extractedData.senderBank) extractedData.senderBank = ocrResult.senderBank;
    if (ocrResult.senderName) extractedData.senderName = ocrResult.senderName;
    if (ocrResult.receiverBank) extractedData.receiverBank = ocrResult.receiverBank;
    if (ocrResult.receiverName) extractedData.receiverName = ocrResult.receiverName;
    if (ocrResult.receiverAccount) extractedData.receiverAccount = ocrResult.receiverAccount;
    if (ocrResult.receiptTimestamp) extractedData.receiptTimestamp = ocrResult.receiptTimestamp;
    if (ocrResult.ocrEngine) extractedData.ocrEngine = ocrResult.ocrEngine;
    if (ocrResult.confidenceNotes) extractedData.confidenceNotes = ocrResult.confidenceNotes;
  } catch (err) {
    console.error('OCR failed:', err);
  } finally {
    isScanning.value = false;
    scanPercent.value = 100;
  }
}

function clearFile() {
  selectedFile.value = null;
  previewUrl.value = null;
  classification.value = null;
  extractedData.sessionId = '';
  extractedData.amount = 0;
  extractedData.senderBank = '';
  extractedData.senderName = '';
  extractedData.receiverBank = '';
  extractedData.receiverName = '';
  extractedData.receiverAccount = '';
  extractedData.flaggedSoftware = '';
  extractedData.confidenceNotes = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
  emit('reset-verification');
}

function reScanReceipt() {
  if (selectedFile.value) {
    processFile(selectedFile.value);
  }
}

function executeVerification() {
  if (inputMode.value === 'upload') {
    const formData = new FormData();
    if (selectedFile.value) {
      formData.append('receipt', selectedFile.value);
    }
    formData.append('sessionId', cleanSessionId.value);
    formData.append('senderBank', extractedData.senderBank);
    formData.append('senderName', extractedData.senderName);
    formData.append('receiverBank', extractedData.receiverBank);
    formData.append('receiverName', extractedData.receiverName);
    formData.append('amount', String(extractedData.amount || 0));
    formData.append('currency', 'NGN');
    formData.append('receiptTimestamp', extractedData.receiptTimestamp || new Date().toISOString());
    if (extractedData.simulatedTamperScore !== undefined) {
      formData.append('simulatedTamperScore', String(extractedData.simulatedTamperScore));
    }
    if (extractedData.flaggedSoftware) {
      formData.append('flaggedSoftware', extractedData.flaggedSoftware);
    }

    emit('verify', {
      mode: 'file',
      file: selectedFile.value,
      formData,
      data: {
        sessionId: cleanSessionId.value,
        senderBank: extractedData.senderBank,
        senderName: extractedData.senderName,
        receiverBank: extractedData.receiverBank,
        receiverName: extractedData.receiverName,
        receiverAccount: extractedData.receiverAccount,
        amount: Number(extractedData.amount) || 0,
        currency: 'NGN',
        receiptTimestamp: extractedData.receiptTimestamp,
        simulatedTamperScore: extractedData.simulatedTamperScore,
        flaggedSoftware: extractedData.flaggedSoftware
      }
    });
  } else {
    emit('verify', {
      mode: 'session',
      data: {
        sessionId: cleanSessionId.value,
        senderBank: manualSenderBank.value,
        senderName: extractedData.senderName || 'Adeola Bakare',
        receiverBank: extractedData.receiverBank || 'OPay Digital Services Limited',
        receiverName: extractedData.receiverName || 'Settled Merchant',
        receiverAccount: extractedData.receiverAccount || '8034567890',
        amount: Number(manualAmount.value) || 0,
        currency: 'NGN',
        receiptTimestamp: extractedData.receiptTimestamp || new Date().toISOString(),
        simulatedTamperScore: extractedData.simulatedTamperScore,
        flaggedSoftware: extractedData.flaggedSoftware
      }
    });
  }
}

defineExpose({
  loadPreset(data: any) {
    selectedFile.value = null;
    previewUrl.value = null;
    classification.value = null;
    inputMode.value = 'session';
    manualSessionId.value = data.sessionId || '';
    manualSenderBank.value = data.senderBank || 'Guaranty Trust Bank (GTBank)';
    manualAmount.value = data.amount || 150000;
    extractedData.sessionId = data.sessionId || '';
    extractedData.senderBank = data.senderBank || 'Guaranty Trust Bank (GTBank)';
    extractedData.senderName = data.senderName || 'Verified Sender';
    extractedData.receiverBank = data.receiverBank || 'OPay Digital Services';
    extractedData.receiverName = data.receiverName || 'Verified Recipient';
    extractedData.amount = data.amount || 0;
    extractedData.simulatedTamperScore = data.simulatedTamperScore;
    extractedData.flaggedSoftware = data.flaggedSoftware || '';
  }
});
</script>
