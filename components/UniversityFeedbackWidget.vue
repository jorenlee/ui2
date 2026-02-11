<template>
  <div>
    <!-- Toaster Notification -->
    <transition name="fade">
      <div
        v-if="toaster.show"
        class="fixed top-1/2 right-4 z-[99999] px-6 py-4 rounded-lg shadow-2xl text-white font-medium flex items-center gap-3 max-w-md animate-slide-in text-xs"
        :class="{
          'bg-green-600': toaster.type === 'success',
          'bg-red-600': toaster.type === 'error',
          'bg-blue-600': toaster.type === 'info',
          'bg-yellow-600': toaster.type === 'warning',
        }"
      >
        <i
          class="fa text-xl"
          :class="{
            'fa-check-circle': toaster.type === 'success',
            'fa-exclamation-circle': toaster.type === 'error',
            'fa-info-circle': toaster.type === 'info',
            'fa-exclamation-triangle': toaster.type === 'warning',
          }"
        ></i>
        <span>{{ toaster.message }}</span>
      </div>
    </transition>

    <!-- Feedback Widget Button -->
    <div class="fixed bottom-20 right-4 z-[9999]">
      <div class="relative">
        <!-- Pulsing Ring Animations (only show when attention animation is active) -->
        <div v-if="showAttentionAnimation && !showWidget" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="absolute w-14 h-14 rounded-full bg-green-500 opacity-75 animate-pulse-ring"></div>
          <div class="absolute w-14 h-14 rounded-full bg-green-500 opacity-50 animate-pulse-ring animation-delay-700"></div>
          <div class="absolute w-14 h-14 rounded-full bg-green-400 opacity-30 animate-pulse-ring animation-delay-1400"></div>
        </div>

        <!-- Main Button -->
        <button
          v-if="!showWidget"
          @click="openWidget"
          class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 relative"
          :class="{ 'animate-attention-zoom': showAttentionAnimation }"
        >
          <i class="fa fa-comment-dots text-2xl" aria-hidden="true"></i>
          <i
            class="fa fa-thumbs-up absolute top-1 right-3 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center"
            aria-hidden="true"
          ></i>
        </button>
      </div>
    </div>

    <!-- Feedback Widget Modal -->
    <transition name="slide-up">
      <div
        v-if="showWidget"
        class="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-6 z-[9999] bg-white rounded-t-2xl md:rounded-2xl shadow-2xl lg:w-3/12 max-h-[90vh] overflow-y-auto border-t-2 md:border-2 border-green-600"
      >
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1 flex justify-between items-center"
        >
          <div class="flex items-center gap-2">
            <i class="fa fa-comment-dots text-lg"></i>
            <h3 class="font-bold text-xs">Website Feedback</h3>
          </div>
          <button
            @click="closeWidget"
            class="text-white hover:text-gray-200 transition-colors p-1"
          >
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>

        <!-- Step 1: Experience Rating -->
        <div v-if="currentStep === 1" class="px-6 py-2">
          <h4 class="text-green-900 font-semibold text-center text-lg">
            How's your experience?
          </h4>

          <div class="flex justify-center gap-8 mb-2">
            <button
              @click="selectExperience('ThumbsDown')"
              class="flex flex-col items-center gap-2 px-12 py-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
              :class="
                feedback.feedback_experience === 'ThumbsDown'
                  ? 'bg-red-100 ring-2 ring-red-600'
                  : 'hover:bg-gray-100'
              "
            >
              <div class="text-4xl scale-x-[-1]">
                <i class="fa fa-thumbs-down" aria-hidden="true"></i>
              </div>
            </button>

            <button
              @click="selectExperience('ThumbsUp')"
              class="flex flex-col items-center gap-2 px-12 py-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
              :class="
                feedback.feedback_experience === 'ThumbsUp'
                  ? 'bg-green-100 ring-2 ring-green-600'
                  : 'hover:bg-gray-100'
              "
            >
              <div class="text-4xl">
                <i class="fa fa-thumbs-up" aria-hidden="true"></i>
              </div>
            </button>
          </div>

          <!-- Suggestion Option -->
          <button
            @click="selectExperience('Suggestion')"
            class="w-full py-1 px-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 active:scale-95 text-base"
            :class="
              feedback.feedback_experience === 'Suggestion'
                ? 'bg-yellow-100 border-yellow-600 text-yellow-800'
                : 'border-gray-300 text-gray-700 hover:border-yellow-400'
            "
          >
            <i class="fa fa-lightbulb mr-2"></i>
            I have a suggestion
          </button>
        </div>

        <!-- Step 2: Feedback Message -->
        <div v-if="currentStep === 2" class="px-6 pb-4 pt-3">
          <button
            @click="currentStep = 1"
            class="text-green-600 hover:text-green-700 mb-4 flex items-center gap-1 text-base"
          >
            <i class="fa fa-arrow-left"></i>
            <span class="text-sm">Back</span>
          </button>

          <h4 class="text-gray-800 font-semibold text-sm">Tell us more</h4>

          <!-- Name Input -->
          <div class="mb-1">
            <label class="text-left block text-[10px] text-gray-700">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="feedback.name"
              type="text"
              placeholder="Your name"
              class="w-full px-2 py-1 text-xs border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
          </div>

          <!-- Email Input -->
          <div class="mb-1">
            <label class="text-left block text-[10px] text-gray-700">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              v-model="feedback.email"
              type="email"
              placeholder="your.email@example.com"
              class="w-full px-2 py-1 text-xs border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
          </div>

          <!-- Message Textarea -->
          <div class="mb-2">
            <label class="text-left block text-[10px] text-gray-700">
              Message <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="feedback.feedback_message"
              rows="4"
              placeholder="Share your feedback or suggestion..."
              class="w-full px-2 py-1 text-xs border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
              required
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button
            @click="submitFeedback"
            :disabled="isSubmitting || !isFormValid"
            class="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 text-xs"
          >
            <i class="fa" :class="isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
            <span>{{
              isSubmitting ? "Submitting..." : "Submit Feedback"
            }}</span>
          </button>
        </div>

        <!-- Step 3: Thank You -->
        <div v-if="currentStep === 3" class="p-6 text-center">
          <div class="text-6xl mb-5">🏆</div>
          <h4 class="text-gray-800 font-bold text-xl mb-3">Thank You!</h4>
          <p class="text-gray-600 mb-6 text-base">
            Your feedback has been submitted successfully. We appreciate your
            input!
          </p>
          <button
            @click="closeWidget"
            class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-lg font-semibold text-base transition-all duration-300 active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// Widget state
