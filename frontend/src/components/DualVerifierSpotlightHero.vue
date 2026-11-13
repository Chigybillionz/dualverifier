<template>
  <div class="relative w-full tracking-[-0.02em]" style="font-family: 'Inter', sans-serif">
    <!-- Fixed Glassmorphic Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <!-- Left: Logo & Wordmark -->
      <div class="flex items-center gap-2.5">
        <a href="#top" class="flex items-center gap-2.5 group">
          <div class="h-9 w-9 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-blue-500/10 border border-white/20 group-hover:scale-105 transition-all">
            <img src="/logo.png" alt="DualVerifier Logo" class="h-full w-auto object-contain" />
          </div>
          <span class="text-white text-2xl font-playfair italic tracking-tight">DualVerifier</span>
        </a>
      </div>

      <!-- Center Floating Glassmorphic Pill -->
      <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/15 hover:bg-white/20 backdrop-blur-xl border border-white/25 rounded-full px-2 py-1.5 items-center gap-1 shadow-2xl transition-all">
        <button
          @click="$emit('select-rail', 'LOCAL_BANK')"
          :class="[
            'px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all',
            activeRail === 'LOCAL_BANK'
              ? 'bg-white text-gray-900 shadow-md font-bold'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          ]"
        >
          NIBSS Bank Verifier
        </button>

        <button
          @click="$emit('select-rail', 'POLLAR_STELLAR')"
          :class="[
            'px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all',
            activeRail === 'POLLAR_STELLAR' || activeRail === 'ZCASH'
              ? 'bg-white text-gray-900 shadow-md font-bold'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          ]"
        >
          Stellar Web3 (0 Gas)
        </button>

        <button
          @click="$emit('open-history')"
          class="text-white/80 hover:bg-white/10 hover:text-white transition-colors px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5"
        >
          <span>My History</span>
          <span v-if="(userHistoryCount || 0) > 0" class="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-bold">
            {{ userHistoryCount }}
          </span>
        </button>

        <button
          @click="$emit('open-guide')"
          class="text-white/80 hover:bg-white/10 hover:text-white transition-colors px-3.5 py-1.5 rounded-full text-xs font-mono font-medium"
        >
          How It Works
        </button>

        <button
          @click="$emit('open-ledger')"
          class="text-white/80 hover:bg-white/10 hover:text-white transition-colors px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1.5"
        >
          <span>On-Chain Anchors</span>
          <span v-if="(memoCount || 0) > 0" class="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
            {{ memoCount }}
          </span>
        </button>

        <button
          @click="$emit('toggle-lithos')"
          class="text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-colors px-3 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-1"
          title="Toggle Lithos Geology Showcase"
        >
          <span>🪨 Lithos Mode</span>
        </button>
      </div>

      <!-- Right Utility Actions -->
      <div class="flex items-center gap-2">
        <button
          @click="$emit('open-did-account')"
          class="hidden md:inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all shadow-md active:scale-95"
        >
          <span class="w-2 h-2 rounded-full" :class="isDeveloper ? 'bg-amber-500' : 'bg-emerald-500'"></span>
          <span>{{ currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'DID' }}</span>
        </button>

        <!-- Mobile hamburger -->
        <button
          @click="isMobileNavOpen = !isMobileNavOpen"
          class="md:hidden text-white p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
          aria-label="Toggle Navigation"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileNavOpen"
      class="fixed inset-x-0 top-16 z-[99] bg-[#070B14]/95 backdrop-blur-2xl border-b border-white/10 p-5 flex flex-col gap-2.5 md:hidden text-white shadow-2xl"
    >
      <button
        @click="$emit('select-rail', 'LOCAL_BANK'); isMobileNavOpen = false"
        class="text-left py-2.5 px-3 rounded-xl bg-white/5 font-mono text-xs font-bold"
      >
        Bank Receipt Verifier (NIBSS)
      </button>
      <button
        @click="$emit('select-rail', 'POLLAR_STELLAR'); isMobileNavOpen = false"
        class="text-left py-2.5 px-3 rounded-xl bg-white/5 font-mono text-xs font-bold"
      >
        Stellar Web3 Explorer (0 Gas)
      </button>
      <button
        @click="$emit('open-history'); isMobileNavOpen = false"
        class="text-left py-2.5 px-3 rounded-xl bg-white/5 font-mono text-xs flex items-center justify-between"
      >
        <span>My Authentication History</span>
        <span v-if="(userHistoryCount || 0) > 0" class="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px]">
          {{ userHistoryCount }}
        </span>
      </button>
      <button
        @click="$emit('open-guide'); isMobileNavOpen = false"
        class="text-left py-2.5 px-3 rounded-xl bg-white/5 font-mono text-xs"
      >
        How DualVerifier Works
      </button>
      <button
        @click="$emit('open-ledger'); isMobileNavOpen = false"
        class="text-left py-2.5 px-3 rounded-xl bg-white/5 font-mono text-xs flex items-center justify-between"
      >
        <span>On-Chain Anchors Ledger</span>
        <span v-if="(memoCount || 0) > 0" class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
          {{ memoCount }}
        </span>
      </button>
      <button
        @click="$emit('toggle-lithos'); isMobileNavOpen = false"
        class="text-left py-2.5 px-3 rounded-xl bg-amber-500/10 text-amber-300 font-mono text-xs font-bold"
      >
        🪨 Switch to Lithos Geology Mode
      </button>
      <button
        @click="$emit('open-did-account'); isMobileNavOpen = false"
        class="mt-2 bg-white text-gray-900 text-xs font-bold py-3 rounded-full"
      >
        Manage DID Account & Devices
      </button>
    </div>

    <!-- Full-Screen Hero Section (100dvh) with Cursor-Following Reveal -->
    <section class="relative w-full overflow-hidden h-screen bg-black" style="height: 100dvh">
      <!-- 1. Base Image Layer (z-10) with Ken Burns slow zoom -->
      <div
        class="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
        :style="{ backgroundImage: `url(${baseImage})` }"
      />

      <!-- Dark Vignette & Gradient Overlay for Contrast -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/85 z-20 pointer-events-none" />

      <!-- 2. Reveal Image Layer (z-30) through soft circular mask -->
      <canvas
        ref="canvasRef"
        class="absolute inset-0 pointer-events-none"
        style="display: none"
      />
      <div
        ref="revealDivRef"
        class="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        :style="{ backgroundImage: `url(${revealImage})` }"
      />

      <!-- 3. Central Signature Heading (z-50) -->
      <div class="absolute top-[14%] sm:top-[16%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
        <!-- Live System Status Badge -->
        <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-medium mb-4 hero-anim hero-fade">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-slate-200">Forensics Match</span>
          <span class="text-white/40">•</span>
          <span class="text-blue-300">Pollar Smart Escrow</span>
        </div>

        <h1 class="text-white leading-[0.95]">
          <span
            class="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style="letter-spacing: -0.05em; animation-delay: 0.25s"
          >
            Layers hold
          </span>
          <span
            class="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 sm:-mt-2 hero-anim hero-reveal"
            style="letter-spacing: -0.08em; animation-delay: 0.42s"
          >
            tales of truth
          </span>
        </h1>
        <p class="text-xs sm:text-sm text-white/70 max-w-xl mt-3 font-mono hero-anim hero-fade" style="animation-delay: 0.55s">
          Move your cursor to peel back the surface and reveal cryptographic proof.
        </p>
      </div>

      <!-- 4. Bottom-Left Paragraph (z-50) -->
      <div
        class="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] z-50 hero-anim hero-fade"
        style="animation-delay: 0.7s"
      >
        <p class="text-sm text-white/80 leading-relaxed font-sans">
          Every legitimate Nigerian bank receipt leaves an immutable cryptographic trail across central clearing gateways, safeguarding merchants against Canva-edited fake alerts.
        </p>
      </div>

      <!-- 5. Bottom-Right Block with Signature Button (z-50) -->
      <div
        class="absolute bottom-10 sm:bottom-20 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style="animation-delay: 0.85s"
      >
        <p class="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
          Our forensic engine verifies 30-digit NIBSS session numbers, intercepts replay traps, and anchors zero-gas USDC settlement directly onto Stellar.
        </p>
        <button
          @click="scrollToVerifier"
          class="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 cursor-pointer flex items-center gap-2"
        >
          <span>Start Verifying</span>
          <span>➔</span>
        </button>
      </div>

      <!-- Bottom Hint to Scroll Down to Workbench -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/50 text-[11px] font-mono flex items-center gap-1.5 animate-bounce pointer-events-none">
        <span>Scroll to verification laboratory</span>
        <span>↓</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { currentUser, isDeveloper } from '../utils/auth';

