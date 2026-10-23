<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  darkMode: { type: Boolean, default: false },
})

const config = useRuntimeConfig()
const endpoint = config.public.apiUrl

// ─── TABS ─────────────────────────────────────────────────────────────
const activeTab = ref('sessions') // 'sessions' | 'faqs' | 'stats'

// ─── STATS ────────────────────────────────────────────────────────────
const stats = ref(null)
const statsLoading = ref(false)

const fetchStats = async () => {
  statsLoading.value = true
  try {
    stats.value = await $fetch(`${endpoint}/api/lsuanimoaichat/admin/stats/`)
  } catch { stats.value = null }
  finally { statsLoading.value = false }
}

// ─── SESSIONS ─────────────────────────────────────────────────────────
const sessions = ref([])
const sessionsLoading = ref(false)
const sessionsError = ref('')
const sessionSearch = ref('')
const escalatedFilter = ref('')
const sessionPage = ref(1)
const sessionPageSize = ref(25)

const selectedSessionIds = ref([])
const bulkDeletingSessions = ref(false)

// Selected session detail
const detailSession = ref(null)
const detailLoading = ref(false)
const showDetail = ref(false)

const fetchSessions = async () => {
  sessionsLoading.value = true
  sessionsError.value = ''
  try {
    let url = `${endpoint}/api/lsuanimoaichat/admin/sessions/`
    const params = []
    if (escalatedFilter.value !== '') params.push(`escalated=${escalatedFilter.value}`)
    if (sessionSearch.value.trim()) params.push(`search=${encodeURIComponent(sessionSearch.value.trim())}`)
    if (params.length) url += '?' + params.join('&')
    sessions.value = await $fetch(url)
  } catch { sessionsError.value = 'Failed to load sessions.' }
  finally { sessionsLoading.value = false }
}

const filteredSessions = computed(() => sessions.value)
const totalSessionPages = computed(() => Math.max(1, Math.ceil(filteredSessions.value.length / sessionPageSize.value)))
const paginatedSessions = computed(() => {
  const s = (sessionPage.value - 1) * sessionPageSize.value
  return filteredSessions.value.slice(s, s + sessionPageSize.value)
})
const goSessionPage = (n) => { sessionPage.value = Math.min(Math.max(1, n), totalSessionPages.value) }

const openDetail = async (session) => {
  detailLoading.value = true
  showDetail.value = true
  try {
    detailSession.value = await $fetch(`${endpoint}/api/lsuanimoaichat/admin/sessions/${session.id}/`)
  } catch { detailSession.value = null }
  finally { detailLoading.value = false }
}

const deleteSession = async (s) => {
  if (!confirm(`Delete session for ${s.visitor_name || 'Anonymous'}?`)) return
  try {
    await $fetch(`${endpoint}/api/lsuanimoaichat/admin/sessions/${s.id}/`, { method: 'DELETE' })
    sessions.value = sessions.value.filter(x => x.id !== s.id)
    if (showDetail.value && detailSession.value?.id === s.id) showDetail.value = false
  } catch { alert('Failed to delete session.') }
}

const bulkDeleteSessions = async () => {
  if (!selectedSessionIds.value.length || !confirm(`Delete ${selectedSessionIds.value.length} sessions?`)) return
  bulkDeletingSessions.value = true
  try {
    await $fetch(`${endpoint}/api/lsuanimoaichat/admin/sessions/bulk-delete/`, {
      method: 'POST', body: { ids: selectedSessionIds.value },
    })
    sessions.value = sessions.value.filter(s => !selectedSessionIds.value.includes(s.id))
    selectedSessionIds.value = []
  } catch { alert('Bulk delete failed.') }
  finally { bulkDeletingSessions.value = false }
}

const allSessionsSelected = computed(() =>
  paginatedSessions.value.length > 0 &&
  paginatedSessions.value.every(s => selectedSessionIds.value.includes(s.id))
)
const toggleAllSessions = () => {
  if (allSessionsSelected.value)
    selectedSessionIds.value = selectedSessionIds.value.filter(id => !paginatedSessions.value.map(s => s.id).includes(id))
  else
    paginatedSessions.value.forEach(s => { if (!selectedSessionIds.value.includes(s.id)) selectedSessionIds.value.push(s.id) })
}

// ─── FAQs ─────────────────────────────────────────────────────────────
const faqs = ref([])
const faqsLoading = ref(false)
const faqsError = ref('')

const showFaqModal = ref(false)
const faqModalMode = ref('create')
const faqSaving = ref(false)
const faqSaveError = ref('')
const editingFaqId = ref(null)
const selectedFaqIds = ref([])
const bulkDeletingFaqs = ref(false)

