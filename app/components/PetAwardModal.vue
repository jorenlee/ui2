<template>
  <Teleport to="body">
    <div class="pet-award-backdrop" @click.self="close">
      <section ref="dialog" class="pet-award-dialog" role="dialog" aria-modal="true" aria-labelledby="pet-award-title" tabindex="-1" @keydown.esc.stop.prevent="close">
        <header><h2 id="pet-award-title">Pet Run winner details</h2><button type="button" aria-label="Close Pet winner details" :disabled="saving" @click="close">×</button></header>
        <p>Assign a confirmed 1KM participant. Winner details are shared with all admins.</p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button v-if="conflict" type="button" :disabled="saving || loading" @click="load">Reload latest award details</button>
        <p v-if="loading" role="status">Loading Pet Run participants…</p>
        <form v-else @submit.prevent="save()">
          <label>Award
            <select v-model="chosenAward" aria-label="Award" :disabled="!!awardId || saving" @change="chooseAward">
              <option v-for="item in awards" :key="item.award_id" :value="item.award_id">{{ item.label }}</option>
            </select>
          </label>
          <p v-if="current?.runner && current.runner.id !== selected?.id" class="replacement">Currently awarded to {{ current.runner.run_number }} · {{ current.runner.name }}. Saving will replace this awardee.</p>
          <label>Find Pet Run participant
            <input ref="searchInput" v-model="search" :disabled="saving" placeholder="BIB or owner name" autocomplete="off" @input="selected = null" />
          </label>
          <div class="pet-candidates" role="group" aria-label="Confirmed Pet Run participants">
            <button v-for="candidate in matches" :key="candidate.id" type="button" :disabled="saving"
              :aria-pressed="selected?.id === candidate.id" :aria-label="`Select Pet BIB ${candidate.run_number}`" @click="selectRunner(candidate)">
              <strong>{{ candidate.run_number }}</strong> · {{ candidate.name }}<span v-if="candidate.pet_name"> · {{ candidate.pet_name }}</span>
            </button>
            <p v-if="!matches.length">No matching confirmed 1KM participants.</p>
          </div>
          <p v-if="selected" class="selected" role="status">Selected owner: {{ selected.run_number }} · {{ selected.name }}</p>
          <label>Pet name<input v-model="form.pet_name" :disabled="saving" required maxlength="255" /></label>
          <label>Pet type<input v-model="form.pet_type" :disabled="saving" maxlength="100" placeholder="Dog, cat, or other companion" /></label>
          <label>Winner details / notes<textarea v-model="form.notes" :disabled="saving" maxlength="2000" rows="4" placeholder="Costume, special recognition, or other winner details"></textarea></label>
          <p class="hint">Pet name and type also update the participant's registration. Finish times and videos are preserved.</p>
          <footer>
            <button type="button" :disabled="saving" @click="close">Cancel</button>
            <button type="submit" class="primary" :disabled="saving || !selected || !form.pet_name.trim() || conflict || !token">{{ saving ? 'Saving…' : 'Save Pet winner' }}</button>
          </footer>
          <div v-if="current?.runner" class="remove">
            <button v-if="!confirmRemoval" type="button" :disabled="saving || conflict" @click="confirmRemoval = true">Remove award assignment</button>
            <template v-else><p>Remove this award's winner? Registration and finish records will be kept.</p><button type="button" :disabled="saving" @click="save(true)">Confirm removal</button><button type="button" :disabled="saving" @click="confirmRemoval = false">Keep winner</button></template>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
const props = defineProps({
  apiUrl: { type: String, required: true }, token: { type: String, default: '' },
  awardId: { type: String, default: '' }, runner: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])
