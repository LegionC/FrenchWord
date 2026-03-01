import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import wordsData from '@/data/words.json'

const DEFAULT_SETTINGS = {
  dailyGoal: 20,
  ttsSpeed: 1,
  quizChoiceRatio: 50, // % of choice questions (rest = spelling)
}

const VALID_STATUS = new Set(['new', 'learning', 'mastered'])

/* ── localStorage helpers ─────────────────── */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function localDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toSafeDateString(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function clampInt(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

function normalizeSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const dailyGoalRaw = clampInt(source.dailyGoal, 5, 50, DEFAULT_SETTINGS.dailyGoal)
  const dailyGoal = Math.min(50, Math.max(5, Math.round(dailyGoalRaw / 5) * 5))
  const ttsSpeed = source.ttsSpeed === 0.7 ? 0.7 : 1
  const ratioRaw = clampInt(source.quizChoiceRatio, 0, 100, DEFAULT_SETTINGS.quizChoiceRatio)
  const quizChoiceRatio = Math.min(100, Math.max(0, Math.round(ratioRaw / 10) * 10))
  return { dailyGoal, ttsSpeed, quizChoiceRatio }
}

function sanitizeWordStatus(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const cleaned = {}
  for (const [id, statusData] of Object.entries(raw)) {
    if (!statusData || typeof statusData !== 'object') continue
    const status = VALID_STATUS.has(statusData.status) ? statusData.status : 'new'
    const streak = Math.max(0, clampInt(statusData.streak, 0, 9999, 0))
    const lastReviewed = toSafeDateString(statusData.lastReviewed)
    cleaned[id] = { status, streak, lastReviewed }
  }
  return cleaned
}

function sanitizeQuizHistory(raw) {
  if (!Array.isArray(raw)) return []
  const cleaned = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const date = toSafeDateString(item.date)
    const total = clampInt(item.total, 1, 1000, null)
    if (!date || total === null) continue

    const scoreNum = Number(item.score)
    const score = Number.isFinite(scoreNum) ? Math.max(0, Math.min(total, scoreNum)) : 0
    const accuracy = clampInt(item.accuracy, 0, 100, 0)
    const timeSeconds = clampInt(item.timeSeconds, 0, 86400, 0)
    const wrongIds = Array.isArray(item.wrongIds)
      ? item.wrongIds.filter(id => typeof id === 'string').slice(0, total)
      : []

    cleaned.push({ date, score, total, accuracy, timeSeconds, wrongIds })
    if (cleaned.length >= 20) break
  }
  return cleaned
}

function sanitizeStreakData(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { count: 0, lastDate: null }
  }
  const count = Math.max(0, clampInt(raw.count, 0, 9999, 0))
  const lastDateValue = raw.lastDate
  let lastDate = null
  if (typeof lastDateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(lastDateValue)) {
    lastDate = lastDateValue
  } else if (typeof lastDateValue === 'string' || typeof lastDateValue === 'number') {
    const parsed = new Date(lastDateValue)
    if (!Number.isNaN(parsed.getTime())) {
      lastDate = localDateKey(parsed)
    }
  }
  return { count, lastDate }
}

function getReviewDay(lastReviewed) {
  if (!lastReviewed) return null
  if (typeof lastReviewed === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) {
    return lastReviewed
  }
  const parsed = new Date(lastReviewed)
  if (Number.isNaN(parsed.getTime())) return null
  return localDateKey(parsed)
}

