/**
 * Web Speech API wrapper for French TTS
 * with graceful degradation
 */

let currentUtterance = null

export function isTTSSupported() {
    return 'speechSynthesis' in window
}

/**
 * Speak a French word/sentence
 * @param {string} text - Text to speak
 * @param {number} rate - Speed (1 = normal, 0.7 = slow)
 * @returns {Promise<void>}
 */
export function speak(text, rate = 1) {
    return new Promise((resolve, reject) => {
        if (!isTTSSupported()) {
            reject(new Error('TTS not supported'))
            return
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'fr-FR'
        utterance.rate = rate
        utterance.pitch = 1

        // Try to find a French voice
        const voices = window.speechSynthesis.getVoices()
        const frenchVoice = voices.find(v => v.lang.startsWith('fr'))
        if (frenchVoice) {
            utterance.voice = frenchVoice
        }

        utterance.onend = () => {
            currentUtterance = null
            resolve()
        }
        utterance.onerror = (e) => {
            currentUtterance = null
            if (e.error !== 'canceled') {
                reject(e)
            } else {
                resolve()
            }
        }

        currentUtterance = utterance
        window.speechSynthesis.speak(utterance)
    })
}

export function stopSpeaking() {
    if (isTTSSupported()) {
        window.speechSynthesis.cancel()
    }
    currentUtterance = null
}

export function isSpeaking() {
    return currentUtterance !== null
}