const showWidget = ref(false);
const currentStep = ref(1);
const isSubmitting = ref(false);

// Attention animation state
const showAttentionAnimation = ref(false);
let animationInterval = null;

// Cooldown state (5 minutes = 300000 milliseconds)
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes
const lastSubmissionTime = ref(null);
const remainingCooldown = ref(0);

// Feedback data
const feedback = ref({
  name: "",
  email: "",
  feedback_experience: "",
  feedback_message: "",
});

// Toaster
const toaster = ref({
  show: false,
  message: "",
  type: "success",
});

const showToaster = (message, type = "success", duration = 4000) => {
  toaster.value.message = message;
  toaster.value.type = type;
  toaster.value.show = true;

  setTimeout(() => {
    toaster.value.show = false;
  }, duration);
};

// Computed
const isFormValid = computed(() => {
  return (
    feedback.value.name.trim() !== "" &&
    feedback.value.email.trim() !== "" &&
    feedback.value.feedback_message.trim() !== ""
  );
});

const isOnCooldown = computed(() => {
  if (!lastSubmissionTime.value) return false;
  const now = Date.now();
  const timeSinceLastSubmission = now - lastSubmissionTime.value;
  return timeSinceLastSubmission < COOLDOWN_DURATION;
});

const cooldownTimeRemaining = computed(() => {
  if (!isOnCooldown.value) return 0;
  const now = Date.now();
  const timeSinceLastSubmission = now - lastSubmissionTime.value;
  const remaining = COOLDOWN_DURATION - timeSinceLastSubmission;
  return Math.ceil(remaining / 1000); // Return seconds
});

const cooldownMessage = computed(() => {
  const seconds = cooldownTimeRemaining.value;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} before submitting again.`;
  }
  return `Please wait ${seconds} second${seconds !== 1 ? 's' : ''} before submitting again.`;
});

// Methods
const openWidget = () => {
  showWidget.value = true;
  currentStep.value = 1;
};

const closeWidget = () => {
  showWidget.value = false;
  resetForm();
};

const selectExperience = (experience) => {
  feedback.value.feedback_experience = experience;
  currentStep.value = 2;
};

const resetForm = () => {
  feedback.value = {
    name: "",
    email: "",
    feedback_experience: "",
    feedback_message: "",
  };
  currentStep.value = 1;
};

const submitFeedback = async () => {
  // Check if form is valid
  if (!isFormValid.value) {
    showToaster("Please fill in all required fields.", "error");
    return;
  }

  // Check cooldown
  if (isOnCooldown.value) {
    showToaster(`⏱️ ${cooldownMessage.value}`, "warning", 5000);
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await $fetch(endpoint.value + "/api/cits/feedback/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: feedback.value,
    });

    if (res.status === "created") {
      // Store the submission time
      lastSubmissionTime.value = Date.now();

      // Save to localStorage for persistence across page reloads
      localStorage.setItem('feedbackLastSubmission', lastSubmissionTime.value.toString());

      currentStep.value = 3;
      showToaster("✅ Feedback submitted successfully!", "success");
    } else if (res.status === "errors") {
      console.error("Form errors:", res.errors);
      showToaster("❌ Failed to submit feedback. Please try again.", "error");
    }
  } catch (err) {
    console.error("Failed to submit feedback:", err);
    showToaster("❌ Please input the correct fields.", "error");
  } finally {
    isSubmitting.value = false;
  }
};

// Initialize last submission time from localStorage on component mount
onMounted(() => {
  const savedTime = localStorage.getItem('feedbackLastSubmission');
  if (savedTime) {
    lastSubmissionTime.value = parseInt(savedTime, 10);
  }

  // Trigger attention animation every 5 minutes (300000ms)
  animationInterval = setInterval(() => {
    if (!showWidget.value) {
      // Activate animation
      showAttentionAnimation.value = true;

      // Deactivate animation after 4 seconds
      setTimeout(() => {
        showAttentionAnimation.value = false;
      }, 4000);
    }
  }, 3000); // 3 seconds = 3000ms
});

// Cleanup interval on component unmount
onBeforeUnmount(() => {
  if (animationInterval) {
    clearInterval(animationInterval);
  }
});
</script>

<style scoped>
/* Fade transition for toaster */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide up transition for widget */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Animation for slide in */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

/* Attention-grabbing animations */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.75;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

@keyframes attention-zoom {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(1.05);
  }
  75% {
    transform: scale(1.15);
  }
}

.animate-pulse-ring {
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animation-delay-700 {
  animation-delay: 0.7s;
}

.animation-delay-1400 {
  animation-delay: 1.4s;
}

.animate-attention-zoom {
  animation: attention-zoom 2s ease-in-out infinite;
}
</style>
