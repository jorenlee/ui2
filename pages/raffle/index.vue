<template>
  <div class="w-full flex flex-col items-center gap-6 relative overflow-hidden">
    <h2 class="text-2xl font-extrabold tracking-wide festive-title z-10">
      🎡 Animo Wheel
    </h2>


    
     <div>
        <!-- Spin Controls -->
        <div class="flex gap-x-44 z-10">
          <button
            @click="startSpin"
            :disabled="spinning || names.length < 2"
            class="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-40"
          >
            Start Spin
          </button>

          <button
            @click="stopSpinManually"
            :disabled="!spinning || stopping"
            class="px-6 py-2 bg-red-600 text-white rounded disabled:opacity-40"
          >
            Stop Spin
          </button>
        </div>





      </div>

      

    <div class="flex w-11/12 mx-auto justify-center">
      <!-- Wheel -->
      <div class="relative z-10">
        <!-- Arrow -->
        <div class="absolute -top-20 left-1/2 -translate-x-1/2 z-20">
          <div class="wheel-arrow" :class="{ 'arrow-tick': arrowTick }" :style="{ transform: arrowTransform }"/>
        </div>

        <canvas
          ref="canvasRef"
          :width="size"
          :height="size"
          class="rounded-full shadow-2xl"
        />

        <!-- Logo in center -->
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/spinthewheellogo.jpeg"
          alt="Wheel Logo"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
        />
      </div>

     
    </div>

        <!-- CSV Upload -->
        <div class="w-full max-w-md flex gap-2 z-10 mt-4">
          <input type="file" accept=".csv" @change="handleCSV" class="flex-1" />
          <button @click="loadCSV" class="px-4 py-2 bg-blue-600 text-white rounded">
            Upload CSV
          </button>
        </div>

        <!-- Download Winners -->
        <button
          @click="downloadWinners"
          :disabled="winnersLog.length === 0"
          class="mt-4 px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-40"
        >
          Download Winners Log
        </button>


    <!-- Winner Modal -->
    <div
      v-if="showWinnerModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div class="bg-white rounded-xl w-96 p-8 text-center animate-scale-in">
        <h3 class="text-lg font-semibold">🎉 Winner 🎉</h3>
        <p class="text-3xl font-extrabold text-green-700 my-4">
          {{ winner }}
        </p>

        <!-- Countdown timer -->
        <p v-if="countdown > 0" class="text-sm text-gray-500 mb-2 font-bold">
          {{ countdown }}<span v-if="countdown !== 1"> seconds</span>
        </p>

        <button
          v-if="countdown === 0"
          @click="removeWinner"
          class="w-full mb-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Remove Winner
        </button>

        <button
          @click="closeModal"
          class="w-full px-4 py-2 bg-gray-300 rounded"
        >
          Close
        </button>
      </div>
    </div>


    

    <!-- Sounds -->
    <audio ref="winAudio" src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/mixkit-ethereal-fairy-win-sound-2019.wav" />
    <audio ref="rollAudio" src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/ChristmasLoopMelody.mp3" />
    <audio ref="tickAudio" src="https://assets.mixkit.co/sfx/preview/mixkit-jingle-bells-583.mp3" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";

const size = 1000;
const canvasRef = ref(null);

const rollAudio = ref(null);
const tickAudio = ref(null);
const winAudio = ref(null);

const names = ref([]);
const newName = ref("");
const winner = ref("");
const showWinnerModal = ref(false);

const csvFile = ref(null);

// Log of winners with ISO timestamp
const winnersLog = ref([]); // Each entry: { name: string, timestamp: string }

const arrowTick = ref(false);
const arrowWobble = ref(0);

let ctx;
let angle = 0;
let velocity = 0;
let spinning = false;
let stopping = false;
let lastIndex = -1;
let raf;

// Countdown timer state
const countdown = ref(12);
let countdownInterval = null;

const sliceBounce = ref({});
const colors = ["#b91c1c", "#166534", "#facc15", "#9ca3af", "#991b1b", "#15803d"];
const sliceAngle = () => (Math.PI * 2) / names.value.length;

const arrowTransform = computed(() => {
  const wobble = arrowWobble.value;
  return `translateY(${wobble}px) rotate(${wobble ? -8 : 0}deg)`;
});

// DRAW WHEEL
function drawWheel() {
  if (!ctx || !names.value.length) return;

  const r = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(r, r);
  ctx.rotate(angle);

  const fontSize = Math.max(10, 26 - names.value.length / 10);

  names.value.forEach((name, i) => {
    const start = i * sliceAngle();
    const mid = start + sliceAngle() / 2;
    ctx.save();
    ctx.rotate(mid);
    ctx.translate(0, -(sliceBounce.value[i] || 0));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, -sliceAngle()/2, sliceAngle()/2);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.textAlign = "right";
    ctx.font = `bold ${fontSize}px Poppins`;
    ctx.fillStyle = "#fff";
    ctx.fillText(name, r - 18, 6);
    ctx.restore();
  });

  ctx.restore();
}