const defaultFaqForm = () => ({
  question: '', answer: '', keywords: '', category: 'General', is_active: true, priority: 0,
})
const faqForm = ref(defaultFaqForm())

const fetchFaqs = async () => {
  faqsLoading.value = true
  faqsError.value = ''
  try {
    faqs.value = await $fetch(`${endpoint}/api/lsuanimoaichat/faqs/admin/`)
  } catch { faqsError.value = 'Failed to load FAQs.' }
  finally { faqsLoading.value = false }
}

const openCreateFaq = () => {
  faqForm.value = defaultFaqForm()
  editingFaqId.value = null
  faqModalMode.value = 'create'
  faqSaveError.value = ''
  showFaqModal.value = true
}

const openEditFaq = (faq) => {
  faqForm.value = { ...faq }
  editingFaqId.value = faq.id
  faqModalMode.value = 'edit'
  faqSaveError.value = ''
  showFaqModal.value = true
}

const saveFaq = async () => {
  faqSaving.value = true; faqSaveError.value = ''
  try {
    if (faqModalMode.value === 'create') {
      const res = await $fetch(`${endpoint}/api/lsuanimoaichat/faqs/create/`, { method: 'POST', body: faqForm.value })
      faqs.value.unshift(res)
    } else {
      const res = await $fetch(`${endpoint}/api/lsuanimoaichat/faqs/${editingFaqId.value}/edit/`, { method: 'PUT', body: faqForm.value })
      const idx = faqs.value.findIndex(f => f.id === editingFaqId.value)
      if (idx !== -1) faqs.value[idx] = res
    }
    showFaqModal.value = false
  } catch { faqSaveError.value = 'Failed to save FAQ.' }
  finally { faqSaving.value = false }
}

const deleteFaq = async (faq) => {
  if (!confirm(`Delete FAQ: "${faq.question.slice(0, 60)}"?`)) return
  try {
    await $fetch(`${endpoint}/api/lsuanimoaichat/faqs/${faq.id}/delete/`, { method: 'DELETE' })
    faqs.value = faqs.value.filter(f => f.id !== faq.id)
  } catch { alert('Failed to delete FAQ.') }
}

const bulkDeleteFaqs = async () => {
  if (!selectedFaqIds.value.length || !confirm(`Delete ${selectedFaqIds.value.length} FAQs?`)) return
  bulkDeletingFaqs.value = true
  try {
    await $fetch(`${endpoint}/api/lsuanimoaichat/faqs/bulk-delete/`, { method: 'POST', body: { ids: selectedFaqIds.value } })
    faqs.value = faqs.value.filter(f => !selectedFaqIds.value.includes(f.id))
    selectedFaqIds.value = []
  } catch { alert('Bulk delete failed.') }
  finally { bulkDeletingFaqs.value = false }
}

const toggleFaqActive = async (faq) => {
  try {
    const res = await $fetch(`${endpoint}/api/lsuanimoaichat/faqs/${faq.id}/edit/`, {
      method: 'PUT', body: { is_active: !faq.is_active },
    })
    const idx = faqs.value.findIndex(f => f.id === faq.id)
    if (idx !== -1) faqs.value[idx] = res
  } catch { alert('Failed to toggle FAQ.') }
}

// ─── ADMIN REPLY & REAL-TIME FETCH ──────────────────────────────────
const adminReplyText = ref('')
const replying = ref(false)
let adminPollTimer = null

const sendAdminReply = async () => {
  const text = adminReplyText.value.trim()
  if (!text || !detailSession.value || replying.value) return
  replying.value = true
  try {
    const res = await $fetch(`${endpoint}/api/lsuanimoaichat/admin/sessions/${detailSession.value.id}/reply/`, {
      method: 'POST',
      body: { message: text },
    })
    if (!detailSession.value.messages) detailSession.value.messages = []
    detailSession.value.messages.push(res)
    adminReplyText.value = ''
    fetchStats()
  } catch {
    alert('Failed to send reply.')
  } finally {
    replying.value = false
  }
}

const pollAdminData = async () => {
  if (activeTab.value === 'sessions' && !sessionsLoading.value && !bulkDeletingSessions.value) {
    try {
      let url = `${endpoint}/api/lsuanimoaichat/admin/sessions/`
      const params = []
      if (escalatedFilter.value !== '') params.push(`escalated=${escalatedFilter.value}`)
      if (sessionSearch.value.trim()) params.push(`search=${encodeURIComponent(sessionSearch.value.trim())}`)
      if (params.length) url += '?' + params.join('&')
      sessions.value = await $fetch(url)
    } catch {}

    if (showDetail.value && detailSession.value && !detailLoading.value && !replying.value) {
      try {
        const refreshed = await $fetch(`${endpoint}/api/lsuanimoaichat/admin/sessions/${detailSession.value.id}/`)
        if (refreshed && refreshed.messages) {
          detailSession.value = refreshed
        }
      } catch {}
    }
  }
}