const dialog = ref(null), searchInput = ref(null), loading = ref(true), saving = ref(false), error = ref('')
const awards = ref({}), runners = ref([]), chosenAward = ref(props.awardId || 'cutest')
const search = ref(''), selected = ref(null), conflict = ref(false), confirmRemoval = ref(false)
const form = ref({ pet_name: '', pet_type: '', notes: '' })
const current = computed(() => awards.value[chosenAward.value])
const matches = computed(() => {
  const query = search.value.trim().toLowerCase()
  return runners.value.filter(runner => `${runner.run_number} ${runner.name} ${runner.pet_name}`.toLowerCase().includes(query)).slice(0, 30)
})
let activeElement, previousOverflow, disposed = false
function close() { if (!saving.value) emit('close') }
function selectRunner(runner) {
  selected.value = runner
  form.value.pet_name = runner.pet_name || ''
  form.value.pet_type = runner.pet_type || ''
}
function chooseAward() {
  confirmRemoval.value = false
  const winner = props.runner || current.value?.runner
  const candidate = winner && runners.value.find(item => item.id === winner.id)
  selected.value = null
  form.value = { pet_name: '', pet_type: '', notes: '' }
  if (candidate) selectRunner(candidate)
  if (!props.runner || props.runner.id === current.value?.runner?.id) form.value.notes = current.value?.notes || ''
}
async function load() {
  loading.value = true; error.value = ''; conflict.value = false
  try {
    const response = await fetch(`${props.apiUrl}/api/animorun/rankings/pet-awards/?include_runners=1`, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok || !data.awards || !Array.isArray(data.runners)) throw new Error(data.error || 'Pet winner details could not be loaded.')
    if (disposed) return
    awards.value = data.awards; runners.value = data.runners
    chooseAward()
  } catch (err) { if (!disposed) error.value = err.message || 'Unable to load Pet winner details.' }
  finally { loading.value = false }
  await nextTick(); searchInput.value?.focus()
}
async function save(clear = false) {
  if (saving.value || conflict.value || !current.value) return
  if (!props.token) { error.value = 'Sign in as an Emerald Run admin before saving.'; return }
  if (!clear && (!selected.value || !form.value.pet_name.trim())) return
  saving.value = true; error.value = ''
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(`${props.apiUrl}/api/animorun/rankings/pet-awards/`, {
      method: clear ? 'DELETE' : 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${props.token}` },
      body: JSON.stringify({ award_id: chosenAward.value, revision: current.value.revision,
        ...(!clear ? { runner_id: selected.value.id, ...form.value } : {}) }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 409) conflict.value = true
    if (!response.ok || !data.success) throw new Error(data.error || data.detail || 'Pet winner details were not saved. Try again.')
    emit('saved', data)
  } catch (err) { error.value = err.name === 'AbortError' ? 'Saving timed out. Reload the latest award details before retrying.' : err.message }
  finally { clearTimeout(timeout); saving.value = false }
}
function trapFocus(event) {
  if (event.key !== 'Tab') return
  const items = [...dialog.value.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')]
  const first = items[0], last = items.at(-1)
  if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.value)) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
onMounted(() => {
  activeElement = document.activeElement; previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'
  dialog.value.focus(); dialog.value.addEventListener('keydown', trapFocus); load()
})
onUnmounted(() => { disposed = true; dialog.value?.removeEventListener('keydown', trapFocus); document.body.style.overflow = previousOverflow; activeElement?.focus() })
</script>

<style scoped>
.pet-award-backdrop { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; background: #000c; }
.pet-award-dialog { box-sizing: border-box; width: 100%; max-width: 600px; max-height: calc(100dvh - 32px); overflow-y: auto; padding: 24px; border: 1px solid #2d9f98; border-radius: 20px; background: #071013; color: #f3f4f6; font: 14px/1.5 system-ui, sans-serif; }
.pet-award-dialog header, .pet-award-dialog footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.pet-award-dialog h2 { font-size: 20px; font-weight: 800; margin: 0; }
.pet-award-dialog p { margin: 10px 0; }
.pet-award-dialog form, .pet-award-dialog label { display: grid; gap: 8px; }
.pet-award-dialog form { gap: 14px; margin-top: 16px; }
.pet-award-dialog label { font-weight: 650; }
.pet-award-dialog button, .pet-award-dialog input, .pet-award-dialog select, .pet-award-dialog textarea { box-sizing: border-box; min-height: 44px; border-radius: 8px; border: 1px solid #475569; background: #111e28; color: #f3f4f6; padding: 10px 12px; font: inherit; }
.pet-award-dialog input, .pet-award-dialog select, .pet-award-dialog textarea { width: 100%; min-width: 0; }
.pet-award-dialog button { cursor: pointer; }
.pet-award-dialog button:disabled { opacity: .45; cursor: default; }
.pet-award-dialog button:focus-visible, .pet-award-dialog input:focus-visible, .pet-award-dialog select:focus-visible, .pet-award-dialog textarea:focus-visible { outline: 2px solid #6ee7b7; outline-offset: 2px; }
.pet-award-dialog button.primary { background: #047857; border-color: #34d399; font-weight: 700; }
.pet-candidates { display: grid; gap: 6px; max-height: 160px; overflow-y: auto; }
.pet-candidates button { text-align: left; }
.pet-candidates button[aria-pressed=true] { border-color: #34d399; background: #064e3b; }
.selected { color: #6ee7b7; }
.hint { font-size: 12px; color: #a7bdc4; }
.error, .replacement { color: #fda4af; }
.remove { padding-top: 12px; border-top: 1px solid #334155; font-size: 12px; }
.remove button { margin-right: 8px; }
@media (max-width: 420px) { .pet-award-dialog { padding: 16px; } .pet-award-dialog footer { flex-wrap: wrap; } }
</style>
