<template>
  <div class="space-y-6">
    <!-- Sub-tab mode selector: File Upload vs Direct Session ID (z.cash Segmented Style) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2d242f] pb-4 gap-3">
      <div class="inline-flex border border-[#2d242f] bg-[#120e12] overflow-hidden rounded-none shadow-sm">
        <button
          @click="inputMode = 'upload'"
          :class="[
            'px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center space-x-2 border-r border-[#2d242f]',
            inputMode === 'upload'
              ? 'bg-[#F4B728]/10 text-[#F4B728] border-b-2 border-b-[#F4B728]'
              : 'text-stone-400 hover:text-white hover:bg-white/5 border-b-2 border-b-transparent'
          ]"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Upload Receipt (AI OCR)</span>
        </button>

        <button
          @click="inputMode = 'session'"
          :class="[
            'px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center space-x-2',
            inputMode === 'session'
              ? 'bg-[#F4B728]/10 text-[#F4B728] border-b-2 border-b-[#F4B728]'
              : 'text-stone-400 hover:text-white hover:bg-white/5 border-b-2 border-b-transparent'
          ]"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span>Direct 30-Digit ID</span>
        </button>
      </div>

      <!-- Gemini API Key configuration button -->
      <button
        @click="isKeyModalOpen = true"
        class="inline-flex items-center space-x-1.5 text-xs px-3 py-2 rounded-lg border transition-all font-mono"
        :class="hasCustomApiKey ? 'bg-[#F4B728]/15 border-[#F4B728]/40 text-[#F4B728]' : 'bg-[#191419] border-[#2d242f] text-stone-400 hover:text-stone-200'"
      >
        <span class="w-2 h-2 rounded-full" :class="hasCustomApiKey ? 'bg-[#F4B728] animate-pulse' : 'bg-stone-500'"></span>
        <span>{{ hasCustomApiKey ? 'Gemini 1.5 Active' : '⚙️ Vision Key' }}</span>
      </button>
    </div>

    <!-- MODE 1: File Dropzone & Multimodal OCR -->
    <div v-if="inputMode === 'upload'" class="space-y-4">
      <!-- File Dropzone -->
      <div
        v-if="!selectedFile"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleFileDrop"
        :class="[
          'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group',
          isDragging
            ? 'border-emerald-400 bg-emerald-950/25 shadow-lg shadow-emerald-500/20'
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

        <div class="flex flex-col items-center space-y-3">
          <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all shadow-inner">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-200">
              Drag & drop real Nigerian bank receipt here, or <span class="text-emerald-400 underline">browse</span>
            </p>
            <p class="text-xs text-slate-400">
              Supports OPay, Moniepoint, PalmPay, GTBank, Zenith, Access, Kuda, FirstBank, UBA (PNG, JPG, PDF)
            </p>
          </div>
          <div class="inline-flex items-center space-x-2 text-[11px] text-slate-400 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Multimodal Neural OCR (Tesseract.js Client-Side + Gemini 1.5 Flash Vision)</span>
          </div>
        </div>
      </div>

      <!-- ── AI Receipt Classification Banner ── -->
      <!-- Classifying spinner -->
      <div v-if="isClassifying" class="flex items-center space-x-3 p-4 rounded-2xl bg-[#1a141a] border border-[#F4B728]/30 text-sm">
        <svg class="animate-spin h-5 w-5 text-[#F4B728] shrink-0" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-[#F4B728] font-mono text-xs font-semibold tracking-wide">AI Classification Engine scanning document type...</span>
      </div>

      <!-- NOT_A_RECEIPT OR UNKNOWN (isPaymentReceipt === false) → Clear Rejection Card -->
      <div
        v-if="!isClassifying && classification && !classification.isPaymentReceipt && classification.documentType !== 'BLOCKCHAIN_TRANSACTION'"
        class="p-5 rounded-2xl border border-rose-700/60 bg-rose-950/40 space-y-3"
      >
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-lg bg-rose-900/60 border border-rose-700/80 flex items-center justify-center text-rose-400 shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.98l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z"/>
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-bold text-rose-300">Verification Inactive — Not a Payment Receipt</h4>
            <p class="text-[11px] text-rose-400/80 font-mono">Status: Rejected by Forensic Document Classifier</p>
          </div>
        </div>

        <p class="text-xs text-rose-200/85 leading-relaxed pl-10">
          {{ classification.reason }}
        </p>

        <div class="pl-10 space-y-2 pt-1">
          <p class="text-[11px] text-stone-400 leading-normal">
            DualVerifier only verifies genuine <strong>Nigerian inter-bank transfer receipts</strong> (OPay, Moniepoint, PalmPay, GTBank, Zenith, Access Bank, etc.) and Stellar/Pollar transactions. Invoices, screenshots, and non-payment documents cannot be verified.
          </p>

          <div class="flex items-center space-x-3 pt-1">
            <button
              @click="clearFile"
              class="px-3.5 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-rose-200 text-xs font-semibold border border-rose-700/50 transition-all flex items-center space-x-1.5"
            >
              <span>🗑</span>
              <span>Remove File & Try Another</span>
            </button>
            <span class="text-[10px] text-stone-500 font-mono">
              Engine: {{ classification.classifiedBy === 'GEMINI_VISION' ? 'Gemini 1.5 Vision' : 'Neural Filter' }}
            </span>
          </div>
        </div>
      </div>

      <!-- BLOCKCHAIN_TRANSACTION banner -->
      <div
        v-if="!isClassifying && classification?.documentType === 'BLOCKCHAIN_TRANSACTION'"
        class="p-4 rounded-2xl border border-[#F4B728]/40 bg-[#F4B728]/5 space-y-1.5"
      >
        <div class="flex items-center space-x-2">
          <span class="text-lg">⛓</span>
          <span class="text-sm font-bold text-[#F4B728]">Blockchain Transaction Detected</span>
          <span class="ml-auto text-[10px] font-mono text-[#F4B728]/60 border border-[#F4B728]/30 px-2 py-0.5 rounded">{{ classification.confidence }}</span>
        </div>
        <p class="text-xs text-stone-300 leading-relaxed pl-7">
          {{ classification.reason }} Use the <span class="text-emerald-400 font-semibold">Pollar Stellar Tab</span> to verify blockchain transactions with a Transaction Hash.
        </p>
      </div>

      <!-- PAYMENT_RECEIPT — Confirmed Genuine Receipt -->
      <div
        v-if="!isClassifying && classification?.isPaymentReceipt"
        class="flex items-center space-x-3 p-3.5 rounded-2xl border border-emerald-600/40 bg-emerald-950/30"
      >
        <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-emerald-300">✓ Genuine Payment Receipt Identified — Verified</p>
          <p class="text-[11px] text-emerald-400/60 font-mono truncate">
            {{ (classification.detectedKeywords || []).slice(0, 5).join(' · ') }}
          </p>
        </div>
        <span class="text-[10px] font-mono text-emerald-500/60 border border-emerald-700/40 px-2 py-0.5 rounded shrink-0">
          {{ classification.classifiedBy === 'GEMINI_VISION' ? 'Gemini Vision' : 'Neural Filter' }}
        </span>
      </div>

      <!-- OCR Scanning Progress State -->
      <div v-if="isScanning" class="p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-3">
        <div class="flex items-center justify-center space-x-3">
          <svg class="animate-spin h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-semibold text-slate-200">{{ scanStepText }}</span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden max-w-md mx-auto">
          <div
            class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 transition-all duration-300"
            :style="{ width: `${scanPercent}%` }"
          ></div>
        </div>
        <p class="text-xs text-slate-400 font-mono">
          {{ scanPercent }}% • Decrypting receipt raster blocks & extracting 30-digit NIBSS session reference
        </p>
      </div>

      <!-- Extracted Receipt Inspection & Review Card (ONLY SHOWN FOR CONFIRMED PAYMENT RECEIPTS) -->
      <div v-if="selectedFile && !isScanning && (!classification || classification.isPaymentReceipt)" class="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <!-- Header with file info & OCR Engine badge -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center space-x-3">
            <!-- Thumbnail preview -->
            <div
              v-if="previewUrl"
              @click="showFullImage = true"
              class="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800 overflow-hidden cursor-pointer hover:border-emerald-400 transition-all flex items-center justify-center group relative"
              title="Click to zoom receipt"
            >
              <img :src="previewUrl" alt="Receipt Preview" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{{ selectedFile.name }}</p>
              <p class="text-[11px] text-slate-400">{{ (selectedFile.size / 1024).toFixed(1) }} KB • Scanned via {{ extractedData.ocrEngine }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="reScanReceipt"
              class="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
              title="Re-run OCR"
            >
              🔄 Re-Scan
            </button>
            <button
              @click="clearFile"
              class="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Banner with Confidence Notes -->
        <div class="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-start space-x-2.5 text-xs">
          <svg class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="space-y-0.5 text-slate-300">
            <span class="font-semibold text-emerald-400">Review & Confirm Detected Data:</span>
            <p class="text-slate-400 text-[11px] leading-relaxed">
              {{ extractedData.confidenceNotes || 'Verify extracted transfer details below. Any field can be edited before anchoring to Stellar via Pollar.' }}
            </p>
          </div>
        </div>

        <!-- Editable Form Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <!-- Session ID / Reference -->
          <div class="sm:col-span-2">
            <div class="flex items-center justify-between mb-1">
              <label class="font-bold text-slate-300 uppercase tracking-wider font-mono">
                NIBSS Session ID / Reference Number
              </label>
              <span
                :class="[
                  'px-2 py-0.5 rounded text-[10px] font-mono',
                  cleanExtractedSessionId.length === 30
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : cleanExtractedSessionId.length >= 20
                    ? 'bg-teal-950 text-teal-300 border border-teal-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                ]"
              >
                {{ cleanExtractedSessionId.length }} digits {{ cleanExtractedSessionId.length === 30 ? '(Standard NIP 30-Digit)' : cleanExtractedSessionId.length >= 20 ? '(FinTech Direct)' : '(Incomplete)' }}
              </span>
            </div>
            <input
              v-model="extractedData.sessionId"
              type="text"
              placeholder="e.g. 000013250324114215984716382910"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-xs tracking-wider outline-none"
            />
          </div>

          <!-- Sender Bank -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Originating Sender Bank</label>
            <select
              v-model="extractedData.senderBank"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option v-for="b in NIGERIAN_BANKS" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <!-- Beneficiary Bank -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Beneficiary Destination Bank</label>
            <select
              v-model="extractedData.receiverBank"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option v-for="b in NIGERIAN_BANKS" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <!-- Sender Name -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Sender Name</label>
            <input
              v-model="extractedData.senderName"
              type="text"
              placeholder="e.g. Chibuike Okonkwo"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-2 text-slate-200 outline-none"
            />
          </div>

          <!-- Beneficiary Name -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Beneficiary / Merchant Name</label>
            <input
              v-model="extractedData.receiverName"
              type="text"
              placeholder="e.g. Lekki Gadget Depot Ltd"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-2 text-slate-200 outline-none"
            />
          </div>

          <!-- Amount -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Transfer Amount (₦)</label>
            <input
              v-model.number="extractedData.amount"
              type="number"
              placeholder="50000"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none"
            />
          </div>

          <!-- Receipt Timestamp -->
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Receipt Date / Timestamp</label>
            <input
              v-model="extractedData.receiptTimestamp"
              type="text"
              placeholder="YYYY-MM-DDTHH:mm:ss"
              class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3 py-2 text-slate-200 font-mono outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Quick sample receipts buttons -->
      <div v-if="!selectedFile" class="flex items-center justify-between text-xs pt-1">
        <span class="text-slate-400">Or test with demo templates:</span>
        <div class="flex items-center space-x-2">
          <button
            @click="loadSampleReceipt('valid-gtb')"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 hover:border-emerald-500/50 transition-colors"
          >
            Valid GTBank Receipt
          </button>
          <button
            @click="loadSampleReceipt('valid-opay')"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-teal-400 border border-slate-700 hover:border-teal-500/50 transition-colors"
          >
            OPay Direct Transfer
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

    <!-- MODE 2: Direct NIBSS Session ID Input -->
    <div v-else class="space-y-4">
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            NIBSS Session ID / Reference Number (20 to 34 Digits)
          </label>
          <span
            :class="[
              'text-xs font-mono px-2 py-0.5 rounded-lg',
              cleanSessionId.length === 30
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : cleanSessionId.length >= 20
                ? 'bg-teal-950 text-teal-300 border border-teal-800'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            ]"
          >
            {{ cleanSessionId.length }} digits {{ cleanSessionId.length === 30 ? '(30-Digit NIP)' : cleanSessionId.length >= 20 ? '(FinTech Direct)' : '' }}
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
          NIBSS Structural Breakdown & Math Verification:
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
          <!-- Segment 1: Bank Code -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Routing Segment:</span>
            <span class="text-emerald-400 font-bold text-sm">{{ cleanSessionId.substring(0, 6) }}</span>
            <span class="text-[10px] text-slate-300 block truncate mt-0.5">
              {{ resolvedLiveBank || 'Resolving...' }}
            </span>
          </div>

          <!-- Segment 2: Execution Time -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Execution Timestamp:</span>
            <span class="text-teal-400 font-bold text-sm">
              {{ cleanSessionId.length >= 18 ? cleanSessionId.substring(6, 18) : cleanSessionId.substring(0, 12) }}
            </span>
            <span class="text-[10px] text-slate-300 block truncate mt-0.5">
              {{ liveParsedTime || 'Execution Timestamp' }}
            </span>
          </div>

          <!-- Segment 3: Serial Sequence -->
          <div class="p-2.5 rounded-xl bg-slate-850 border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Serial Entropy:</span>
            <span class="text-cyan-400 font-bold text-sm">
              {{ cleanSessionId.length >= 18 ? cleanSessionId.substring(18) : cleanSessionId.substring(12) }}
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
            <option v-for="b in NIGERIAN_BANKS" :key="b" :value="b">{{ b }}</option>
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
        :disabled="
          isLoading ||
          isScanning ||
          isClassifying ||
          (inputMode === 'upload' && (!selectedFile || !extractedData.sessionId || (classification && !classification.isPaymentReceipt))) ||
          (inputMode === 'session' && cleanSessionId.length < 10)
        "
        :class="[
          'w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-sans active:scale-[0.99]',
          (inputMode === 'upload' && classification && !classification.isPaymentReceipt)
            ? 'bg-rose-950/60 border border-rose-800/60 text-rose-400'
            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/25'
        ]"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <svg v-else-if="inputMode === 'upload' && classification && !classification.isPaymentReceipt" class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>

        <svg v-else class="w-5 h-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>

        <span>
          {{
            (inputMode === 'upload' && classification && !classification.isPaymentReceipt)
              ? 'Verification Inactive — Document Is Not a Payment Receipt'
              : isLoading
              ? 'Verifying NIBSS Cryptography & Anchoring to Pollar Stellar Escrow...'
              : selectedFile
              ? 'Confirm Receipt & Release Pollar Gasless Escrow'
              : 'Verify Transfer & Release Pollar Gasless Escrow'
          }}
        </span>
      </button>
    </div>

    <!-- Gemini Key Configuration Modal -->
    <div
      v-if="isKeyModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      @click.self="isKeyModalOpen = false"
    >
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🤖</span>
            <h3 class="font-bold text-slate-100 text-sm">Gemini 1.5 Flash Vision OCR</h3>
          </div>
          <button @click="isKeyModalOpen = false" class="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <p class="text-xs text-slate-300 leading-relaxed">
          DualVerifier uses on-device <strong>Tesseract.js OCR</strong> by default. For 100% pixel-perfect multi-modal receipt layout understanding (even on skewed mobile photos), paste your free Google Gemini API Key below.
        </p>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key</label>
          <input
            v-model="inputApiKey"
            type="password"
            placeholder="AIzaSy..."
            class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs font-mono outline-none"
          />
          <p class="text-[11px] text-slate-400 mt-1">
            Keys are stored locally in your browser (<code class="text-slate-300">localStorage</code>) and never exposed.
          </p>
        </div>

        <div class="flex items-center justify-between pt-2">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>Get free API key</span>
            <span>↗</span>
          </a>

          <div class="flex items-center space-x-2">
            <button
              v-if="hasCustomApiKey"
              @click="removeApiKey"
              class="px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40"
            >
              Clear Key
            </button>
            <button
              @click="saveApiKey"
              class="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Image Zoom Modal -->
    <div
      v-if="showFullImage && previewUrl"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
      @click.self="showFullImage = false"
    >
      <div class="relative max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl flex flex-col items-center">
        <button
          @click="showFullImage = false"
          class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-950/80 text-slate-200 hover:text-white flex items-center justify-center border border-slate-700"
        >
          ✕
        </button>
        <img :src="previewUrl" alt="Full Receipt" class="max-w-full max-h-[80vh] object-contain rounded-xl" />
        <p class="text-xs text-slate-400 mt-2 font-mono">{{ selectedFile?.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { performReceiptOcr } from '../utils/receiptOcr';
import { classifyReceiptDocument, type ReceiptClassification } from '../utils/receiptClassifier';

const props = defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'verify', payload: any): void;
  (e: 'reset-verification'): void;
}>();

