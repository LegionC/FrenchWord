/**
 * Quiz question generation utilities
 */

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/**
 * Pick n random items from array (excluding specific ids)
 */
function pickRandom(arr, n, excludeIds = []) {
    const pool = arr.filter(w => !excludeIds.includes(w.id))
    return shuffle(pool).slice(0, n)
}

/**
 * Generate distractors for a choice question
 * Prefers same POS, falls back to any word
 */
export function generateDistractors(word, allWords, count = 3) {
    const samePOS = allWords.filter(w => w.pos === word.pos && w.id !== word.id)
    let distractors = shuffle(samePOS).slice(0, count)

    // Fallback: fill remaining from any word
    if (distractors.length < count) {
        const remaining = count - distractors.length
        const usedIds = [word.id, ...distractors.map(d => d.id)]
        const extras = pickRandom(allWords, remaining, usedIds)
        distractors = [...distractors, ...extras]
    }

    return distractors
}

/**
 * Generate a multiple-choice question
 */
export function generateChoiceQuestion(word, allWords) {
    const distractors = generateDistractors(word, allWords, 3)
    const options = shuffle([
        { id: word.id, en: word.en, correct: true },
        ...distractors.map(d => ({ id: d.id, en: d.en, correct: false }))
    ])

    return {
        type: 'choice',
        word,
        options,
        answered: false,
        selectedId: null,
        correct: null
    }
}

/**
 * Generate a spelling question
 */
export function generateSpellingQuestion(word) {
    return {
        type: 'spelling',
        word,
        hint: word.fr[0], // first letter hint
        hintUsed: false,
        answered: false,
        userAnswer: '',
        correct: null
    }
}

/**
 * Check spelling answer (case-insensitive, accent-sensitive)
 */
export function checkSpelling(userAnswer, correctAnswer) {
    const user = userAnswer.trim().toLowerCase()
    const correct = correctAnswer.trim().toLowerCase()
    return user === correct
}

/**
 * Generate diff between user answer and correct answer
 * Returns array of { char, match } objects
 */
export function diffAnswer(userAnswer, correctAnswer) {
    const user = userAnswer.trim().toLowerCase()
    const correct = correctAnswer.trim().toLowerCase()
    const result = []
    const maxLen = Math.max(user.length, correct.length)

    for (let i = 0; i < maxLen; i++) {
        const uChar = user[i] || ''
        const cChar = correct[i] || ''
        result.push({
            userChar: uChar,
            correctChar: cChar,
            match: uChar === cChar
        })
    }
    return result
}

/**
 * Generate a full quiz session
 * @param {Array} wordPool - words to quiz on
 * @param {number} questionCount - number of questions
 * @param {number} choiceRatio - percentage of choice questions (0-100)
 * @param {Array} allWords - full word list for distractors
 */
export function generateQuiz(wordPool, questionCount, choiceRatio, allWords) {
    const selected = shuffle(wordPool).slice(0, questionCount)
    const choiceCount = Math.round(selected.length * (choiceRatio / 100))

    const questions = selected.map((word, i) => {
        if (i < choiceCount) {
            return generateChoiceQuestion(word, allWords)
        } else {
            return generateSpellingQuestion(word)
        }
    })

    return shuffle(questions) // Mix question types
}
