<template>
  <div class="w-full flex flex-col items-center gap-6 relative overflow-hidden">
    <!-- Snow -->
    <canvas ref="snowCanvas" class="fixed inset-0 z-0 pointer-events-none" />

    <h2 class="text-2xl font-extrabold tracking-wide festive-title z-10">
      🎡 Spin The Wheel
    </h2>

    <!-- Wheel -->
    <div class="relative z-10">
      <canvas
        ref="canvasRef"
        :width="size"
        :height="size"
        class="rounded-full shadow-2xl"
      />

      <button
        @click="spin"
        class="absolute inset-0 m-auto h-20 w-20 rounded-full
        bg-gradient-to-br from-red-600 to-green-700
        text-white font-extrabold shadow-xl
        active:scale-95 transition"
      >
        SPIN
      </button>
    </div>

    <!-- Add -->
    <div class="w-full max-w-md flex gap-2 z-10">
      <input
        v-model="newName"
        placeholder="Add name"
        class="flex-1 border rounded px-3 py-2"
        @keyup.enter="addName"
      />
      <button @click="addName" class="px-4 py-2 bg-green-600 text-white rounded">
        Add
      </button>
    </div>

    <!-- Name List -->
    <div class="w-full max-w-md bg-white rounded shadow z-10 p-3">
      <div
        v-for="(n, i) in names"
        :key="i"
        class="flex justify-between items-center border-b last:border-0 py-1"
      >
        <span class="font-medium">{{ n }}</span>
        <button
          @click="removeName(i)"
          class="text-red-600 text-sm hover:underline"
        >
          remove
        </button>
      </div>
    </div>

    <!-- CSV -->
    <div class="w-full max-w-md flex gap-2 z-10">
      <input type="file" accept=".csv" @change="handleCSV" class="flex-1" />
      <button @click="loadCSV" class="px-4 py-2 bg-blue-600 text-white rounded">
        Upload CSV
      </button>
    </div>

    <!-- Toggle -->
    <label class="flex items-center gap-2 text-sm z-10">
      <input type="checkbox" v-model="autoRemove" />
      🎁 Auto-remove winner
    </label>

    <!-- Winner Modal -->
    <div
      v-if="showWinnerModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div class="bg-white rounded-xl shadow-2xl w-96 p-8 text-center animate-scale-in">
        <h3 class="text-lg font-semibold">🎉 Winner 🎉</h3>
        <p class="text-3xl font-extrabold text-green-700 my-4">
          {{ winner }}
        </p>

        <button
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

    <!-- Confetti -->
    <canvas
      v-if="showWinnerModal"
      ref="confettiCanvas"
      class="fixed inset-0 z-40 pointer-events-none"
    />

    <!-- Sounds -->
    <audio ref="winAudio" preload="auto"
      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/mixkit-ethereal-fairy-win-sound-2019.wav" />
    <audio ref="rollAudio" preload="auto" loop
      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/8bit-spinning-wheel-sfx-330980.mp3" />
    <audio ref="tickAudio" preload="auto"
      src="https://assets.mixkit.co/sfx/preview/mixkit-jingle-bells-583.mp3" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const size = 360;
const canvasRef = ref(null);
const snowCanvas = ref(null);
const confettiCanvas = ref(null);

const winAudio = ref(null);
const rollAudio = ref(null);
const tickAudio = ref(null);

const names = ref(["Alice", "Bob", "Charlie", "Diana"]);
const newName = ref("");
const winner = ref("");
const showWinnerModal = ref(false);
const autoRemove = ref(false);
const csvFile = ref(null);

let ctx;
let angle = 0;
let velocity = 0;
let spinning = false;
let lastIndex = -1;
let raf;

const colors = ["#b91c1c", "#166534", "#facc15", "#9ca3af", "#991b1b", "#15803d"];

const sliceAngle = () => (Math.PI * 2) / names.value.length;

function drawWheel() {
  if (!ctx || names.value.length === 0) return;

  const r = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(r, r);
  ctx.rotate(angle);

  names.value.forEach((name, i) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, i * sliceAngle(), (i + 1) * sliceAngle());
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    ctx.save();
    ctx.rotate(i * sliceAngle() + sliceAngle() / 2);
    ctx.textAlign = "right";
    ctx.font = "bold 15px Poppins";
    ctx.fillStyle = "#fff";
    ctx.fillText(name, r - 12, 6);
    ctx.restore();
  });

  ctx.restore();
}

function spin() {
  if (spinning || names.value.length < 2) return;

  spinning = true;
  velocity = Math.random() * 0.35 + 0.45;
  rollAudio.value.currentTime = 0;
  rollAudio.value.play();

  function animate() {
    velocity *= 0.985;
    angle += velocity;
    drawWheel();
    tickCheck();

    if (velocity > 0.002) {
      raf = requestAnimationFrame(animate);
    } else {
      stopSpin();
    }
  }

  animate();
}

function tickCheck() {
  const idx = Math.floor(
    ((Math.PI * 2 - (angle % (Math.PI * 2))) % (Math.PI * 2)) /
      sliceAngle()
  );

  if (idx !== lastIndex) {
    tickAudio.value.currentTime = 0;
    tickAudio.value.play();
    lastIndex = idx;
  }
}

function stopSpin() {
  cancelAnimationFrame(raf);
  rollAudio.value.pause();
  spinning = false;

  const idx = Math.floor(
    ((Math.PI * 2 - (angle % (Math.PI * 2))) % (Math.PI * 2)) /
      sliceAngle()
  );

  winner.value = names.value[idx];
  showWinnerModal.value = true;
  winAudio.value.play();

  if (autoRemove.value) names.value.splice(idx, 1);
}

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
  const r = new FileReader();
  r.onload = e => {
    names.value.push(
      ...e.target.result
        .split("\n")
        .map(l => l.split(",")[0].trim())
        .filter(Boolean)
    );
  };
  r.readAsText(csvFile.value);
}

function closeModal() {
  showWinnerModal.value = false;
}

onMounted(() => {
  ctx = canvasRef.value.getContext("2d");
  drawWheel();
});

onBeforeUnmount(() => cancelAnimationFrame(raf));
watch(names, drawWheel, { deep: true });
</script>

<style scoped>
.festive-title {
  font-family: "Poppins", sans-serif;
}
@keyframes scale-in {
  from {
    transform: scale(0.7);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
</style>