// ─── MOUNT & CLEANUP ──────────────────────────────────────────────────
onMounted(() => {
  fetchStats()
  fetchSessions()
  fetchFaqs()
  adminPollTimer = setInterval(pollAdminData, 4000)
})

onUnmounted(() => {
  if (adminPollTimer) clearInterval(adminPollTimer)
})

watch(activeTab, (tab) => {
  if (tab === 'sessions') fetchSessions()
  if (tab === 'faqs') fetchFaqs()
  if (tab === 'stats') fetchStats()
})

// ─── HELPERS ──────────────────────────────────────────────────────────
const senderIcon = (sender) => ({ user: 'fa-user', bot: 'fa-robot', human: 'fa-headset' }[sender] || 'fa-circle')
const senderColor = (sender) => ({ user: 'clr-user', bot: 'clr-bot', human: 'clr-human' }[sender] || '')
</script>

<template>
  <div class="ai-wrap" :class="darkMode ? 'dark-mode' : 'light-mode'">

    <!-- ─── HEADER ─────────────────────────────── -->
    <div class="ai-header">
      <div class="ai-title-area">
        <div class="ai-icon-box">
          <i class="fa fa-comments"></i>
        </div>
        <div>
          <h1 class="ai-title">LSU Animo AI</h1>
          <p class="ai-subtitle">Chat management, FAQ editor &amp; session analytics</p>
        </div>
      </div>
      <div class="ai-header-actions">
        <button class="btn-refresh" @click="fetchStats(); fetchSessions(); fetchFaqs()">
          <i class="fa fa-refresh"></i> Refresh
        </button>
      </div>
    </div>

    <!-- ─── STATS ROW ─────────────────────────── -->
    <div v-if="stats" class="ai-stats">
      <div class="ai-stat-card stat-total">
        <div class="scard-icon"><i class="fa fa-comments"></i></div>
        <div><div class="scard-num">{{ stats.total_sessions }}</div><div class="scard-label">Total Sessions</div></div>
      </div>
      <div class="ai-stat-card stat-auto">
        <div class="scard-icon"><i class="fa fa-robot"></i></div>
        <div><div class="scard-num">{{ stats.automated_sessions }}</div><div class="scard-label">Auto-resolved</div></div>
      </div>
      <div class="ai-stat-card stat-esc">
        <div class="scard-icon"><i class="fa fa-envelope"></i></div>
        <div><div class="scard-num">{{ stats.escalated_sessions }}</div><div class="scard-label">Escalated</div></div>
      </div>
      <div class="ai-stat-card stat-msg">
        <div class="scard-icon"><i class="fa fa-comment"></i></div>
        <div><div class="scard-num">{{ stats.total_messages }}</div><div class="scard-label">Messages</div></div>
      </div>
      <div class="ai-stat-card stat-faq">
        <div class="scard-icon"><i class="fa fa-question-circle"></i></div>
        <div><div class="scard-num">{{ stats.active_faqs }}</div><div class="scard-label">Active FAQs</div></div>
      </div>
    </div>

    <!-- ─── TABS ──────────────────────────────── -->
    <div class="tab-bar">
      <button :class="['tab-btn', activeTab === 'sessions' ? 'tab-active' : '']" @click="activeTab = 'sessions'">
        <i class="fa fa-comments"></i> Chat Sessions
        <span class="tab-badge">{{ sessions.length }}</span>
      </button>
      <button :class="['tab-btn', activeTab === 'faqs' ? 'tab-active' : '']" @click="activeTab = 'faqs'">
        <i class="fa fa-question-circle"></i> FAQ Manager
        <span class="tab-badge">{{ faqs.length }}</span>
      </button>
    </div>

    <!-- ════════════════════════════════════════ -->
    <!-- TAB: CHAT SESSIONS                      -->
    <!-- ════════════════════════════════════════ -->
    <div v-if="activeTab === 'sessions'" class="tab-content">

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <i class="fa fa-search search-ico"></i>
          <input v-model="sessionSearch" class="ai-input" placeholder="Search by name, email, session ID…" @input="sessionPage=1; fetchSessions()" />
        </div>
        <select v-model="escalatedFilter" class="ai-select" @change="sessionPage=1; fetchSessions()">
          <option value="">All sessions</option>
          <option value="1">Escalated only</option>
          <option value="0">Auto-resolved only</option>
        </select>
        <button v-if="selectedSessionIds.length" class="btn-danger" :disabled="bulkDeletingSessions" @click="bulkDeleteSessions">
          <i class="fa fa-trash"></i> Delete {{ selectedSessionIds.length }}
        </button>
      </div>

      <!-- Loading / Error -->
      <div v-if="sessionsLoading" class="ai-loading"><div class="spinner"></div> Loading sessions…</div>
      <div v-else-if="sessionsError" class="ai-error">{{ sessionsError }}</div>

      <!-- Table + Detail layout -->
      <div v-else class="sessions-layout">
        <!-- Session list -->
        <div :class="['session-list-wrap', showDetail ? 'list-narrow' : '']">
          <table class="ai-table">
            <thead>
              <tr>
                <th><input type="checkbox" :checked="allSessionsSelected" @change="toggleAllSessions" /></th>
                <th>#</th>
                <th>Visitor</th>
                <th>Email</th>
                <th>Status</th>
                <th>Messages</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedSessions.length === 0">
                <td colspan="8" class="empty-row"><i class="fa fa-inbox"></i> No sessions found.</td>
              </tr>
              <tr
                v-for="(s, idx) in paginatedSessions"
                :key="s.id"
                :class="[{ 'row-selected': selectedSessionIds.includes(s.id) }, { 'row-active': detailSession?.id === s.id }]"
                @click="openDetail(s)"
                style="cursor:pointer"
              >
                <td @click.stop><input type="checkbox" :checked="selectedSessionIds.includes(s.id)" @change="selectedSessionIds.includes(s.id) ? selectedSessionIds.splice(selectedSessionIds.indexOf(s.id),1) : selectedSessionIds.push(s.id)" /></td>
                <td class="td-num">{{ (sessionPage-1)*sessionPageSize+idx+1 }}</td>
                <td class="td-bold">{{ s.visitor_name || 'Anonymous' }}</td>
                <td class="td-muted">{{ s.visitor_email || '—' }}</td>
                <td>
                  <span :class="['status-badge', s.escalated_to_human ? 'badge-esc' : 'badge-auto']">
                    {{ s.escalated_to_human ? '📧 Escalated' : '🤖 Auto' }}
                  </span>
                </td>
                <td class="td-center">{{ s.message_count }}</td>
                <td class="td-muted td-date">{{ s.last_activity_formatted }}</td>
                <td @click.stop class="td-actions">
                  <button class="action-btn view-btn" title="View" @click="openDetail(s)"><i class="fa fa-eye"></i></button>
                  <button class="action-btn del-btn" title="Delete" @click="deleteSession(s)"><i class="fa fa-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="ai-pagination">
            <span class="page-info">{{ sessions.length }} session{{ sessions.length !== 1 ? 's' : '' }}</span>
            <div class="page-btns">
              <button class="page-btn" :disabled="sessionPage===1" @click="goSessionPage(1)"><i class="fa fa-angle-double-left"></i></button>
              <button class="page-btn" :disabled="sessionPage===1" @click="goSessionPage(sessionPage-1)"><i class="fa fa-angle-left"></i></button>
              <span class="page-cur">{{ sessionPage }} / {{ totalSessionPages }}</span>
              <button class="page-btn" :disabled="sessionPage===totalSessionPages" @click="goSessionPage(sessionPage+1)"><i class="fa fa-angle-right"></i></button>
              <button class="page-btn" :disabled="sessionPage===totalSessionPages" @click="goSessionPage(totalSessionPages)"><i class="fa fa-angle-double-right"></i></button>
            </div>
          </div>
        </div>

        <!-- Session Detail panel -->
        <transition name="detail-slide">
          <div v-if="showDetail" class="session-detail">
            <div class="detail-header">
              <div class="detail-visitor">
                <div class="detail-avatar"><i class="fa fa-user"></i></div>
                <div>
                  <div class="detail-name">{{ detailSession?.visitor_name || 'Anonymous' }}</div>
                  <div class="detail-email">{{ detailSession?.visitor_email || 'No email' }}</div>
                </div>
              </div>
              <button class="detail-close" @click="showDetail=false"><i class="fa fa-times"></i></button>
            </div>

            <div v-if="detailLoading" class="ai-loading"><div class="spinner"></div></div>

            <div v-else-if="detailSession" class="detail-messages">
              <div v-if="detailSession.escalated_to_human" class="esc-banner">
                <i class="fa fa-envelope"></i>
                Escalated to human team — email sent to marketing.
              </div>

              <div
                v-for="msg in detailSession.messages"
                :key="msg.id"
                :class="['det-msg', `det-${msg.sender}`]"
              >
                <div class="det-msg-meta">
                  <i :class="['fa', senderIcon(msg.sender)]"></i>
                  <span :class="senderColor(msg.sender)">{{ msg.sender }}</span>
                  <span class="det-time">{{ msg.created_at_formatted }}</span>
                </div>
                <div class="det-msg-body">{{ msg.message }}</div>
                <div v-if="msg.faq_matched" class="det-faq-tag">
                  <i class="fa fa-tag"></i> FAQ matched
                </div>
              </div>
            </div>

            <!-- Live Human Staff Reply -->
            <div v-if="detailSession && !detailLoading" class="detail-reply-bar">
              <input
                v-model="adminReplyText"
                class="detail-reply-input"
                placeholder="Type reply as LSU Support..."
                :disabled="replying"
                @keydown.enter="sendAdminReply"
              />
              <button
                class="btn-primary"
                style="padding: 7px 13px; font-size: 12px;"
                :disabled="!adminReplyText.trim() || replying"
                @click="sendAdminReply"
              >
                <i v-if="replying" class="fa fa-spinner fa-spin"></i>
                <i v-else class="fa fa-paper-plane"></i> Reply
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ════════════════════════════════════════ -->
    <!-- TAB: FAQ MANAGER                        -->
    <!-- ════════════════════════════════════════ -->
    <div v-if="activeTab === 'faqs'" class="tab-content">

      <!-- Toolbar -->
      <div class="toolbar">
        <div style="flex:1"></div>
        <button v-if="selectedFaqIds.length" class="btn-danger" :disabled="bulkDeletingFaqs" @click="bulkDeleteFaqs">
          <i class="fa fa-trash"></i> Delete {{ selectedFaqIds.length }}
        </button>
        <button class="btn-primary" @click="openCreateFaq">
          <i class="fa fa-plus"></i> Add FAQ
        </button>
      </div>

      <div v-if="faqsLoading" class="ai-loading"><div class="spinner"></div> Loading FAQs…</div>
      <div v-else-if="faqsError" class="ai-error">{{ faqsError }}</div>

      <div v-else class="ai-table-wrap">
        <table class="ai-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>#</th>
              <th>Question</th>
              <th>Category</th>
              <th>Keywords</th>
              <th>Priority</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="faqs.length === 0">
              <td colspan="8" class="empty-row"><i class="fa fa-question-circle"></i> No FAQs yet. Add one to train the chatbot!</td>
            </tr>
            <tr v-for="(faq, idx) in faqs" :key="faq.id" :class="{ 'row-selected': selectedFaqIds.includes(faq.id) }">
              <td><input type="checkbox" :checked="selectedFaqIds.includes(faq.id)" @change="selectedFaqIds.includes(faq.id) ? selectedFaqIds.splice(selectedFaqIds.indexOf(faq.id),1) : selectedFaqIds.push(faq.id)" /></td>
              <td class="td-num">{{ idx + 1 }}</td>
              <td class="td-bold faq-q">{{ faq.question }}</td>
              <td><span class="cat-badge">{{ faq.category }}</span></td>
              <td class="td-muted faq-kw">{{ faq.keywords || '—' }}</td>
              <td class="td-center">{{ faq.priority }}</td>
              <td class="td-center">
                <button :class="['toggle-btn', faq.is_active ? 'toggle-on' : 'toggle-off']" @click="toggleFaqActive(faq)">
                  {{ faq.is_active ? '✓ On' : '○ Off' }}
                </button>
              </td>
              <td class="td-actions">
                <button class="action-btn edit-btn" @click="openEditFaq(faq)"><i class="fa fa-pencil"></i></button>
                <button class="action-btn del-btn" @click="deleteFaq(faq)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── FAQ MODAL ─────────────────────────── -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showFaqModal" class="modal-overlay" @click.self="showFaqModal=false">
          <div class="modal-box" :class="darkMode ? 'modal-dark' : 'modal-light'">
            <div class="modal-header">
              <div class="modal-title-area">
                <i :class="['fa', faqModalMode==='create' ? 'fa-plus-circle' : 'fa-pencil']"></i>
                {{ faqModalMode === 'create' ? 'Add New FAQ' : 'Edit FAQ' }}
              </div>
              <button class="modal-close" @click="showFaqModal=false"><i class="fa fa-times"></i></button>
            </div>
            <div class="modal-body">
              <div v-if="faqSaveError" class="form-error">{{ faqSaveError }}</div>
              <div class="faq-form">
                <div class="ff-group ff-full">
                  <label>Question / Trigger Phrase <span class="req">*</span></label>
                  <textarea v-model="faqForm.question" class="ff-input" rows="3" placeholder="e.g. What are the tuition fees?"></textarea>
                </div>
                <div class="ff-group ff-full">
                  <label>Answer <span class="req">*</span></label>
                  <textarea v-model="faqForm.answer" class="ff-input" rows="5" placeholder="The bot's response…"></textarea>
                </div>
                <div class="ff-group ff-full">
                  <label>Keywords</label>
                  <input v-model="faqForm.keywords" class="ff-input" placeholder="tuition, fee, payment, cost (comma-separated)" />
                  <span class="ff-hint">Used for fuzzy matching. The more specific, the better.</span>
                </div>
                <div class="ff-group">
                  <label>Category</label>
                  <select v-model="faqForm.category" class="ff-input">
                    <option>General</option>
                    <option>Admissions</option>
                    <option>Enrollment</option>
                    <option>Tuition & Fees</option>
                    <option>Scholarships</option>
                    <option>Academic Calendar</option>
                    <option>Campus Services</option>
                    <option>Contact</option>
                    <option>Other</option>
                  </select>
                </div>
                <div class="ff-group">
                  <label>Priority</label>
                  <input v-model.number="faqForm.priority" type="number" class="ff-input" min="0" max="100" />
                  <span class="ff-hint">Higher = matched first (0–100)</span>
                </div>
                <div class="ff-group">
                  <label class="ff-check-label">
                    <input type="checkbox" v-model="faqForm.is_active" />
                    Active (visible to chatbot)
                  </label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="showFaqModal=false">Cancel</button>
              <button class="btn-primary" :disabled="faqSaving" @click="saveFaq">
                <span v-if="faqSaving"><i class="fa fa-spinner fa-spin"></i> Saving…</span>
                <span v-else><i class="fa fa-save"></i> Save FAQ</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
