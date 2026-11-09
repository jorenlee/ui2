<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

const LSU_SEAL = 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/LSU%20Seal.PNG'

const config = useRuntimeConfig()
const endpoint = config.public.apiUrl

// ─── STATE ────────────────────────────────────────────────────────────
const isOpen      = ref(false)
const isMinimized = ref(false)
const showIntro   = ref(false)
const showMenu    = ref(false)
const showResetConfirm = ref(false)

// ─── RESIZABLE CHAT BOX STATE ─────────────────────────────────────────
const chatWidth       = ref(420)
const chatHeight      = ref(560)
const isMaximized     = ref(false)
const prevDimensions  = ref({ width: 420, height: 560 })
const isResizing      = ref(false)
let resizeDirection   = null
let startX = 0
let startY = 0
let startW = 0
let startH = 0

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
  { icon: 'fa fa-coins text-amber-500', label: 'Tuition fees' },
  { icon: 'fa fa-clipboard-list text-blue-500', label: 'Enrollment steps' },
  { icon: 'fa fa-graduation-cap text-indigo-500', label: 'Admission requirements' },
  { icon: 'fa fa-award text-emerald-500', label: 'Scholarship programs' },
  { icon: 'fa fa-phone text-rose-500', label: 'Contact information' },
  { icon: 'fa fa-calendar-days text-teal-500', label: 'Academic calendar' },
  { icon: 'fa fa-building-columns text-sky-500', label: 'Campus services' },
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
  setTimeout(() => { showIntro.value = true }, 3000)
  setTimeout(() => { showIntro.value = false }, 16000)
  if (process.client) {
    const saved = localStorage.getItem('lsuanimoai_session')
    if (saved) {
      sessionId.value = saved
      await fetchHistory()
    }
    const savedW = parseInt(localStorage.getItem('lsuanimoai_box_w') || '0', 10)
    const savedH = parseInt(localStorage.getItem('lsuanimoai_box_h') || '0', 10)
    if (savedW >= 320 && savedW <= 1200) chatWidth.value = savedW
    if (savedH >= 380 && savedH <= 1000) chatHeight.value = savedH
  }
})

