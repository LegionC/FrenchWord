import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import wordsData from '@/data/words.json'

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

/* ── Store ─────────────────────────────────── */
export const useWordStore = defineStore('words', () => {
  // --- Static word data ---
  const words = ref(wordsData)

  // --- Persisted state ---
  const wordStatus = ref(loadJSON('lv_word_status', {}))
  // { [id]: { status: 'new'|'learning'|'mastered', streak: 0, lastReviewed: null } }

  const quizHistory = ref(loadJSON('lv_quiz_history', []))

  const streakData = ref(loadJSON('lv_streak', { count: 0, lastDate: null }))

  const settings = ref(loadJSON('lv_settings', {
    dailyGoal: 20,
    ttsSpeed: 1,
    quizChoiceRatio: 50, // % of choice questions (rest = spelling)
  }))

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
    return new Date().toISOString().slice(0, 10)
  }

  function recordDailyActivity() {
    const today = todayStr()
    if (streakData.value.lastDate === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)

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
      s => s.lastReviewed && s.lastReviewed.startsWith(today)
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
    Object.assign(settings.value, newSettings)
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
      if (data.wordStatus) wordStatus.value = data.wordStatus
      if (data.quizHistory) quizHistory.value = data.quizHistory
      if (data.streakData) streakData.value = data.streakData
      if (data.settings) Object.assign(settings.value, data.settings)
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