// START SPIN
function startSpin() {
  if (spinning || names.value.length < 2) return;

  spinning = true;
  stopping = false;
  velocity = 12.0;
  sliceBounce.value = {};

  rollAudio.value.loop = true;
  rollAudio.value.currentTime = 0;
  rollAudio.value.play();

  animate();
}

// STOP SPIN
function stopSpinManually() {
  if (!spinning || stopping) return;
  stopping = true;

  const targetIndex = Math.floor(Math.random() * names.value.length);
  const slice = sliceAngle();
  const targetAngle = Math.PI * 1.5 - targetIndex * slice - slice / 2;

  const startAngle = angle % (Math.PI * 2);
  let diff = ((targetAngle - startAngle + Math.PI * 4) % (Math.PI * 2));

  const duration = 3500;
  const startTime = performance.now();

  function decelerate(time) {
    const elapsed = time - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);

    angle = startAngle + diff * eased;
    velocity = 0;

    drawWheel();
    tickCheck();

    if (t < 1) raf = requestAnimationFrame(decelerate);
    else finalizeSpin(targetIndex);
  }

  raf = requestAnimationFrame(decelerate);
}

// ANIMATE WHILE SPINNING
function animate() {
  if (!stopping) {
    angle += velocity;
    velocity *= 0.995;
  }

  drawWheel();
  tickCheck();

  if (!stopping) raf = requestAnimationFrame(animate);
}

// TICK SOUND
function tickCheck() {
  const normalized = (Math.PI * 2 - (angle % (Math.PI * 2)) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  const idx = Math.floor(normalized / sliceAngle());

  if (idx !== lastIndex) {
    tickAudio.value.currentTime = 0;
    tickAudio.value.play();

    arrowTick.value = true;
    setTimeout(() => (arrowTick.value = false), 90);
    lastIndex = idx;
  }
}

// FINALIZE SPIN
function finalizeSpin(idx) {
  cancelAnimationFrame(raf);

  rollAudio.value.pause();
  rollAudio.value.currentTime = 0;

  winner.value = names.value[idx];
  showWinnerModal.value = true;
  winAudio.value.play();

  // Start 30-second countdown
  countdown.value = 12;
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) countdown.value -= 1;
    else clearInterval(countdownInterval);
  }, 1000);

  // Add to winners log with ISO timestamp
  const timestamp = new Date().toISOString();
  winnersLog.value.push({ name: winner.value, timestamp });


  spinning = false;
  stopping = false;
}

// NAME MANAGEMENT
function addName() {
  if (!newName.value.trim()) return;
  names.value.push(newName.value.trim());
  newName.value = "";
}
function removeName(i) {
  names.value.splice(i, 1);
}
function removeWinner() {
  const i = names.value.indexOf(winner.value);
  if (i !== -1) names.value.splice(i, 1);
  closeModal();
}
function handleCSV(e) {
  csvFile.value = e.target.files[0];
}
function loadCSV() {
  if (!csvFile.value) return;
  const reader = new FileReader();
  reader.onload = e => {
    names.value = e.target.result
      .split(/\r?\n/)
      .map(r => r.trim())
      .filter(Boolean)
      .slice(0, 350);
  };
  reader.readAsText(csvFile.value);
}
function closeModal() {
  showWinnerModal.value = false;
  if (countdownInterval) clearInterval(countdownInterval);
}

// DOWNLOAD WINNERS LOG WITH ISO TIMESTAMP
function downloadWinners() {
  if (winnersLog.value.length === 0) return;

  let csvContent = "data:text/csv;charset=utf-8,Rank,Winner,Timestamp\n";
  winnersLog.value.forEach((entry, index) => {
    csvContent += `${index + 1},${entry.name},${entry.timestamp}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "winners_log.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// LIFECYCLE
onMounted(() => {
  ctx = canvasRef.value.getContext("2d");
  drawWheel();
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  if (countdownInterval) clearInterval(countdownInterval);
});
watch(names, drawWheel, { deep: true });
</script>

<style scoped>
.festive-title {
  font-family: Poppins, sans-serif;
}

.wheel-arrow {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 80px solid black;
  rotate: 180deg;
  margin-top: 40px;
}

.arrow-tick {
  animation: arrow-bounce 0.14s cubic-bezier(0.25, 1.5, 0.5, 1);
}

@keyframes arrow-bounce {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(6px) rotate(-10deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

@keyframes scale-in {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