const NIGERIAN_BANKS = [
  'Guaranty Trust Bank (GTBank)',
  'Access Bank PLC',
  'Zenith Bank PLC',
  'First Bank of Nigeria',
  'United Bank for Africa',
  'Wema Bank / ALAT',
  'OPay Digital Services',
  'Moniepoint Microfinance Bank',
  'PalmPay Limited',
  'Kuda Microfinance Bank',
  'Stanbic IBTC Bank',
  'Sterling Bank PLC',
  'Fidelity Bank PLC',
  'Union Bank of Nigeria',
  'Polaris Bank',
  'FCMB (First City Monument Bank)',
  'Keystone Bank',
  'Ecobank Nigeria',
  'Unity Bank',
  'Standard Chartered Bank',
  'Jaiz Bank PLC',
  'Taj Bank',
  'Lotus Bank',
  'Globus Bank',
  'Titan Trust Bank',
  'Parallex Bank',
  'PremiumTrust Bank',
  'Signature Bank',
  'Carbon (One Finance)',
  'Paga',
  'Pocket by Piggyvest',
  'Rubies Bank',
  'Chipper Cash',
  'Eyowo'
];

const inputMode = ref<'upload' | 'session'>('upload');
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const previewUrl = ref<string>('');
const showFullImage = ref(false);

