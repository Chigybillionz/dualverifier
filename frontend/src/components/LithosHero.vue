<template>
  <div class="min-h-screen bg-white tracking-[-0.02em]" style="font-family: 'Inter', sans-serif">
    <!-- Navigation (fixed, over hero) -->
    <nav class="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      <!-- Left: Logo & Wordmark -->
      <div class="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span class="text-white text-2xl font-playfair italic">Lithos</span>
      </div>

      <!-- Center pill -->
      <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        <button class="text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
          Course
        </button>
        <button class="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">
          Field Guides
        </button>
        <button class="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">
          Geology
        </button>
        <button class="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">
          Plans
        </button>
        <button class="text-white/80 hover:bg-white/20 hover:text-white transition-colors px-4 py-1.5 rounded-full text-sm font-medium">
          Live Tour
        </button>
      </div>

      <!-- Right (desktop) -->
      <button class="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors">
        Sign Up
      </button>

      <!-- Mobile hamburger -->
      <button
        @click="isMobileNavOpen = !isMobileNavOpen"
        class="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Toggle Navigation"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </nav>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileNavOpen"
      class="fixed inset-x-0 top-16 z-[99] bg-black/90 backdrop-blur-xl border-b border-white/10 p-5 flex flex-col gap-3 md:hidden text-white"
    >
      <button class="text-left py-2 font-medium border-b border-white/5">Course</button>
      <button class="text-left py-2 text-white/80 hover:text-white border-b border-white/5">Field Guides</button>
      <button class="text-left py-2 text-white/80 hover:text-white border-b border-white/5">Geology</button>
      <button class="text-left py-2 text-white/80 hover:text-white border-b border-white/5">Plans</button>
      <button class="text-left py-2 text-white/80 hover:text-white border-b border-white/5">Live Tour</button>
      <button class="mt-2 bg-white text-gray-900 text-sm font-semibold py-2.5 rounded-full">Sign Up</button>
    </div>

    <!-- Section -->
    <section class="relative w-full overflow-hidden h-screen bg-black" style="height: 100dvh">
      <!-- 1. Base image (z-10) with slow Ken Burns zoom -->
      <div
        class="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
        :style="{ backgroundImage: `url(${BG_IMAGE_1})` }"
      />

      <!-- 2. Reveal layer (z-30) -->
      <canvas
        ref="canvasRef"
        class="absolute inset-0 pointer-events-none"
        style="display: none"
      />
      <div
        ref="revealDivRef"
        class="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        :style="{ backgroundImage: `url(${BG_IMAGE_2})` }"
      />

      <!-- 3. Heading (z-50) -->
      <div class="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
        <h1 class="text-white leading-[0.95]">
          <span
            class="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style="letter-spacing: -0.05em; animation-delay: 0.25s"
          >
            Layers hold
          </span>
          <span
            class="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style="letter-spacing: -0.08em; animation-delay: 0.42s"
          >
            tales of time
          </span>
        </h1>
      </div>

      <!-- 4. Bottom-left paragraph (z-50) -->
      <div
        class="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style="animation-delay: 0.7s"
      >
        <p class="text-sm text-white/80 leading-relaxed">
          Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.
        </p>
      </div>

      <!-- 5. Bottom-right block (z-50) -->
      <div
        class="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style="animation-delay: 0.85s"
      >
        <p class="text-xs sm:text-sm text-white/80 leading-relaxed">
          Our interactive maps let you peel back the crust to trace how stones, fossils, and deep time combine to shape the ground beneath your feet.
        </p>
        <button
          @click="$emit('start-digging')"
          class="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 cursor-pointer"
        >
          Start Digging
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineEmits<{
  (e: 'start-digging'): void;
}>();

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';

const BG_IMAGE_2 =
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