/* ── Store ─────────────────────────────────── */
export const useWordStore = defineStore('words', () => {
  // --- Static word data ---
  const words = ref(wordsData)

  // --- Persisted state ---
  const wordStatus = ref(sanitizeWordStatus(loadJSON('lv_word_status', {})))
  // { [id]: { status: 'new'|'learning'|'mastered', streak: 0, lastReviewed: null } }

  const quizHistory = ref(sanitizeQuizHistory(loadJSON('lv_quiz_history', [])))

  const streakData = ref(sanitizeStreakData(loadJSON('lv_streak', { count: 0, lastDate: null })))

  const settings = ref(normalizeSettings(loadJSON('lv_settings', DEFAULT_SETTINGS)))

  // --- Storage availability ---
  const storageAvailable = ref(true)

  function persist() {
    const ok1 = saveJSON('lv_word_status', wordStatus.value)
    const ok2 = saveJSON('lv_quiz_history', quizHistory.value)
    const ok3 = saveJSON('lv_streak', streakData.value)
    const ok4 = saveJSON('lv_settings', settings.value)
    storageAvailable.value = ok1 && ok2 && ok3 && ok4
  }

  // --- Themes ---
  const themes = computed(() => {
    const set = new Set(words.value.map(w => w.theme))
    return ['All', ...set]
  })

  // --- Word status helpers ---
  function getStatus(id) {
    return wordStatus.value[id] || { status: 'new', streak: 0, lastReviewed: null }
  }

  function markKnown(id) {
    const cur = getStatus(id)
    const newStreak = cur.streak + 1
    const newStatus = newStreak >= 3 ? 'mastered' : (cur.status === 'new' ? 'learning' : cur.status)
    wordStatus.value[id] = {
      status: newStatus,
      streak: newStreak,
      lastReviewed: new Date().toISOString()
    }
    recordDailyActivity()
    persist()
  }

  function markUnknown(id) {
    wordStatus.value[id] = {
      status: 'learning',
      streak: 0,
      lastReviewed: new Date().toISOString()
    }
    recordDailyActivity()
    persist()
  }

  function markQuizWrong(id) {
    const cur = getStatus(id)
    if (cur.status !== 'mastered') {
      wordStatus.value[id] = { ...cur, status: 'learning', streak: 0 }
      persist()
    }
  }

  // --- Streak ---
  function todayStr() {
    return localDateKey(new Date())
  }

  function recordDailyActivity() {
    const today = todayStr()
    if (streakData.value.lastDate === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = localDateKey(yesterday)

    if (streakData.value.lastDate === yStr) {
      streakData.value.count += 1
    } else if (streakData.value.lastDate !== today) {
      streakData.value.count = 1
    }
    streakData.value.lastDate = today
  }

  // --- Stats computed ---
  const todayReviewed = computed(() => {
    const today = todayStr()
    return Object.values(wordStatus.value).filter(
      s => getReviewDay(s.lastReviewed) === today
    ).length
  })

  const masteredCount = computed(() =>
    Object.values(wordStatus.value).filter(s => s.status === 'mastered').length
  )

  const learningCount = computed(() =>
    Object.values(wordStatus.value).filter(s => s.status === 'learning').length
  )

  const masteryRate = computed(() => {
    if (words.value.length === 0) return 0
    return Math.round((masteredCount.value / words.value.length) * 100)
  })

  const themeMastery = computed(() => {
    const result = {}
    for (const theme of themes.value) {
      if (theme === 'All') continue
      const themeWords = words.value.filter(w => w.theme === theme)
      const mastered = themeWords.filter(w => getStatus(w.id).status === 'mastered').length
      result[theme] = {
        total: themeWords.length,
        mastered,
        rate: themeWords.length > 0 ? Math.round((mastered / themeWords.length) * 100) : 0
      }
    }
    return result
  })

  // --- Quiz history ---
  function addQuizResult(result) {
    quizHistory.value.unshift(result)
    if (quizHistory.value.length > 20) {
      quizHistory.value = quizHistory.value.slice(0, 20)
    }
    recordDailyActivity()
    persist()
  }

  // --- Settings ---
  function updateSettings(newSettings) {
    settings.value = normalizeSettings({ ...settings.value, ...newSettings })
    persist()
  }

  // --- Data management ---
  function resetAllData() {
    wordStatus.value = {}
    quizHistory.value = []
    streakData.value = { count: 0, lastDate: null }
    persist()
  }

  function exportData() {
    return JSON.stringify({
      wordStatus: wordStatus.value,
      quizHistory: quizHistory.value,
      streakData: streakData.value,
      settings: settings.value,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  function importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr)
      if (data.wordStatus !== undefined) {
        wordStatus.value = sanitizeWordStatus(data.wordStatus)
      }
      if (data.quizHistory !== undefined) {
        quizHistory.value = sanitizeQuizHistory(data.quizHistory)
      }
      if (data.streakData !== undefined) {
        streakData.value = sanitizeStreakData(data.streakData)
      }
      if (data.settings !== undefined) {
        settings.value = normalizeSettings({ ...settings.value, ...data.settings })
      }
      persist()
      return true
    } catch {
      return false
    }
  }

  // --- Filter words ---
  function getFilteredWords(theme = 'All', filter = 'all') {
    let list = words.value
    if (theme !== 'All') {
      list = list.filter(w => w.theme === theme)
    }
    if (filter === 'learning') {
      list = list.filter(w => getStatus(w.id).status !== 'mastered')
    }
    return list
  }

  return {
    // State
    words,
    wordStatus,
    quizHistory,
    streakData,
    settings,
    storageAvailable,
    // Computed
    themes,
    todayReviewed,
    masteredCount,
    learningCount,
    masteryRate,
    themeMastery,
    // Actions
    getStatus,
    markKnown,
    markUnknown,
    markQuizWrong,
    addQuizResult,
    updateSettings,
    resetAllData,
    exportData,
    importData,
    getFilteredWords,
  }
})
