<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const LSU_SEAL = 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/LSU%20Seal.PNG'

const config = useRuntimeConfig()
const endpoint = config.public.apiUrl

// ─── STATE ────────────────────────────────────────────────────────────
const isOpen      = ref(false)
const isMinimized = ref(false)
const showIntro   = ref(false)
const showMenu    = ref(false)

const sessionId    = ref('')
const messages     = ref([])
const inputText    = ref('')
const isSending    = ref(false)
const isFetching   = ref(false)
const chatBodyRef  = ref(null)
const unread       = ref(0)

const visitorName  = ref('')
const visitorEmail = ref('')
const nameStep     = ref(false)

let pollTimer = null

// ─── QUICK REPLIES ────────────────────────────────────────────────────
const quickReplies = [
  { emoji: '💰', label: 'Tuition fees' },
  { emoji: '📝', label: 'Enrollment steps' },
  { emoji: '🎓', label: 'Admission requirements' },
  { emoji: '🏅', label: 'Scholarship programs' },
  { emoji: '📞', label: 'Contact information' },
  { emoji: '🗓️', label: 'Academic calendar' },
  { emoji: '🏫', label: 'Campus services' },
]

const now = () =>
  new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

// ─── REAL-TIME FETCH / HISTORY ─────────────────────────────────────────
const fetchHistory = async (silent = false) => {
  if (!sessionId.value || isFetching.value) return
  isFetching.value = true
  try {
    const res = await $fetch(`${endpoint}/api/lsuanimoaichat/chat/${sessionId.value}/history/`)
    if (res) {
      if (res.visitor_name && !visitorName.value) visitorName.value = res.visitor_name
      if (res.visitor_email && !visitorEmail.value) visitorEmail.value = res.visitor_email
      if (Array.isArray(res.messages)) {
        if (res.messages.length > 0) {
          const mapped = res.messages.map(m => ({
            id: m.id,
            sender: m.sender,
            text: m.message,
            time: m.created_at_formatted,
            escalated: m.is_escalated,
          }))

          // Check if message count changed or new items arrived
          const nonTypingCount = messages.value.filter(m => !m.typing).length
          if (mapped.length !== nonTypingCount || messages.value.length === 0) {
            const hadTyping = messages.value.some(m => m.typing)
            messages.value = mapped
            if (hadTyping && isSending.value) {
              messages.value.push({ sender: 'bot', text: '', typing: true, id: 'typing', time: '' })
            }

            if (mapped.length > nonTypingCount && (!isOpen.value || isMinimized.value)) {
              unread.value += (mapped.length - nonTypingCount)
            }

            await nextTick()
            scrollToBottom()
          }
        } else if (messages.value.length === 0 && !nameStep.value) {
          pushBotWelcome()
        }
      }
    }
  } catch (err) {
    // If session was purged on server (404), reset cleanly
    if (err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404) {
      sessionId.value = ''
      if (process.client) localStorage.removeItem('lsuanimoai_session')
      if (messages.value.length === 0) {
        nameStep.value = true
      }
    }
  } finally {
    isFetching.value = false
  }
}

