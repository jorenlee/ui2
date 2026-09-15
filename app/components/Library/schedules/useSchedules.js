export { normalizeTimeLabel, parseScheduleToEvents, scheduleToForm, formToPayload, parseApiDateToInput }

import moment from 'moment'

/* normalize possible time representations into "HH:mm A - HH:mm A" string or null */
function normalizeTimeLabel(t) {
  if (!t) return null
  if (typeof t === 'string') {
    if (!t.includes('-')) return null
    return t.trim()
  }
  if (typeof t === 'object' && (t.from || t.to || t._12_hour_format_from || t._12_hour_format_to)) {
    const from = t.from || t._12_hour_format_from || null
    const to = t.to || t._12_hour_format_to || null
    if (!from || !to) return null
    return `${from} - ${to}`.trim()
  }
  return null
}

/* convert API schedules array to FullCalendar event objects */
function parseScheduleToEvents(data = []) {
  const ev = []
  data.forEach((s) => {
    const apiDate = s.date
    const date = moment(apiDate, ['MM-DD-YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD')

    const times = Array.isArray(s.time) ? s.time : (s.time ? [s.time] : [])

    if (!times.length) {
      ev.push({
        id: String(s.id),
        title: s.notes || 'Schedule',
        start: date,
        allDay: true,
        extendedProps: { original: s }
      })
      return
    }

    times.forEach((t, idx) => {
      const normalized = normalizeTimeLabel(t)
      if (!normalized) {
        ev.push({
          id: `${s.id}-all-${idx}`,
          title: s.notes || 'Schedule',
          start: date,
          allDay: true,
          extendedProps: { original: s, timeLabel: null }
        })
        return
      }

      const parts = normalized.split(' - ').map(p => p.trim())
      let start = moment(`${date} ${parts[0]}`, ['YYYY-MM-DD h:mm A', 'YYYY-MM-DD HH:mm'])
      let end = parts[1] ? moment(`${date} ${parts[1]}`, ['YYYY-MM-DD h:mm A', 'YYYY-MM-DD HH:mm']) : start.clone().add(1, 'hour')

      if (!start.isValid()) start = moment(`${date} 08:00 AM`)
      if (!end.isValid()) end = start.clone().add(1, 'hour')

      ev.push({
        id: `${s.id}-${idx}`,
        groupId: String(s.id),
        title: s.notes || 'Schedule',
        start: start.toISOString(),
        end: end.toISOString(),
        extendedProps: { original: s, timeLabel: normalized }
      })
    })
  })
  return ev
}

/* prepare a form object for create/edit modal from an API schedule or calendar event */
function scheduleToForm(apiSchedule = {}, calendarEvent = null) {
  const orig = apiSchedule || (calendarEvent?.extendedProps?.original || {})
  const times = Array.isArray(orig.time) ? orig.time.map(normalizeTimeLabel).filter(Boolean)
    : (orig.time ? [normalizeTimeLabel(orig.time)].filter(Boolean) : (calendarEvent?.extendedProps?.timeLabel ? [calendarEvent.extendedProps.timeLabel] : []))

  return {
    id: orig.id ?? calendarEvent?.groupId ?? calendarEvent?.id ?? null,
    date: moment(orig.date ?? calendarEvent?.start).format('YYYY-MM-DD'),
    times,
    notes: orig.notes || calendarEvent?.title || ''
  }
}

/* convert form data to payload for API (date => MM-DD-YYYY, times as-is) */
function formToPayload(form) {
  return {
    date: moment(form.date).format('MM-DD-YYYY'),
    time: form.times,
    notes: form.notes
  }
}

/* helper to parse api date to input value safely */
function parseApiDateToInput(apiDate) {
  if (!apiDate) return ''
  const d = moment(apiDate, ['MM-DD-YYYY', 'YYYY-MM-DD'])
  return d.isValid() ? d.format('YYYY-MM-DD') : ''
}