onUnmounted(() => {
  stopPolling()
  if (process.client) {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }
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

// ─── RESET CHAT ───────────────────────────────────────────────────────
const promptResetChat = () => {
  if (isMinimized.value) isMinimized.value = false
  if (messages.value.length === 0) {
    confirmResetChat()
    return
  }
  showResetConfirm.value = true
}

const cancelResetChat = () => {
  showResetConfirm.value = false
}

const confirmResetChat = async () => {
  showResetConfirm.value = false
  stopPolling()
  isSending.value = false
  messages.value = []
  inputText.value = ''
  unread.value = 0
  nameStep.value = false
  showMenu.value = false
  sessionId.value = ''

  if (process.client) {
    localStorage.removeItem('lsuanimoai_session')
  }

  try {
    const res = await $fetch(`${endpoint}/api/lsuanimoaichat/chat/start/`, {
      method: 'POST',
      body: {
        visitor_name: visitorName.value,
        visitor_email: visitorEmail.value,
      },
    })
    if (res?.session_id) {
      sessionId.value = res.session_id
      if (process.client) {
        localStorage.setItem('lsuanimoai_session', res.session_id)
      }
    }
  } catch {
    sessionId.value = `local_${Date.now()}`
  }

  pushBotWelcome()
  startPolling()
  await nextTick()
  scrollToBottom()
}

// ─── RESIZE & MAXIMIZE LOGIC ──────────────────────────────────────────
const boxStyle = computed(() => {
  if (isMinimized.value) {
    return {
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      height: '62px',
      transition: 'height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }
  }

  if (isMaximized.value) {
    return {
      width: 'min(920px, calc(100vw - 32px))',
      height: 'min(820px, calc(100vh - 48px))',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100vh - 48px)',
      transition: isResizing.value ? 'none' : 'width 0.25s ease, height 0.25s ease',
    }
  }

  return {
    width: `${chatWidth.value}px`,
    height: `${chatHeight.value}px`,
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 48px)',
    transition: isResizing.value ? 'none' : 'height 0.25s ease, width 0.25s ease',
  }
})

const startResize = (e, direction) => {
  if (isMinimized.value) return
  e.preventDefault()
  e.stopPropagation()
  isResizing.value = true
  resizeDirection = direction
  startX = e.clientX
  startY = e.clientY
  startW = chatWidth.value
  startH = chatHeight.value

  if (isMaximized.value) {
    isMaximized.value = false
    startW = Math.min(920, window.innerWidth - 32)
    startH = Math.min(820, window.innerHeight - 48)
    chatWidth.value = startW
    chatHeight.value = startH
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  document.body.style.userSelect = 'none'
}

const onPointerMove = (e) => {
  if (!isResizing.value) return
  const maxW = Math.max(340, window.innerWidth - 32)
  const maxH = Math.max(380, window.innerHeight - 48)
  const minW = 320
  const minH = 380

  if (resizeDirection.includes('e')) {
    const deltaX = e.clientX - startX
    const newW = Math.min(Math.max(startW + deltaX, minW), maxW)
    chatWidth.value = Math.round(newW)
  }

  if (resizeDirection.includes('n')) {
    const deltaY = startY - e.clientY
    const newH = Math.min(Math.max(startH + deltaY, minH), maxH)
    chatHeight.value = Math.round(newH)
  }
}

const onPointerUp = () => {
  if (isResizing.value) {
    isResizing.value = false
    resizeDirection = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    document.body.style.userSelect = ''
    if (process.client) {
      localStorage.setItem('lsuanimoai_box_w', String(chatWidth.value))
      localStorage.setItem('lsuanimoai_box_h', String(chatHeight.value))
    }
    nextTick(scrollToBottom)
  }
}

const toggleMaximize = () => {
  if (isMinimized.value) isMinimized.value = false
  if (!isMaximized.value) {
    prevDimensions.value = { width: chatWidth.value, height: chatHeight.value }
    isMaximized.value = true
  } else {
    isMaximized.value = false
    chatWidth.value = prevDimensions.value.width
    chatHeight.value = prevDimensions.value.height
  }
  nextTick(scrollToBottom)
}

// ─── WELCOME ──────────────────────────────────────────────────────────
const pushBotWelcome = () => {
  const n = visitorName.value ? `, ${visitorName.value.split(' ')[0]}` : ''
  messages.value.push({
    sender: 'bot',
    text: `Hi${n}! I'm **LSU Animo AI**, La Salle University's virtual assistant.\n\nI can help you with:\n• Admissions & enrollment\n• Tuition fees & scholarships\n• Schedules & academic calendar\n• Campus services\n\nHow can I help you today?`,
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
      source: res.source || '',
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

// ─── AI SOURCE LABEL ──────────────────────────────────────────────────
const sourceLabel = (src) => {
  if (!src || src === 'greeting' || src === 'thanks') return null
  if (src === 'gemini')        return { icon: 'fa fa-wand-magic-sparkles',  text: 'Gemini AI',        cls: 'text-blue-600 border-blue-200 bg-blue-50' }
  if (src === 'faq_exact')     return { icon: 'fa fa-clipboard-check',      text: 'FAQ Match',         cls: 'text-emerald-700 border-emerald-200 bg-emerald-50' }
  if (src === 'faq_fuzzy')     return { icon: 'fa fa-magnifying-glass',     text: 'Related FAQ',       cls: 'text-amber-700 border-amber-200 bg-amber-50' }
  if (src === 'computed')      return { icon: 'fa fa-calculator',           text: 'Auto-Computed',     cls: 'text-purple-700 border-purple-200 bg-purple-50' }
  if (src === 'human_request') return { icon: 'fa fa-user-tie',             text: 'Escalated to Staff', cls: 'text-rose-600 border-rose-200 bg-rose-50' }
  if (src === 'fallback')      return { icon: 'fa fa-envelope',             text: 'Escalated to Staff',  cls: 'text-rose-600 border-rose-200 bg-rose-50' }
  return null
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
    .replace(/`(.*?)`/g, '<code class="bg-emerald-50 text-emerald-800 text-xs px-1 rounded font-mono">$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/•/g, '&bull;')

  return formatted.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline text-emerald-600 hover:text-emerald-800 break-all font-semibold">$1</a>'
  )
}
</script>

<template>
  <!-- ── ROOT CONTAINER (Fixed at bottom-left) ────────────────────────── -->
  <div class="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-[99990] font-sans pointer-events-none">

    <!-- ── INTRO SPEECH BUBBLE ────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="showIntro && !isOpen"
        class="absolute bottom-[68px] sm:bottom-[72px] left-0 pointer-events-auto filter drop-shadow-lg cursor-pointer group"
        @click="openChat"
      >
        <!-- Speech Bubble Card -->
        <div class="relative bg-white border border-emerald-500/30 text-slate-800 px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 whitespace-nowrap transition-transform duration-200 group-hover:-translate-y-0.5">
          <i class="fa fa-comment-dots text-emerald-600 text-base leading-none"></i>
          <div class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>Hi! Ask me anything about LSU</span>
            <span class="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-semibold hidden sm:inline-block">AI</span>
          </div>
          <button
            type="button"
            class="w-5 h-5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent ml-0.5"
            aria-label="Dismiss message"
            @click.stop="showIntro = false"
          >
            <i class="fa fa-times text-[10px]"></i>
          </button>

          <!-- Speech bubble downward triangle tail pointing to button -->
          <div class="absolute -bottom-1.5 left-5 w-3 h-3 bg-white border-r border-b border-emerald-500/30 rotate-45"></div>
        </div>
      </div>
    </Transition>

    <!-- ── FLOATING ACTION BUTTON (FAB) ─────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-75"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0 scale-75"
    >
      <div v-if="!isOpen" class="relative pointer-events-auto">
        <!-- Soft breathing ambient glow (no murky ping discs!) -->
        <span class="absolute -inset-1 rounded-full bg-emerald-500/25 blur-[3px] animate-pulse"></span>

        <!-- Main circular button -->
        <button
          type="button"
          class="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 border-2 border-white/90 cursor-pointer flex items-center justify-center shadow-[0_8px_25px_rgba(5,150,105,0.45)] hover:scale-105 active:scale-95 transition-all duration-300 group"
          aria-label="Open LSU Animo AI"
          @click="openChat"
        >
          <!-- Seal logo inside button -->
          <img
            :src="LSU_SEAL"
            alt="LSU"
            class="w-9 h-9 object-contain relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
          />

          <!-- Unread notification badge (adapts to 1, 2, or 3+ digits cleanly!) -->
          <span
            v-if="unread > 0"
            class="absolute -top-1 -right-1 z-20 min-w-5 h-5 px-1.5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-md"
          >
            {{ unread > 99 ? '99+' : unread }}
          </span>
        </button>
      </div>
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
        class="pointer-events-auto absolute bottom-0 left-0 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,.25)] flex flex-col border border-emerald-500/20 overflow-hidden relative select-auto"
        :style="boxStyle"
      >
        <!-- ── RESIZE HANDLES ─────────────────────────────────────── -->
        <template v-if="!isMinimized">
          <!-- Top Border Resize Handle -->
          <div
            class="absolute top-0 left-0 right-12 h-2 cursor-ns-resize z-40 hover:bg-emerald-400/20 transition-colors"
            title="Drag to resize height"
            @pointerdown="startResize($event, 'n')"
          ></div>
          <!-- Right Border Resize Handle -->
          <div
            class="absolute top-12 bottom-0 right-0 w-2 cursor-ew-resize z-40 hover:bg-emerald-400/20 transition-colors"
            title="Drag to resize width"
            @pointerdown="startResize($event, 'e')"
          ></div>
          <!-- Top-Right Corner Resize Grip Handle -->
          <div
            class="absolute top-0 right-0 w-7 h-7 cursor-nesw-resize z-50 flex items-center justify-center group"
            title="Drag corner to resize width and height"
            @pointerdown="startResize($event, 'ne')"
          >
            <div class="w-3 h-3 border-t-2 border-r-2 border-white/40 group-hover:border-white transition-all rounded-tr-md group-hover:scale-110"></div>
          </div>
        </template>
        <!-- ── HEADER ───────────────────────────────────────────────── -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 flex-shrink-0 select-none shadow-sm cursor-default"
          @dblclick="toggleMaximize"
        >
          <div class="flex items-center gap-2.5">
            <!-- Avatar with online dot -->
            <div class="relative w-9 h-9 rounded-full bg-white/15 p-1 flex items-center justify-center flex-shrink-0 border border-white/20">
              <img :src="LSU_SEAL" alt="LSU" class="w-7 h-7 object-contain drop-shadow" />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-emerald-800"></span>
            </div>
            <div>
              <div class="text-white text-sm font-black leading-tight text-left flex items-center gap-1.5">
                <span>LSU Animo AI</span>
                <span v-if="isFetching" class="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping" title="Syncing"></span>
              </div>
              <div class="text-emerald-100/90 text-[11px] font-medium flex items-center gap-1">
                <span>La Salle University Assistant</span>
              </div>
            </div>
          </div>

          <!-- Header Action Buttons -->
          <div class="flex items-center gap-1">
            <!-- Reset / New Chat -->
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              title="Reset Chat / New Conversation"
              @click="promptResetChat"
            >
              <i class="fa fa-rotate-right"></i>
            </button>
            <!-- Maximize / Restore -->
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              :title="isMaximized ? 'Restore Size' : 'Maximize Chat'"
              @click="toggleMaximize"
            >
              <i :class="['fa', isMaximized ? 'fa-compress' : 'fa-expand']"></i>
            </button>
            <!-- Update Name & Email -->
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              :title="nameStep ? 'Back to Chat' : 'Update Contact Info'"
              @click="toggleNameStep"
            >
              <i :class="['fa', nameStep ? 'fa-arrow-left' : 'fa-user-edit']"></i>
            </button>
            <!-- Minimize toggle -->
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              :title="isMinimized ? 'Expand' : 'Minimize'"
              @click="toggleMin"
            >
              <i :class="['fa', isMinimized ? 'fa-chevron-up' : 'fa-minus']"></i>
            </button>
            <!-- Close -->
            <button
              type="button"
              class="w-7 h-7 rounded-lg bg-white/15 hover:bg-rose-600 text-white border-0 cursor-pointer flex items-center justify-center text-xs transition-colors"
              title="Close Chat"
              @click="closeChat"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>

        <!-- ── BODY (hidden when minimized) ───────────────────────── -->
        <template v-if="!isMinimized">

          <!-- NAME STEP ─────────────────────────────────────────────── -->
          <div v-if="nameStep" class="flex flex-col items-center gap-3 px-5 py-6 flex-1 bg-white overflow-y-auto">
            <div class="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center p-2 mb-1 shadow-sm">
              <img :src="LSU_SEAL" alt="LSU" class="w-12 h-12 object-contain drop-shadow" />
            </div>
            <div class="text-base font-black text-slate-800 text-center">
              {{ messages.length > 0 ? 'Update Contact Information' : 'Welcome to LSU Animo AI!' }}
            </div>
            <p class="text-xs text-slate-600 text-center max-w-xs m-0">
              {{ messages.length > 0 ? 'Update your name and email so our team can follow up.' : 'Before we start, may we know who we\'re talking to? (Optional)' }}
            </p>
            <input
              v-model="visitorName"
              class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-800 bg-white"
              placeholder="Your name"
              maxlength="80"
              @keydown.enter="startSession"
            />
            <input
              v-model="visitorEmail"
              type="email"
              class="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-800 bg-white"
              placeholder="Email address (for official follow-ups)"
              maxlength="120"
              @keydown.enter="startSession"
            />
            <div class="flex gap-2 w-full mt-2">
              <button
                type="button"
                class="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity border-0 cursor-pointer shadow-md"
                @click="startSession"
              >
                <i :class="['fa', messages.length > 0 ? 'fa-check' : 'fa-comments']"></i>
                {{ messages.length > 0 ? 'Save & Return' : 'Start Chat' }}
              </button>
              <button
                type="button"
                class="px-4 py-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 cursor-pointer transition-colors"
                @click="messages.length > 0 ? (nameStep = false) : skipNameStep()"
              >
                {{ messages.length > 0 ? 'Back' : 'Skip' }}
              </button>
            </div>

            <!-- Reset Chat Link (When in Update Contact screen and active conversation exists) -->
            <div v-if="messages.length > 0" class="w-full pt-3 mt-1 border-t border-slate-100 flex flex-col items-center">
              <button
                type="button"
                class="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer border-0 bg-transparent"
                @click="promptResetChat"
              >
                <i class="fa fa-rotate-right"></i>
                Reset Chat & Start Over
              </button>
            </div>
          </div>

          <!-- CHAT MESSAGES ────────────────────────────────────────── -->
          <div
            v-else
            ref="chatBodyRef"
            class="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 bg-slate-50/70 scroll-smooth min-h-[280px]"
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
                <i v-else class="fa fa-user-circle text-white text-sm"></i>
              </div>

              <!-- Message Bubble -->
              <div
                :class="[
                  'max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed relative text-left shadow-xs',
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white rounded-br-sm shadow-[0_2px_8px_rgba(5,150,105,0.25)]'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-sm'
                ]"
              >
                <!-- Staff badge -->
                <div v-if="msg.sender === 'human'" class="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1 border-b border-emerald-100 pb-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  LSU Support Staff
                </div>

                <!-- Typing indicator -->
                <div v-if="msg.typing" class="flex gap-1.5 items-center py-1 px-1">
                  <span class="w-2 h-2 bg-emerald-600/60 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                  <span class="w-2 h-2 bg-emerald-600/60 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                  <span class="w-2 h-2 bg-emerald-600/60 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                </div>

                <!-- Text content -->
                <div v-else class="break-words" v-html="renderText(msg.text)"></div>

                <!-- Escalated notice -->
                <div
                  v-if="msg.escalated"
                  class="flex items-center gap-1.5 mt-2 pt-2 border-t border-sky-100 text-sky-700 text-[11px] font-medium"
                >
                  <i class="fa fa-envelope text-xs text-sky-500"></i>
                  <span>Our staff has been notified and will follow up via email.</span>
                </div>

                <!-- AI Source badge -->
                <div
                  v-if="msg.sender === 'bot' && !msg.typing && sourceLabel(msg.source)"
                  :class="['inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border', sourceLabel(msg.source).cls]"
                >
                  <i :class="[sourceLabel(msg.source).icon, 'text-[10px]']"></i>
                  <span>{{ sourceLabel(msg.source).text }}</span>
                </div>

                <!-- Time -->
                <div
                  v-if="msg.time"
                  :class="['text-[10px] mt-1 text-right', msg.sender === 'user' ? 'text-emerald-100/80' : 'text-slate-400']"
                >{{ msg.time }}</div>
              </div>
            </div>

            <!-- Quick reply chips — shown after first bot message only -->
            <div
              v-if="messages.length === 1 && messages[0].sender === 'bot'"
              class="flex flex-wrap gap-1.5 mt-2"
            >
              <button
                v-for="qr in quickReplies"
                :key="qr.label"
                type="button"
                class="px-3 py-1.5 rounded-full border border-emerald-500/40 bg-white text-emerald-800 text-xs font-semibold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 group"
                @click="sendQuick(qr.label)"
              >
                <i :class="[qr.icon, 'text-xs transition-colors group-hover:text-white']"></i>
                <span>{{ qr.label }}</span>
              </button>
            </div>
          </div>

          <!-- ── MAIN MENU PANEL ──────────────────────────────────── -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div v-if="showMenu && !nameStep" class="flex-shrink-0 border-t border-emerald-500/30 bg-white shadow-[0_-8px_24px_rgba(0,0,0,.08)]">
              <!-- Panel header -->
              <div class="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <img :src="LSU_SEAL" alt="LSU" class="w-6 h-6 object-contain flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-emerald-900">Explore Topics</div>
                  <div class="text-[10px] text-slate-500">Instant answers to frequently asked questions</div>
                </div>
                <button
                  type="button"
                  class="w-6 h-6 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-0 cursor-pointer flex items-center justify-center text-xs transition-colors flex-shrink-0"
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
                  class="flex items-center justify-between px-4 py-2.5 border-0 border-b border-slate-100 last:border-b-0 bg-transparent hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-medium text-left cursor-pointer transition-colors w-full group"
                  @click="sendQuick(qr.label)"
                >
                  <span class="flex items-center gap-2.5">
                    <i :class="[qr.icon, 'text-xs w-4 text-center text-slate-400 group-hover:text-emerald-700 transition-colors']"></i>
                    <span>{{ qr.label }}</span>
                  </span>
                  <i class="fa fa-chevron-right text-[10px] text-slate-400 group-hover:text-emerald-600 transition-colors"></i>
                </button>
                <!-- Reset Chat from menu -->
                <button
                  type="button"
                  class="flex items-center justify-between px-4 py-2.5 border-0 border-t border-slate-100 bg-slate-50/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold text-left cursor-pointer transition-colors w-full"
                  @click="promptResetChat"
                >
                  <span class="flex items-center gap-2">
                    <i class="fa fa-rotate-right text-xs text-slate-400"></i>
                    <span>Reset Chat / New Conversation</span>
                  </span>
                  <i class="fa fa-chevron-right text-[10px] text-slate-400"></i>
                </button>
              </div>
            </div>
          </Transition>

          <!-- ── INPUT ROW ─────────────────────────────────────────── -->
          <div v-if="!nameStep" class="flex items-end border-t border-slate-200 bg-white flex-shrink-0 relative">
            <!-- Main menu toggle button -->
            <button
              type="button"
              :class="[
                'w-11 self-stretch border-0 border-r border-slate-200 flex items-center justify-center text-base transition-colors flex-shrink-0 cursor-pointer',
                showMenu
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
              ]"
              title="Browse Topics"
              @click="toggleMenu"
            >
              <i class="fa fa-th-large text-sm"></i>
            </button>

            <!-- Textarea + send -->
            <div class="flex items-end gap-2 px-2.5 py-2 flex-1">
              <textarea
                v-model="inputText"
                class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm resize-none outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50/80 focus:bg-white max-h-20 font-sans disabled:opacity-50 text-slate-900 leading-snug"
                placeholder="Ask me anything about LSU…"
                rows="1"
                maxlength="500"
                :disabled="isSending"
                @keydown.enter.exact.prevent="handleEnter"
              ></textarea>
              <button
                type="button"
                :class="[
                  'w-9 h-9 rounded-xl flex items-center justify-center text-sm border-0 transition-all flex-shrink-0 shadow-xs',
                  inputText.trim() && !isSending
                    ? 'bg-gradient-to-br from-emerald-700 to-emerald-600 text-white cursor-pointer hover:opacity-95 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                ]"
                :disabled="!inputText.trim() || isSending"
                @click="sendMessage"
              >
                <i v-if="isSending" class="fa fa-spinner fa-spin"></i>
                <i v-else class="fa fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>

          <!-- ── FOOTER ────────────────────────────────────────────── -->
          <div class="py-1.5 text-center text-[10px] text-slate-400 border-t border-slate-100 bg-white flex-shrink-0 select-none">
            Powered by <strong class="text-emerald-700">NPCC</strong> · La Salle University Ozamiz, Inc.
          </div>

        </template>

        <!-- ── RESET CONFIRMATION MODAL ───────────────────────────── -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showResetConfirm"
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
          >
            <div class="bg-white rounded-2xl p-5 shadow-2xl max-w-[320px] w-full text-center border border-slate-100">
              <div class="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-lg mb-3 shadow-inner">
                <i class="fa fa-rotate-right"></i>
              </div>
              <div class="text-sm font-black text-slate-800">Start New Conversation?</div>
              <p class="text-xs text-slate-500 mt-1.5 mb-4 leading-relaxed">
                This will clear your current conversation history and start a fresh session with LSU Animo AI.
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border-0"
                  @click="cancelResetChat"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="flex-1 py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 rounded-xl transition-all cursor-pointer border-0 shadow-md"
                  @click="confirmResetChat"
                >
                  Reset Chat
                </button>
              </div>
            </div>
          </div>
        </Transition>

      </div>
    </Transition>
  </div>
</template>

<style scoped></style>