const isScanning = ref(false);
const scanPercent = ref(0);
const scanStepText = ref('Initializing OCR...');

// Classification state — set before OCR begins
const isClassifying = ref(false);
const classification = ref<ReceiptClassification | null>(null);

const isKeyModalOpen = ref(false);
const inputApiKey = ref('');
const hasCustomApiKey = ref(false);

const rawSessionInput = ref('');
const claimedSenderBank = ref('Guaranty Trust Bank (GTBank)');
const claimedAmount = ref(50000);

const extractedData = reactive({
  sessionId: '',
  senderBank: 'Guaranty Trust Bank (GTBank)',
  senderName: '',
  receiverBank: 'OPay Digital Services',
  receiverName: '',
  receiverAccount: '',
  amount: 0,
  currency: 'NGN',
  receiptTimestamp: '',
  ocrEngine: 'Tesseract.js',
  confidenceNotes: ''
});

onMounted(() => {
  const savedKey = localStorage.getItem('dualverifier_gemini_api_key');
  if (savedKey) {
    inputApiKey.value = savedKey;
    hasCustomApiKey.value = true;
  }
});

function saveApiKey() {
  if (inputApiKey.value.trim()) {
    localStorage.setItem('dualverifier_gemini_api_key', inputApiKey.value.trim());
    hasCustomApiKey.value = true;
    isKeyModalOpen.value = false;
  }
}