const startPolling = () => {
  stopPolling()
  // Real-time polling every 3 seconds while chat is active
  pollTimer = setInterval(() => {
    if (isOpen.value && !isMinimized.value && sessionId.value && !isSending.value) {
      fetchHistory(true)
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// ─── INIT & CLEANUP ───────────────────────────────────────────────────
onMounted(async () => {
  setTimeout(() => { showIntro.value = true }, 4000)
  setTimeout(() => { showIntro.value = false }, 14000)
  if (process.client) {
    const saved = localStorage.getItem('lsuanimoai_session')
    if (saved) {
      sessionId.value = saved
      fetchHistory(true)
    }
  }
})

onUnmounted(() => {
  stopPolling()
})

// ─── OPEN / CLOSE / TOGGLES ───────────────────────────────────────────
const openChat = async () => {
  showIntro.value = false
  isOpen.value = true
  isMinimized.value = false
  unread.value = 0

  if (sessionId.value) {
    await fetchHistory()
    if (messages.value.length === 0 && !nameStep.value) {
      pushBotWelcome()
    }
  } else if (messages.value.length === 0) {
    nameStep.value = true
  }

  startPolling()
  await nextTick()
  scrollToBottom()
}

const closeChat = () => {
  isOpen.value = false
  stopPolling()
}

const toggleMin = () => {
  isMinimized.value = !isMinimized.value
  if (!isMinimized.value) {
    unread.value = 0
    startPolling()
    nextTick(scrollToBottom)
  }
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const toggleNameStep = () => {
  nameStep.value = !nameStep.value
  showMenu.value = false
  if (!nameStep.value) {
    nextTick(scrollToBottom)
  }
}

// ─── WELCOME ──────────────────────────────────────────────────────────
const pushBotWelcome = () => {
  const n = visitorName.value ? `, ${visitorName.value.split(' ')[0]}` : ''
  messages.value.push({
    sender: 'bot',
    text: `Hi${n}! 👋 I'm **LSU Animo AI**, La Salle University's virtual assistant.\n\nI can help you with:\n• Admissions & enrollment\n• Tuition fees & scholarships\n• Schedules & academic calendar\n• Campus services\n\nHow can I help you today?`,
    time: now(),
  })
}

// ─── NAME STEP ────────────────────────────────────────────────────────
const startSession = async () => {
  const isUpdating = messages.value.length > 0
  nameStep.value = false
  try {
    const res = await $fetch(`${endpoint}/api/lsuanimoaichat/chat/start/`, {
      method: 'POST',
      body: {
        session_id: sessionId.value,
        visitor_name: visitorName.value,
        visitor_email: visitorEmail.value,
      },
    })
    sessionId.value = res.session_id
    if (process.client) localStorage.setItem('lsuanimoai_session', res.session_id)
  } catch {
    if (!sessionId.value) sessionId.value = `local_${Date.now()}`
  }
  if (!isUpdating && messages.value.length === 0) {
    pushBotWelcome()
  }
  startPolling()
  await nextTick()
  scrollToBottom()
}

const skipNameStep = async () => {
  nameStep.value = false
  try {
    const res = await $fetch(`${endpoint}/api/lsuanimoaichat/chat/start/`, { method: 'POST', body: {} })
    sessionId.value = res.session_id
    if (process.client) localStorage.setItem('lsuanimoai_session', res.session_id)
  } catch {
    sessionId.value = `local_${Date.now()}`
  }
  pushBotWelcome()
  startPolling()
  await nextTick()
  scrollToBottom()
}

// ─── SEND MESSAGE ─────────────────────────────────────────────────────
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isSending.value) return
  inputText.value = ''
  showMenu.value = false

  messages.value.push({ sender: 'user', text, time: now() })
  const typingId = Date.now()
  messages.value.push({ sender: 'bot', text: '', typing: true, id: typingId, time: '' })
  await nextTick()
  scrollToBottom()

  isSending.value = true
  try {
    const res = await $fetch(`${endpoint}/api/lsuanimoaichat/chat/send/`, {
      method: 'POST',
      body: {
        session_id: sessionId.value,
        message: text,
        visitor_name: visitorName.value,
        visitor_email: visitorEmail.value,
      },
    })
    if (res.session_id) {
      sessionId.value = res.session_id
      if (process.client) localStorage.setItem('lsuanimoai_session', res.session_id)
    }
    const tIdx = messages.value.findIndex(m => m.id === typingId)
    if (tIdx !== -1) messages.value.splice(tIdx, 1)
    messages.value.push({
      sender: 'bot',
      text: res.reply,
      time: now(),
      escalated: res.escalated,
    })
    if (!isOpen.value || isMinimized.value) unread.value++
  } catch {
    const tIdx = messages.value.findIndex(m => m.id === typingId)
    if (tIdx !== -1) messages.value.splice(tIdx, 1)
    messages.value.push({
      sender: 'bot',
      text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      time: now(),
    })
  } finally {
    isSending.value = false
    await nextTick()
    scrollToBottom()
  }
}

const handleEnter = (e) => {
  if (!e.shiftKey) sendMessage()
}

const scrollToBottom = () => {
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

const sendQuick = (label) => {
  showMenu.value = false
  inputText.value = label
  sendMessage()
}

// ─── RENDER TEXT ──────────────────────────────────────────────────────
const renderText = (text) => {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const formatted = escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-emerald-50 text-emerald-700 text-xs px-1 rounded font-mono">$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/•/g, '&bull;')

  return formatted.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline text-emerald-600 hover:text-emerald-800 break-all">$1</a>'
  )
}
</script>

<template>
  <!-- ── ROOT — fixed bottom-left ────────────────────────────────────── -->
  <div class="fixed bottom-20 left-4 z-[99990] font-sans">

    <!-- ── INTRO BUBBLE ──────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showIntro && !isOpen"
        class="absolute bottom-16 left-0 bg-white border border-emerald-500 text-slate-800 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-xl text-sm font-medium flex items-center gap-2 cursor-pointer whitespace-nowrap max-w-[240px]"
        @click="openChat"
      >
        <span>👋 Hi! Ask me anything about LSU!</span>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-600 text-xs leading-none bg-transparent border-0 cursor-pointer"
          @click.stop="showIntro = false"
        >✕</button>
      </div>
    </Transition>

    <!-- ── FAB BUTTON ─────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-75"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-75"
    >
      <button
        v-if="!isOpen"
        type="button"
        class="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-500 border-0 cursor-pointer flex items-center justify-center shadow-[0_6px_20px_rgba(22,163,74,.5)] hover:scale-110 transition-transform duration-200"
        aria-label="Open LSU Animo AI"
        @click="openChat"
      >
        <!-- Pulse rings -->
        <span class="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping"></span>
        <!-- Seal logo -->
        <img :src="LSU_SEAL" alt="LSU" class="w-9 h-9 object-contain relative z-10 drop-shadow" />
        <!-- Unread badge -->
        <span
          v-if="unread > 0"
          class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow"
        >{{ unread }}</span>
      </button>
    </Transition>

    <!-- ── CHAT WINDOW ─────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-0 left-0 w-[500px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,.22)] flex flex-col border border-slate-200 overflow-hidden"
        :class="isMinimized ? 'max-h-[60px]' : 'max-h-[520px]'"
        style="transition: max-height 0.3s ease;"
      >
        <!-- ── HEADER ───────────────────────────────────────────────── -->
        <div class="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-500 flex-shrink-0 select-none">
          <div class="flex items-center gap-2.5">
            <!-- Avatar -->
            <div class="w-9 h-9 rounded-full bg-emerald-400/50 flex items-center justify-center p-0.5 flex-shrink-0 shadow-sm">
              <img :src="LSU_SEAL" alt="LSU" class="w-7 h-7 object-contain" />
            </div>
            <div>
              <div class="text-white text-sm font-bold leading-tight text-left flex items-center gap-1.5">
                <span>LSU Animo AI</span>
                <span v-if="isFetching" class="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" title="Syncing"></span>
              </div>
              <div class="text-emerald-100 text-[11px] flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block animate-pulse"></span>
                Usually replies instantly
              </div>
            </div>
          </div>
          <div class="flex gap-1.5">
            <!-- Return / Back to Name & Email button -->
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              :title="nameStep ? 'Back to Chat' : 'Update Name & Email'"
              @click="toggleNameStep"
            >
              <i :class="['fa', nameStep ? 'fa-arrow-left' : 'fa-undo']"></i>
            </button>
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              :title="isMinimized ? 'Expand' : 'Minimize'"
              @click="toggleMin"
            >
              <i :class="['fa', isMinimized ? 'fa-chevron-up' : 'fa-minus']"></i>
            </button>
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              title="Close"
              @click="closeChat"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>

        <!-- ── BODY (hidden when minimized) ───────────────────────── -->
        <template v-if="!isMinimized">

          <!-- NAME STEP ─────────────────────────────────────────────── -->
          <div v-if="nameStep" class="flex flex-col items-center gap-3 px-5 py-6 flex-1 bg-white">
            <img :src="LSU_SEAL" alt="LSU" class="w-20 h-20 object-contain drop-shadow-md" />
            <div class="text-base font-bold text-slate-800 text-center">
              {{ messages.length > 0 ? 'Update Contact Information' : 'Welcome to LSU Animo AI!' }}
            </div>
            <p class="text-xs text-slate-700 text-center m-0">
              {{ messages.length > 0 ? 'Update your name and email so our team can follow up.' : 'Before we start, may we know who we\'re talking to? (Optional)' }}
            </p>
            <input
              v-model="visitorName"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-800 bg-white"
              placeholder="Your name"
              maxlength="80"
              @keydown.enter="startSession"
            />
            <input
              v-model="visitorEmail"
              type="email"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-800 bg-white"
              placeholder="Email (so our team can follow up)"
              maxlength="120"
              @keydown.enter="startSession"
            />
            <div class="flex gap-2 w-full mt-1">
              <button
                type="button"
                class="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity border-0 cursor-pointer shadow-sm"
                @click="startSession"
              >
                <i :class="['fa', messages.length > 0 ? 'fa-check' : 'fa-comments']"></i>
                {{ messages.length > 0 ? 'Save & Return' : 'Start Chat' }}
              </button>
              <button
                type="button"
                class="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                @click="messages.length > 0 ? (nameStep = false) : skipNameStep()"
              >{{ messages.length > 0 ? 'Back to Chat' : 'Skip' }}</button>
            </div>
          </div>

          <!-- CHAT MESSAGES ────────────────────────────────────────── -->
          <div
            v-else
            ref="chatBodyRef"
            class="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 bg-slate-50 scroll-smooth min-h-[280px]"
            style="scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;"
          >
            <div
              v-for="(msg, idx) in messages"
              :key="msg.id || idx"
              :class="['flex items-end gap-1.5', msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row']"
            >
              <!-- Bot / Staff avatar -->
              <div
                v-if="msg.sender !== 'user'"
                class="w-7 h-7 rounded-full bg-emerald-700 border border-slate-200 flex items-center justify-center p-0.5 flex-shrink-0 shadow-xs"
                :title="msg.sender === 'human' ? 'LSU Support Team' : 'LSU Animo AI'"
              >
                <img v-if="msg.sender === 'bot'" :src="LSU_SEAL" alt="LSU" class="w-5 h-5 object-contain" />
                <i v-else class="fa fa-user-circle text-emerald-700 text-sm"></i>
              </div>

              <!-- Bubble -->
              <div
                :class="[
                  'max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed relative text-left',
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-emerald-700 to-emerald-500 text-white rounded-br-sm shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-xs'
                ]"
              >
                <!-- Staff badge -->
                <div v-if="msg.sender === 'human'" class="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1 border-b border-emerald-100 pb-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  LSU Support Staff
                </div>

                <!-- Typing indicator -->
                <div v-if="msg.typing" class="flex gap-1 items-center py-1 px-1">
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                </div>

                <!-- Text -->
                <div v-else class="break-words" v-html="renderText(msg.text)"></div>

                <!-- Escalated notice -->
                <div
                  v-if="msg.escalated"
                  class="flex items-center gap-1.5 mt-2 pt-2 border-t border-sky-100 text-sky-600 text-[11px]"
                >
                  <i class="fa fa-envelope text-xs"></i>
                  Our team has been notified and will follow up via email.
                </div>

                <!-- Time -->
                <div
                  v-if="msg.time"
                  :class="['text-[10px] mt-1 text-right', msg.sender === 'user' ? 'text-emerald-100/75' : 'text-slate-400']"
                >{{ msg.time }}</div>
              </div>
            </div>

            <!-- Quick reply chips — shown after first bot message only -->
            <div
              v-if="messages.length === 1 && messages[0].sender === 'bot'"
              class="flex flex-wrap gap-1.5 mt-1"
            >
              <button
                v-for="qr in quickReplies"
                :key="qr.label"
                type="button"
                class="px-3 py-1.5 rounded-full border border-emerald-500 bg-white text-emerald-700 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer shadow-2xs"
                @click="sendQuick(qr.label)"
              >{{ qr.emoji }} {{ qr.label }}</button>
            </div>
          </div>

          <!-- ── MAIN MENU PANEL ──────────────────────────────────── -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div v-if="showMenu && !nameStep" class="flex-shrink-0 border-t-2 border-emerald-500 bg-white shadow-[0_-8px_24px_rgba(0,0,0,.08)]">
              <!-- Panel header -->
              <div class="flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-0 border-b border-emerald-100">
                <img :src="LSU_SEAL" alt="LSU" class="w-7 h-7 object-contain flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-emerald-800">Main Menu</div>
                  <div class="text-[11px] text-slate-500">What can I help you with?</div>
                </div>
                <button
                  type="button"
                  class="w-6 h-6 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-0 cursor-pointer flex items-center justify-center text-xs transition-colors flex-shrink-0"
                  @click="showMenu = false"
                >
                  <i class="fa fa-times"></i>
                </button>
              </div>
              <!-- Menu items -->
              <div class="flex flex-col max-h-[190px] overflow-y-auto" style="scrollbar-width:thin;">
                <button
                  v-for="qr in quickReplies"
                  :key="qr.label"
                  type="button"
                  class="flex items-center justify-between px-4 py-2.5 border-0 border-b border-slate-100 last:border-b-0 bg-transparent hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-medium text-left cursor-pointer transition-colors w-full"
                  @click="sendQuick(qr.label)"
                >
                  <span>{{ qr.emoji }} {{ qr.label }}</span>
                  <i class="fa fa-chevron-right text-[10px] text-slate-400"></i>
                </button>
              </div>
            </div>
          </Transition>

          <!-- ── INPUT ROW ─────────────────────────────────────────── -->
          <div v-if="!nameStep" class="flex items-end border-0 border-t border-slate-200 bg-white flex-shrink-0 relative">
            <!-- Main menu toggle button -->
            <button
              type="button"
              :class="[
                'w-11 self-stretch border-0 border-r border-slate-200 flex items-center justify-center text-base transition-colors flex-shrink-0 cursor-pointer',
                showMenu
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
              ]"
              title="Main Menu"
              @click="toggleMenu"
            >
              <i class="fa fa-th-large"></i>
            </button>

            <!-- Textarea + send -->
            <div class="flex items-end gap-2 px-2.5 py-2 flex-1">
              <textarea
                v-model="inputText"
                class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white max-h-20 font-sans disabled:opacity-50 text-slate-900"
                placeholder="Ask me anything about LSU…"
                rows="1"
                maxlength="500"
                :disabled="isSending"
                @keydown.enter.exact.prevent="handleEnter"
              ></textarea>
              <button
                type="button"
                :class="[
                  'w-9 h-9 rounded-xl flex items-center justify-center text-sm border-0 transition-all flex-shrink-0',
                  inputText.trim() && !isSending
                    ? 'bg-gradient-to-br from-emerald-700 to-emerald-500 text-white cursor-pointer hover:opacity-90 hover:scale-105 shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                ]"
                :disabled="!inputText.trim() || isSending"
                @click="sendMessage"
              >
                <i v-if="isSending" class="fa fa-spinner fa-spin"></i>
                <i v-else class="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>

          <!-- ── FOOTER ────────────────────────────────────────────── -->
          <div class="py-1.5 text-center text-[10px] text-slate-400 border-0 border-t border-slate-100 bg-white flex-shrink-0 select-none">
            Powered by <strong class="text-emerald-700">NPCC</strong> · La Salle University Ozamiz, Inc.
          </div>

        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped></style>