defineProps<{
  activeRail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH';
  userHistoryCount?: number;
  memoCount?: number;
}>();

const emit = defineEmits<{
  (e: 'select-rail', rail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH'): void;
  (e: 'open-history'): void;
  (e: 'open-guide'): void;
  (e: 'open-ledger'): void;
  (e: 'open-did-account'): void;
  (e: 'toggle-lithos'): void;
}>();

const baseImage =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';

const revealImage =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85';

const SPOTLIGHT_R = 260;

const isMobileNavOpen = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const revealDivRef = ref<HTMLDivElement | null>(null);

const mouse = { x: -999, y: -999 };
const smooth = { x: -999, y: -999 };
let rafId: number | null = null;

const updateCanvasMask = (cursorX: number, cursorY: number) => {
  const canvas = canvasRef.current;
  const revealDiv = revealDivRef.current;
  if (!canvas || !revealDiv) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (cursorX >= 0 && cursorY >= 0) {
    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
    gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const maskDataUrl = canvas.toDataURL();
    revealDiv.style.maskImage = `url(${maskDataUrl})`;
    revealDiv.style.webkitMaskImage = `url(${maskDataUrl})`;
    revealDiv.style.maskSize = '100% 100%';
    (revealDiv.style as any).webkitMaskSize = '100% 100%';
  } else {
    revealDiv.style.maskImage = 'none';
    revealDiv.style.webkitMaskImage = 'none';
  }
};

const handleMouseMove = (e: MouseEvent) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (smooth.x === -999) {
    smooth.x = e.clientX;
    smooth.y = e.clientY;
  }
};

const handleResize = () => {
  if (canvasRef.current) {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    updateCanvasMask(smooth.x, smooth.y);
  }
};

const loop = () => {
  if (mouse.x !== -999) {
    smooth.x += (mouse.x - smooth.x) * 0.1;
    smooth.y += (mouse.y - smooth.y) * 0.1;
    updateCanvasMask(smooth.x, smooth.y);
  }
  rafId = requestAnimationFrame(loop);
};

const scrollToVerifier = () => {
  const el = document.getElementById('verifier-section');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
  rafId = requestAnimationFrame(loop);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handleMouseMove);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>