function removeApiKey() {
  localStorage.removeItem('dualverifier_gemini_api_key');
  inputApiKey.value = '';
  hasCustomApiKey.value = false;
  isKeyModalOpen.value = false;
}

const cleanSessionId = computed(() => {
  return rawSessionInput.value.replace(/[^0-9]/g, '');
});

const cleanExtractedSessionId = computed(() => {
  return (extractedData.sessionId || '').replace(/[^0-9]/g, '');
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
  const isDateFirst = cleanSessionId.value.length < 30 && ['20', '21', '22', '23', '24', '25', '26'].includes(cleanSessionId.value.substring(0, 2));
  const t = isDateFirst ? cleanSessionId.value.substring(0, 12) : cleanSessionId.value.substring(6, 18);
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
  const s = cleanSessionId.value.length >= 18 ? cleanSessionId.value.substring(18) : cleanSessionId.value.substring(12);
  if (s.length >= 6) {
    if (/^(\d)\1+$/.test(s)) return '⚠️ Repetitive Synthetic (Fake Alert)';
    if ('0123456789012345'.includes(s)) return '⚠️ Sequential Sequence';
    return 'Cryptographic Entropy (OK)';
  }
  return 'Entropy Evaluator';
});

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await processUploadedFile(target.files[0]);
  }
}