/* ─── BASE ───────────────────────────────────── */
.ai-wrap { padding: 24px; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
.light-mode { background: #f8fafc; color: #1e293b; }
.dark-mode  { background: #0f172a; color: #e2e8f0; }

/* ─── HEADER ─────────────────────────────────── */
.ai-header { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px; }
.ai-title-area { display:flex;align-items:center;gap:14px; }
.ai-icon-box { width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#166534,#16a34a);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;box-shadow:0 4px 14px rgba(22,163,74,.35); }
.ai-title { font-size:22px;font-weight:700;margin:0;line-height:1.2; }
.ai-subtitle { font-size:12px;color:#64748b;margin:2px 0 0; }
.dark-mode .ai-subtitle { color:#94a3b8; }
.ai-header-actions { display:flex;gap:8px; }

/* ─── STATS ──────────────────────────────────── */
.ai-stats { display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px; }
.ai-stat-card { display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;background:#fff;border:1.5px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.05);flex:1;min-width:130px; }
.dark-mode .ai-stat-card { background:#1e293b;border-color:#334155; }
.scard-icon { width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;flex-shrink:0; }
.stat-total .scard-icon { background:linear-gradient(135deg,#166534,#16a34a); }
.stat-auto  .scard-icon { background:linear-gradient(135deg,#1d4ed8,#3b82f6); }
.stat-esc   .scard-icon { background:linear-gradient(135deg,#b45309,#f59e0b); }
.stat-msg   .scard-icon { background:linear-gradient(135deg,#6d28d9,#8b5cf6); }
.stat-faq   .scard-icon { background:linear-gradient(135deg,#0f766e,#14b8a6); }
.scard-num  { font-size:22px;font-weight:800;line-height:1; }
.scard-label { font-size:11px;color:#64748b;margin-top:2px;font-weight:500; }
.dark-mode .scard-label { color:#94a3b8; }

/* ─── TABS ───────────────────────────────────── */
.tab-bar { display:flex;gap:6px;margin-bottom:18px;border-bottom:2px solid #e2e8f0; }
.dark-mode .tab-bar { border-color:#334155; }
.tab-btn { display:flex;align-items:center;gap:7px;padding:10px 18px;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:600;color:#64748b;border-bottom:3px solid transparent;margin-bottom:-2px;transition:color .2s,border-color .2s; }
.tab-btn:hover { color:#16a34a; }
.tab-active { color:#16a34a !important;border-bottom-color:#16a34a !important; }
.dark-mode .tab-btn { color:#94a3b8; }
.tab-badge { padding:2px 8px;border-radius:100px;background:#e2e8f0;color:#64748b;font-size:11px;font-weight:700; }
.dark-mode .tab-badge { background:#334155;color:#94a3b8; }
.tab-content { padding-top:4px; }

/* ─── TOOLBAR ────────────────────────────────── */
.toolbar { display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px; }
.search-wrap { position:relative;flex:1;min-width:200px; }
.search-ico { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px; }
.ai-input { width:100%;padding:9px 12px 9px 34px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff;outline:none;transition:border-color .2s;box-sizing:border-box; }
.ai-input:focus { border-color:#16a34a; }
.dark-mode .ai-input { background:#1e293b;border-color:#334155;color:#e2e8f0; }
.ai-select { padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff;outline:none; }
.dark-mode .ai-select { background:#1e293b;border-color:#334155;color:#e2e8f0; }

/* ─── BUTTONS ────────────────────────────────── */
.btn-primary { background:linear-gradient(135deg,#166534,#16a34a);color:#fff;border:none;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .2s; }
.btn-primary:hover:not(:disabled) { opacity:.88; }
.btn-primary:disabled { opacity:.5;cursor:not-allowed; }
.btn-danger { background:linear-gradient(135deg,#991b1b,#dc2626);color:#fff;border:none;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .2s; }
.btn-danger:disabled { opacity:.5;cursor:not-allowed; }
.btn-ghost { background:transparent;border:1.5px solid #cbd5e1;color:#64748b;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s; }
.btn-ghost:hover { background:#f1f5f9; }
.dark-mode .btn-ghost { border-color:#334155;color:#94a3b8; }
.btn-refresh { background:transparent;border:1.5px solid #e2e8f0;color:#64748b;padding:9px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .2s; }
.btn-refresh:hover { background:#f0fdf4;border-color:#16a34a;color:#16a34a; }

/* ─── LOADING / ERROR ────────────────────────── */
.ai-loading { display:flex;align-items:center;gap:10px;padding:40px;color:#64748b;justify-content:center; }
.spinner { width:24px;height:24px;border:3px solid #e2e8f0;border-top-color:#16a34a;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }
@keyframes spin { to { transform:rotate(360deg); } }
.ai-error { padding:20px;color:#dc2626;background:#fee2e2;border-radius:12px;font-size:13px; }

/* ─── SESSIONS LAYOUT ────────────────────────── */
.sessions-layout { display:flex;gap:16px; }
.session-list-wrap { flex:1;overflow:hidden; }
.list-narrow { flex:0 0 55%; }

/* ─── TABLE ──────────────────────────────────── */
.ai-table-wrap { overflow-x:auto;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.05); }
.dark-mode .ai-table-wrap { background:#1e293b;border-color:#334155; }
.ai-table { width:100%;border-collapse:collapse;font-size:12.5px; }
.ai-table thead th { padding:11px 13px;background:linear-gradient(135deg,#166534,#16a34a);color:#fff;font-weight:600;text-align:left;white-space:nowrap; }
.ai-table thead th:first-child { border-radius:12px 0 0 0; }
.ai-table thead th:last-child  { border-radius:0 12px 0 0; }
.ai-table tbody tr { border-bottom:1px solid #f1f5f9;transition:background .15s; }
.dark-mode .ai-table tbody tr { border-color:#334155; }
.ai-table tbody tr:hover { background:#f0fdf4; }
.dark-mode .ai-table tbody tr:hover { background:#1a2e1a; }
.ai-table td { padding:9px 13px;vertical-align:middle; }
.row-selected { background:#dcfce7 !important; }
.dark-mode .row-selected { background:#14532d !important; }
.row-active { background:#eff6ff !important; }
.dark-mode .row-active { background:#1e3a5f !important; }
.td-num { width:40px;color:#94a3b8;font-weight:600; }
.td-bold { font-weight:600; }
.td-muted { color:#64748b; }
.dark-mode .td-muted { color:#94a3b8; }
.td-date { font-size:11px;white-space:nowrap; }
.td-center { text-align:center; }
.td-actions { display:flex;gap:5px;align-items:center; }
.empty-row { text-align:center;padding:40px;color:#94a3b8; }
.status-badge { padding:3px 9px;border-radius:100px;font-size:11px;font-weight:600;white-space:nowrap; }
.badge-esc  { background:#fef3c7;color:#92400e; }
.badge-auto { background:#dcfce7;color:#166534; }
.cat-badge  { background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:600; }
.action-btn { width:28px;height:28px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:transform .15s; }
.action-btn:hover { transform:scale(1.1); }
.view-btn { background:#dbeafe;color:#1d4ed8; }
.edit-btn  { background:#fef9c3;color:#854d0e; }
.del-btn   { background:#fee2e2;color:#b91c1c; }
.toggle-btn { padding:3px 9px;border-radius:100px;border:none;cursor:pointer;font-size:11px;font-weight:600;transition:background .2s; }
.toggle-on  { background:#dcfce7;color:#166534; }
.toggle-off { background:#f1f5f9;color:#64748b; }

/* ─── PAGINATION ─────────────────────────────── */
.ai-pagination { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:12px; }
.page-info { font-size:12px;color:#64748b; }
.dark-mode .page-info { color:#94a3b8; }
.page-btns { display:flex;gap:4px;align-items:center; }
.page-btn { width:30px;height:30px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:background .15s; }
.dark-mode .page-btn { background:#1e293b;border-color:#334155;color:#e2e8f0; }
.page-btn:disabled { opacity:.4;cursor:not-allowed; }
.page-btn:hover:not(:disabled) { background:#f0fdf4;border-color:#16a34a; }
.page-cur { font-size:12px;font-weight:600;color:#64748b;padding:0 6px; }

/* ─── SESSION DETAIL ─────────────────────────── */
.session-detail { flex:0 0 42%;background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;max-height:500px; }
.dark-mode .session-detail { background:#1e293b;border-color:#334155; }
.detail-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(135deg,#166534,#16a34a);color:#fff; }
.detail-visitor { display:flex;align-items:center;gap:10px; }
.detail-avatar { width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center; }
.detail-name { font-size:13px;font-weight:700; }
.detail-email { font-size:11px;opacity:.8; }
.detail-close { background:rgba(255,255,255,.2);border:none;color:#fff;width:26px;height:26px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center; }
.detail-messages { flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px; }
.esc-banner { background:#fef3c7;color:#92400e;padding:8px 12px;border-radius:8px;font-size:12px;display:flex;gap:6px;align-items:center; }
.det-msg { padding:8px 10px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0; }
.dark-mode .det-msg { background:#0f172a;border-color:#334155; }
.det-user { border-left:3px solid #16a34a; }
.det-bot  { border-left:3px solid #3b82f6; }
.det-human { border-left:3px solid #f59e0b; }
.det-msg-meta { display:flex;align-items:center;gap:6px;font-size:11px;color:#94a3b8;margin-bottom:4px; }
.clr-user { color:#16a34a; font-weight:600; }
.clr-bot  { color:#3b82f6; font-weight:600; }
.clr-human { color:#f59e0b; font-weight:600; }
.det-time { margin-left:auto;font-size:10px; }
.det-msg-body { font-size:12.5px;line-height:1.5;color:#1e293b; }
.dark-mode .det-msg-body { color:#e2e8f0; }
.det-faq-tag { font-size:10px;color:#16a34a;margin-top:4px;display:flex;align-items:center;gap:4px; }
.detail-slide-enter-active, .detail-slide-leave-active { transition:opacity .25s,transform .25s; }
.detail-slide-enter-from, .detail-slide-leave-to { opacity:0;transform:translateX(20px); }

.detail-reply-bar { display:flex;gap:8px;padding:10px 14px;border-top:1.5px solid #e2e8f0;background:#fff;align-items:center; }
.dark-mode .detail-reply-bar { background:#1e293b;border-color:#334155; }
.detail-reply-input { flex:1;padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12.5px;outline:none;background:#f8fafc; }
.detail-reply-input:focus { border-color:#16a34a;background:#fff; }
.dark-mode .detail-reply-input { background:#0f172a;border-color:#334155;color:#e2e8f0; }

/* ─── FAQ TABLE ──────────────────────────────── */
.faq-q { max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.faq-kw { max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px; }

/* ─── FAQ MODAL ──────────────────────────────── */
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px; }
.modal-box { width:100%;max-width:640px;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;max-height:90vh;overflow:hidden; }
.modal-light { background:#fff;color:#1e293b; }
.modal-dark  { background:#1e293b;color:#e2e8f0; }
.modal-header { padding:16px 20px;background:linear-gradient(135deg,#166534,#16a34a);color:#fff;border-radius:18px 18px 0 0;display:flex;align-items:center;justify-content:space-between; }
.modal-title-area { display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700; }
.modal-close { background:rgba(255,255,255,.2);border:none;color:#fff;width:28px;height:28px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px; }
.modal-body { padding:20px;overflow-y:auto;flex:1; }
.form-error { background:#fee2e2;color:#b91c1c;padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px; }
.faq-form { display:grid;grid-template-columns:repeat(2,1fr);gap:14px; }
.ff-group { display:flex;flex-direction:column;gap:4px; }
.ff-full { grid-column:1/-1; }
.ff-group label { font-size:11.5px;font-weight:600;color:#475569; }
.dark-mode .ff-group label { color:#94a3b8; }
.req { color:#dc2626; }
.ff-input { padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:13px;background:#f8fafc;outline:none;transition:border-color .2s;width:100%;box-sizing:border-box;font-family:inherit; }
.ff-input:focus { border-color:#16a34a;background:#fff; }
.dark-mode .ff-input { background:#0f172a;border-color:#334155;color:#e2e8f0; }
.ff-hint { font-size:11px;color:#94a3b8;margin-top:2px; }
.ff-check-label { display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer; }
.modal-footer { padding:14px 20px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:8px; }
.dark-mode .modal-footer { border-color:#334155; }
.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity .25s,transform .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity:0;transform:scale(.97); }
</style>
