<template>
  <div
    class="blue-card-print relative rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl border backdrop-blur-xl"
    :class="[
      card.status === 'VERIFIED'
        ? card.rail === 'LOCAL_BANK'
          ? 'bg-[#191419] border-emerald-500/50 shadow-emerald-500/10'
          : 'bg-[#191419] border-[#F4B728]/50 shadow-[#F4B728]/10'
        : card.status === 'DUPLICATE'
        ? 'bg-[#191419] border-amber-500/60 shadow-amber-500/20'
        : 'bg-[#191419] border-rose-500/60 shadow-rose-500/20'
    ]"
  >
    <!-- Background glowing ambient halo -->
    <div
      class="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 -mr-20 -mt-20"
      :class="[
        card.status === 'VERIFIED'
          ? card.rail === 'LOCAL_BANK' ? 'bg-emerald-400' : 'bg-[#F4B728]'
          : card.status === 'DUPLICATE'
          ? 'bg-amber-400'
          : 'bg-rose-500'
      ]"
    ></div>

    <!-- 1. VERIFICATION STATUS HEADER -->
    <div
      class="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      :class="[
        card.status === 'VERIFIED'
          ? card.rail === 'LOCAL_BANK'
            ? 'bg-emerald-950/40 border-emerald-500/30'
            : 'bg-[#251d18] border-[#F4B728]/30'
          : card.status === 'DUPLICATE'
          ? 'bg-amber-950/40 border-amber-500/30'
          : 'bg-rose-950/40 border-rose-500/30'
      ]"
    >
      <div class="flex items-center space-x-3.5">
        <!-- Status Icon -->
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          :class="[
            card.status === 'VERIFIED'
              ? card.rail === 'LOCAL_BANK'
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40'
                : 'bg-[#F4B728] text-black shadow-[#F4B728]/40'
              : card.status === 'DUPLICATE'
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 animate-pulse'
              : 'bg-rose-500 text-white shadow-rose-500/40'
          ]"
        >
          <!-- Verified Shield -->
          <svg v-if="card.status === 'VERIFIED'" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <!-- Duplicate Replay Alert -->
          <svg v-else-if="card.status === 'DUPLICATE'" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <!-- Forged / Tampered -->
          <svg v-else class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <div>
          <div class="flex items-center space-x-2">
            <span
              class="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
              :class="[
                card.status === 'VERIFIED'
                  ? card.rail === 'LOCAL_BANK'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-[#F4B728]/15 text-[#F4B728] border border-[#F4B728]/40'
                  : card.status === 'DUPLICATE'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              ]"
            >
              {{ card.rail === 'LOCAL_BANK' ? 'Rail 1: NIBSS Settlement + Zcash Ironwood Memo' : 'Rail 2: Zcash Ironwood (NU6.3) Shielded Explorer' }}
            </span>
            <span class="text-xs text-stone-400 font-mono">{{ formatTimestamp(card.timestamp) }}</span>
          </div>

          <h2
            class="text-lg sm:text-xl font-extrabold tracking-tight mt-1"
            :class="[
              card.status === 'VERIFIED'
                ? card.rail === 'LOCAL_BANK' ? 'text-emerald-300' : 'text-[#F4B728]'
                : card.status === 'DUPLICATE'
                ? 'text-amber-300'
                : 'text-rose-400'
            ]"
          >
            {{ card.badgeTitle }}
          </h2>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center space-x-2 no-print">
        <button
          @click="$emit('open-certificate', card)"
          class="px-3.5 py-2 rounded-xl bg-[#F4B728] hover:bg-[#e0a620] text-black text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md shadow-[#F4B728]/20 active:scale-95 transition-all uppercase tracking-wider"
          title="Open and print tamper-proof official cryptographic certificate"
        >
          <span>📜 Official Certificate</span>
        </button>

        <button
          @click="copyProofHash"
          class="px-3 py-2 rounded-xl bg-[#120e12] hover:bg-[#1f1720] text-stone-200 border border-[#2d242f] hover:border-[#F4B728]/50 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
        >
          <svg class="w-4 h-4 text-[#F4B728]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{{ copied ? 'Copied Hash!' : 'Copy Hash' }}</span>
        </button>
      </div>
    </div>

    <!-- 1b. HIGH-CONTRAST BIG-NUMBER HERO METRIC DISPLAY (Inspired by z.cash $1248.89 card) -->
    <div class="px-6 py-6 bg-[#120e12] border-b border-[#2d242f]">
      <div class="max-w-lg mx-auto p-8 rounded-xl bg-white text-stone-950 shadow-2xl border border-stone-200 text-center">
        <div class="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 mb-1">
          Settlement Attestation Confirmed
        </div>
        <div class="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans text-stone-950 py-1">
          {{ card.routingPipeline?.receiver?.amountFormatted || '₦0.00' }}
        </div>
        <div class="flex items-center justify-center space-x-2 mt-2 text-xs font-mono font-bold text-emerald-600">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Zero-Knowledge Validated • ZIP-302 Shielded Seal</span>
        </div>
        <div class="text-[10px] text-stone-400 mt-2 font-mono truncate">
          Proof Hash: {{ card.proofHash }}
        </div>
      </div>
    </div>

    <!-- 2. MULTI-CURRENCY CONVERSION BAR -->
    <div
      v-if="card.routingPipeline?.receiver?.multiCurrency"
      class="px-6 py-3 bg-[#161116] border-b border-[#2d242f] flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
    >
      <div class="flex items-center space-x-2 text-stone-400">
        <span class="text-[#F4B728] font-bold">💱 Multi-Currency Valuation:</span>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold">
          🇳🇬 {{ card.routingPipeline.receiver.multiCurrency.ngn }}
        </span>
        <span class="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 font-bold">
          🇺🇸 {{ card.routingPipeline.receiver.multiCurrency.usd }}
        </span>
        <span class="px-2.5 py-1 rounded-lg bg-[#F4B728]/15 border border-[#F4B728]/30 text-[#F4B728] font-bold">
          🛡️ {{ card.routingPipeline.receiver.multiCurrency.zec }}
        </span>
      </div>
    </div>

    <!-- 3. VISUAL COUNTERPARTY ROUTING PIPELINE (3-COLUMN FLOW) -->
    <div class="p-6 border-b border-[#2d242f] bg-[#141015]">
      <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
        <span class="flex items-center gap-1.5 font-mono">
          <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Visual Counterparty Routing Pipeline (Sender ➔ Rail / Ironwood Pool ➔ Receiver)
        </span>
        <span class="text-slate-500 font-mono">Settlement Route</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        <!-- Connecting line on desktop -->
        <div class="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-500/40 via-blue-500/50 to-amber-500/40 -translate-y-1/2 z-0"></div>

        <!-- Column 1: SENDER NODE -->
        <div class="relative z-10 p-4 rounded-2xl bg-slate-850/90 border border-slate-750 shadow-md space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase text-slate-400">{{ card.routingPipeline.sender.title }}</span>
            <span
              v-if="card.routingPipeline.sender.verified"
              class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] border border-emerald-500/30"
            >
              ✓
            </span>
            <span
              v-else
              class="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] border border-rose-500/30"
            >
              ✗
            </span>
          </div>

          <div class="flex items-center space-x-2.5">
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm"
              :style="{ backgroundColor: card.routingPipeline.sender.bankLogoColor || '#10b981' }"
            >
              {{ card.rail === 'LOCAL_BANK' ? card.routingPipeline.sender.institution.slice(0, 2) : 'ZC' }}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-white truncate">{{ card.routingPipeline.sender.identifier }}</h4>
              <p class="text-xs text-slate-400 truncate">{{ card.routingPipeline.sender.institution }}</p>
            </div>
          </div>
        </div>

        <!-- Column 2: RAIL / IRONWOOD POOL NODE -->
        <div class="relative z-10 p-4 rounded-2xl bg-slate-850/90 border border-slate-750 shadow-md space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase text-slate-400">Settlement Rail / Pool</span>
            <span class="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] border border-blue-500/30">
              ⚡
            </span>
          </div>

          <div>
            <h4 class="text-xs font-bold text-blue-300">{{ card.routingPipeline.rail.type }}</h4>
            <p class="text-[11px] font-mono text-slate-400 truncate">{{ card.routingPipeline.rail.protocol }}</p>
            <p class="text-[10px] font-mono text-slate-500 mt-1 truncate">Ref: {{ card.routingPipeline.rail.identifier }}</p>
          </div>
        </div>

        <!-- Column 3: RECEIVER NODE -->
        <div class="relative z-10 p-4 rounded-2xl bg-slate-850/90 border border-slate-750 shadow-md space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono uppercase text-slate-400">{{ card.routingPipeline.receiver.title }}</span>
            <span
              v-if="card.routingPipeline.receiver.verified"
              class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] border border-emerald-500/30"
            >
              ✓
            </span>
            <span
              v-else
              class="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] border border-rose-500/30"
            >
              ✗
            </span>
          </div>

          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-white truncate">{{ card.routingPipeline.receiver.identifier }}</h4>
              <p class="text-xs text-slate-400 truncate">{{ card.routingPipeline.receiver.institution }}</p>
            </div>
            <div class="text-right">
              <span
                class="text-sm sm:text-base font-extrabold font-mono"
                :class="card.rail === 'LOCAL_BANK' ? 'text-emerald-400' : 'text-amber-400'"
              >
                {{ card.routingPipeline.receiver.amountFormatted }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. FORENSICS & REPLAY ALERTS -->
    <div class="p-6 space-y-4">
      <!-- Critical Flags or Warnings Alert Box -->
      <div
        v-if="card.forensics.flags && card.forensics.flags.length > 0"
        class="p-4 rounded-2xl space-y-2 border text-xs"
        :class="[
          card.status === 'DUPLICATE'
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        ]"
      >
        <div class="font-bold uppercase tracking-wider flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Forensic & Anti-Replay Alerts:</span>
        </div>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(flag, idx) in card.forensics.flags" :key="idx" class="font-mono text-[11px] leading-snug">
            {{ flag }}
          </li>
        </ul>
      </div>

      <!-- RAIL 1 SPECIFIC: ZCASH IRONWOOD 512-BYTE SHIELDED MEMO ANCHOR CARD -->
      <div
        v-if="card.rail === 'LOCAL_BANK' && card.zcashShieldedAnchor"
        class="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs space-y-3"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-blue-400 font-bold font-mono flex items-center gap-1.5">
              <span>🛡️ Zcash Ironwood (NU6.3) 512-Byte Shielded Memo Anchor</span>
            </span>
            <span class="text-[10px] px-2 py-0.2 rounded-full bg-blue-950 text-blue-300 font-mono border border-blue-800">
              Ironwood Pool (Block #{{ card.zcashShieldedAnchor.blockHeight }})
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded-full"
              :class="card.zcashShieldedAnchor.claimCount > 1 ? 'bg-amber-950 text-amber-300 font-bold' : 'bg-emerald-950 text-emerald-300'"
            >
              {{ card.zcashShieldedAnchor.claimCount === 1 ? 'Proof Anchored' : `Replay Attempt #${card.zcashShieldedAnchor.claimCount}` }}
            </span>
          </div>
        </div>

        <div class="space-y-1 font-mono text-[11px]">
          <div class="text-slate-400">
            <span class="text-slate-500">SHA-256 Receipt Fingerprint: </span>
            <span class="text-emerald-400 font-bold">{{ card.zcashShieldedAnchor.proofHash }}</span>
          </div>
          <div class="text-slate-400 truncate">
            <span class="text-slate-500">Zcash Shielded TxID: </span>
            <a
              :href="card.zcashShieldedAnchor.explorerUrl"
              target="_blank"
              class="text-blue-400 hover:text-blue-300 underline"
            >
              {{ card.zcashShieldedAnchor.zcashTxId }}
            </a>
          </div>
        </div>

        <!-- Decrypted 512-Byte Memo Box -->
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Zcash Encrypted Note Memo (512-Byte ZIP-302 Payload):</span>
            <button
              @click="showHexMemo = !showHexMemo"
              class="text-blue-400 hover:text-blue-300 font-mono font-bold flex items-center gap-1 transition-colors"
            >
              <span>{{ showHexMemo ? 'Hide Raw Hex' : '🔍 Inspect 512-Byte Hex Memo' }}</span>
            </button>
          </div>
          <p class="font-mono text-xs text-slate-200 break-words leading-relaxed">
            {{ card.zcashShieldedAnchor.memoUtf8 }}
          </p>
        </div>

        <!-- RAW 512-BYTE HEX MEMO INSPECTOR DRAWER -->
        <div
          v-if="showHexMemo && card.zcashShieldedAnchor.memoHex"
          class="p-3.5 rounded-xl bg-slate-950/90 border border-blue-500/40 space-y-2 font-mono"
        >
          <div class="flex items-center justify-between text-[10px] text-slate-400">
            <span class="text-blue-400 font-bold">Raw 512-Byte ZIP-302 Hex Stream (1024 Characters):</span>
            <span class="text-slate-500">Bytes 0x000 - 0x1ff (Strict Zero-Padded)</span>
          </div>
          <div class="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] text-emerald-400/90 break-all leading-tight font-mono max-h-36 overflow-y-auto">
            {{ card.zcashShieldedAnchor.memoHex }}
          </div>
          <div v-if="card.zcashShieldedAnchor.memoJsonMetadata" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span class="text-slate-500 text-[10px] block mb-1">Decoded Memo JSON Metadata:</span>
            <pre class="text-[10px] text-blue-300 overflow-x-auto">{{ JSON.stringify(card.zcashShieldedAnchor.memoJsonMetadata, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- RAIL 2 SPECIFIC: ZCASH SHIELDED TRANSACTION & SELECTIVE DISCLOSURE -->
      <div
        v-if="card.rail === 'ZCASH' && card.zcashDetails"
        class="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 text-xs space-y-3"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-blue-400 font-bold font-mono flex items-center gap-1.5">
              <span>🛡️ Zcash Selective Disclosure Inspector</span>
            </span>
            <span
              class="text-[10px] px-2 py-0.2 rounded-full font-mono font-bold"
              :class="card.zcashDetails.selectiveDisclosure.isValidDisclosure ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-400'"
            >
              {{ card.zcashDetails.selectiveDisclosure.isValidDisclosure ? 'Decrypted via Viewing Key' : 'Zero-Knowledge Shielded' }}
            </span>
          </div>

          <span class="text-[10px] font-mono text-slate-400">
            Block #{{ card.zcashDetails.blockHeight }} ({{ card.zcashDetails.confirmations }} Confirmations)
          </span>
        </div>

        <p class="text-slate-300 text-xs leading-relaxed">
          {{ card.zcashDetails.selectiveDisclosure.disclosureStatement }}
        </p>

        <!-- 512-Byte Memo Section -->
        <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              512-Byte Zcash Encrypted Note Memo (ZIP-302)
            </span>
            <div class="flex items-center space-x-2">
              <button
                v-if="card.zcashDetails.memo.rawHex"
                @click="showHexMemo = !showHexMemo"
                class="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-bold transition-colors"
              >
                {{ showHexMemo ? 'Hide Hex' : '🔍 Inspect Hex Memo' }}
              </button>
              <span
                class="text-[10px] font-mono px-2 py-0.2 rounded"
                :class="card.zcashDetails.memo.selectiveDisclosureActive ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'"
              >
                {{ card.zcashDetails.memo.selectiveDisclosureActive ? 'DECRYPTED' : 'ENCRYPTED CIPHERTEXT' }}
              </span>
            </div>
          </div>

          <p
            class="font-mono text-xs break-words"
            :class="card.zcashDetails.memo.selectiveDisclosureActive ? 'text-emerald-300' : 'text-slate-500 italic'"
          >
            {{ card.zcashDetails.memo.decryptedText || '[Encrypted 512-byte payload. Supply Unified Viewing Key to reveal invoice & attestation details]' }}
          </p>
        </div>

        <!-- RAW 512-BYTE HEX MEMO INSPECTOR DRAWER (ZCASH RAIL) -->
        <div
          v-if="showHexMemo && card.zcashDetails.memo.rawHex"
          class="p-3.5 rounded-xl bg-slate-950/90 border border-blue-500/40 space-y-2 font-mono"
        >
          <div class="flex items-center justify-between text-[10px] text-slate-400">
            <span class="text-blue-400 font-bold">Raw 512-Byte ZIP-302 Hex Stream (1024 Characters):</span>
            <span class="text-slate-500">Bytes 0x000 - 0x1ff</span>
          </div>
          <div class="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[10px] text-emerald-400/90 break-all leading-tight font-mono max-h-36 overflow-y-auto">
            {{ card.zcashDetails.memo.rawHex }}
          </div>
          <div v-if="card.zcashDetails.memo.memoJsonMetadata" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span class="text-slate-500 text-[10px] block mb-1">Decoded Memo JSON Metadata:</span>
            <pre class="text-[10px] text-blue-300 overflow-x-auto">{{ JSON.stringify(card.zcashDetails.memo.memoJsonMetadata, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. ON-CHAIN ATTESTATION FOOTER & QR CODE -->
    <div class="px-6 py-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center space-x-4 min-w-0 flex-1">
        <!-- Live QR Code -->
        <div class="w-16 h-16 rounded-xl bg-white p-1 flex-shrink-0 shadow flex items-center justify-center">
          <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="Verification QR Code" class="w-full h-full" />
          <div v-else class="w-full h-full bg-slate-200 animate-pulse rounded-lg"></div>
        </div>

        <!-- Attestation Details -->
        <div class="space-y-1 min-w-0 font-mono">
          <div class="flex items-center space-x-2">
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              DualVerifier Protocol v2.0
            </span>
            <span class="text-[10px] text-slate-400">
              Ironwood (NU6.3) & ZK Privacy
            </span>
          </div>

          <div class="text-xs text-slate-300 truncate">
            <span class="text-slate-500">Hash / Tx: </span>
            <span class="text-blue-400 font-bold">{{ card.proofHash }}</span>
          </div>
        </div>
      </div>

      <!-- Seal Badge -->
      <div class="flex-shrink-0 text-right">
        <div class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span class="text-emerald-300 font-bold">Immutable Verification Pass</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import QRCode from 'qrcode';

const props = defineProps<{
  card: any;
}>();

defineEmits<{
  (e: 'open-certificate', card: any): void;
  (e: 'trigger-replay', card: any): void;
}>();

const copied = ref(false);
const showHexMemo = ref(false);
const qrCodeDataUrl = ref('');

function generateQR() {
  if (!props.card?.proofHash) return;
  const verifyUrl = `${window.location.origin}?proof=${props.card.proofHash}`;
  QRCode.toDataURL(verifyUrl, { width: 128, margin: 1, color: { dark: '#020617', light: '#ffffff' } }, (err, url) => {
    if (!err && url) qrCodeDataUrl.value = url;
  });
}

onMounted(() => {
  generateQR();
});

watch(() => props.card?.proofHash, () => {
  generateQR();
});

function formatTimestamp(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function copyProofHash() {
  if (!props.card?.proofHash) return;
  navigator.clipboard.writeText(props.card.proofHash);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2500);
}
</script>