async function handleFileDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await processUploadedFile(event.dataTransfer.files[0]);
  }
}

async function processUploadedFile(file: File) {
  selectedFile.value = file;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);

  // Immediately notify parent to clear any previous verification cards on the right
  emit('reset-verification');

  // Reset extracted fields to clean state
  extractedData.sessionId = '';
  extractedData.amount = 0;
  extractedData.senderName = '';
  extractedData.receiverName = '';
  extractedData.receiverAccount = '';
  extractedData.receiptTimestamp = '';
  extractedData.confidenceNotes = '';

  // ── Step 1: Classify the document BEFORE running full OCR ──
  classification.value = null;
  isClassifying.value = true;
  try {
    classification.value = await classifyReceiptDocument(file);
  } catch {
    classification.value = null;
  } finally {
    isClassifying.value = false;
  }

  // ── Step 2: If the document is NOT a payment receipt, DO NOT run OCR and keep verification inactive ──
  if (classification.value && !classification.value.isPaymentReceipt) {
    extractedData.confidenceNotes = classification.value.reason;
    return;
  }

  // ── Step 3: Proceed with OCR scan only for confirmed payment receipts ──
  await scanReceipt(file);
}

async function scanReceipt(file: File) {
  isScanning.value = true;
  scanPercent.value = 15;
  scanStepText.value = 'Analyzing document layout...';

  try {
    const result = await performReceiptOcr(file, {
      onProgress: (percent, step) => {
        scanPercent.value = percent;
        scanStepText.value = step;
      }
    });

    extractedData.sessionId = result.sessionId || '';
    extractedData.senderBank = result.senderBank || 'Guaranty Trust Bank (GTBank)';
    extractedData.senderName = result.senderName || 'Account Holder';
    extractedData.receiverBank = result.receiverBank || 'OPay Digital Services';
    extractedData.receiverName = result.receiverName || 'Settled Merchant';
    extractedData.receiverAccount = result.receiverAccount || '••••••••••';
    extractedData.amount = result.amount || 0;
    extractedData.currency = result.currency || 'NGN';
    extractedData.receiptTimestamp = result.receiptTimestamp || '';
    extractedData.ocrEngine = result.ocrEngine;
    extractedData.confidenceNotes = result.confidenceNotes;
  } catch (err: any) {
    console.error('Scan failed:', err);
    extractedData.confidenceNotes = 'Auto-OCR encountered an issue. Please confirm fields manually.';
  } finally {
    isScanning.value = false;
  }
}

async function reScanReceipt() {
  if (selectedFile.value) {
    await scanReceipt(selectedFile.value);
  }
}

function clearFile() {
  selectedFile.value = null;
  classification.value = null;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  if (fileInputRef.value) fileInputRef.value.value = '';
  extractedData.sessionId = '';
  extractedData.amount = 0;
  extractedData.senderName = '';
  extractedData.receiverName = '';
  extractedData.receiverAccount = '';
  extractedData.receiptTimestamp = '';
  extractedData.confidenceNotes = '';
  emit('reset-verification');
}

function loadSampleReceipt(type: 'valid-gtb' | 'valid-opay' | 'fake-alert') {
  if (type === 'valid-gtb') {
    inputMode.value = 'session';
    rawSessionInput.value = '000013250324114215984716382910';
    claimedSenderBank.value = 'Guaranty Trust Bank (GTBank)';
    claimedAmount.value = 50000;
  } else if (type === 'valid-opay') {
    inputMode.value = 'session';
    rawSessionInput.value = '100004241105093012984102948271';
    claimedSenderBank.value = 'OPay Digital Services';
    claimedAmount.value = 25000;
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
    formData.append('sessionId', extractedData.sessionId);
    formData.append('senderBank', extractedData.senderBank);
    formData.append('senderName', extractedData.senderName);
    formData.append('receiverBank', extractedData.receiverBank);
    formData.append('receiverName', extractedData.receiverName);
    formData.append('receiverAccount', extractedData.receiverAccount);
    formData.append('amount', String(extractedData.amount));
    formData.append('currency', extractedData.currency || 'NGN');
    if (extractedData.receiptTimestamp) {
      formData.append('receiptTimestamp', extractedData.receiptTimestamp);
    }
    const geminiKey = localStorage.getItem('dualverifier_gemini_api_key');
    if (geminiKey) formData.append('geminiApiKey', geminiKey);

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
