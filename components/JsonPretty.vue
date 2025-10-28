<template>
  <div class="json-app" :class="{ 'has-error': errorMessage }">
    <div class="json-panels">
      <!-- INPUT PANEL -->
      <div class="panel input-panel" @click="focusFirstInputLineIfEmpty">
        <div class="panel-header">
          <h3>JSON Input</h3>
          <div class="actions">
            <button @click="toggleInputFind" title="Find (Ctrl/Cmd+F)">🔍</button>
            <button @click="triggerFileUpload" title="Upload File">📁</button>
            <button @click="clearInput" title="Clear Input">🧹</button>
          </div>
        </div>
        <div v-if="showInputFind" class="find-box">
          <input
            ref="inputFindInput"
            v-model="inputFindTerm"
            @input="performInputSearch"
            @keydown.enter="nextInputMatch"
            @keydown.esc="showInputFind = false"
            type="text"
            placeholder="Find in input..."
            class="find-input"
          />
          <span class="match-counter">{{ inputMatchInfo }}</span>
          <button @click="prevInputMatch" :disabled="inputMatches.length === 0" title="Previous (Shift+Enter)">▲</button>
          <button @click="nextInputMatch" :disabled="inputMatches.length === 0" title="Next (Enter)">▼</button>
          <button @click="showInputFind = false" title="Close (Esc)">✕</button>
        </div>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          accept=".json,.txt"
          style="display: none;"
        />
        <div class="code-wrapper scroll-sync" ref="inputWrapper" @scroll="syncScroll">
          <div class="line-numbers" ref="inputLineNumbers">
            <span
                v-for="(_, i) in inputLinesList"
                :key="'in-ln-' + i"
                class="line-number"
            >
              {{ i + 1 }}
              <span v-if="i === inputErrorLineIndex" style="color: red;"> ←</span>
            </span>
          </div>
          <pre
              class="json-editor-content"
              ref="inputContent"
              contenteditable="true"
              @input="onInputEdit"
              @keydown="handleInputKeydown"
              spellcheck="false"
          ></pre>
        </div>
      </div>

      <!-- OUTPUT PANEL -->
      <div
          class="panel output-panel"
          :class="[{ fullscreen: isFullscreen }, { disabled: !isInputValid || rawJson.trim() === '' }]"
          :title="!isInputValid || rawJson.trim() === '' ? 'Output panel is disabled due to JSON errors or empty input' : ''"
      >
        <div class="panel-header">
          <h3>Formatted Output</h3>
          <div class="actions">
            <button @click="toggleOutputFind" title="Find (Ctrl/Cmd+F)" :disabled="!isInputValid || rawJson.trim() === ''">🔍</button>
            <button @click="copyJson" title="Copy" :disabled="!isInputValid || rawJson.trim() === ''">📋</button>
            <button @click="downloadJson" title="Download as .txt" :disabled="!isInputValid || rawJson.trim() === ''">💾</button>
            <button @click="toggleFullscreen" title="Fullscreen" :disabled="!isInputValid || rawJson.trim() === ''">🖥️</button>
          </div>
        </div>
        <div v-if="showOutputFind" class="find-box">
          <input
            ref="outputFindInput"
            v-model="outputFindTerm"
            @input="performOutputSearch"
            @keydown.enter="nextOutputMatch"
            @keydown.esc="showOutputFind = false"
            type="text"
            placeholder="Find in output..."
            class="find-input"
          />
          <span class="match-counter">{{ outputMatchInfo }}</span>
          <button @click="prevOutputMatch" :disabled="outputMatches.length === 0" title="Previous (Shift+Enter)">▲</button>
          <button @click="nextOutputMatch" :disabled="outputMatches.length === 0" title="Next (Enter)">▼</button>
          <button @click="showOutputFind = false" title="Close (Esc)">✕</button>
        </div>
        <div class="code-wrapper scroll-sync" ref="outputWrapper" @scroll="syncScroll">
          <div class="line-numbers" ref="outputLineNumbers">
            <span
                v-for="(_, i) in outputLinesList"
                :key="'out-ln-' + i"
                class="line-number"
            >
              {{ i + 1 }}
              <span v-if="i === outputErrorLineIndex" style="color: red;"> ←</span>
            </span>
          </div>
          <pre
              class="json-editor-content"
              ref="outputContent"
              contenteditable="true"
              @input="updateOutputContent"
              @keydown="handleOutputKeydown"
              spellcheck="false"
          ></pre>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="error" @click="scrollToErrorLine" style="cursor: pointer;" title="Click to jump to error line">
      <pre>{{ errorMessage }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const rawJson = ref('')
const prettyJson = ref('')
const errorMessage = ref('')
const inputErrorLineIndex = ref(null)
const outputErrorLineIndex = ref(null)
const isFullscreen = ref(false)

const inputWrapper = ref(null)
const outputWrapper = ref(null)
const inputContent = ref(null)
const outputContent = ref(null)
const inputLineNumbers = ref(null)
const outputLineNumbers = ref(null)
const fileInput = ref(null)

// Find functionality state
const showInputFind = ref(false)
const showOutputFind = ref(false)
const inputFindTerm = ref('')
const outputFindTerm = ref('')
const inputFindInput = ref(null)
const outputFindInput = ref(null)
const inputMatches = ref([])
const outputMatches = ref([])
const inputCurrentMatchIndex = ref(0)
const outputCurrentMatchIndex = ref(0)

const inputLinesList = computed(() => rawJson.value.split('\n'))
const outputLinesList = computed(() => prettyJson.value.split('\n'))
const isInputValid = computed(() => errorMessage.value === '')

const inputMatchInfo = computed(() => {
  if (!inputFindTerm.value) return ''
  if (inputMatches.value.length === 0) return 'No matches'
  return `${inputCurrentMatchIndex.value + 1} of ${inputMatches.value.length}`
})

const outputMatchInfo = computed(() => {
  if (!outputFindTerm.value) return ''
  if (outputMatches.value.length === 0) return 'No matches'
  return `${outputCurrentMatchIndex.value + 1} of ${outputMatches.value.length}`
})

// Clear input and output
function clearInput() {
  rawJson.value = ''
  prettyJson.value = ''
  errorMessage.value = ''
  inputErrorLineIndex.value = null
  outputErrorLineIndex.value = null

  // Clear the input content element
  if (inputContent.value) {
    inputContent.value.innerHTML = ''
  }
  if (outputContent.value) {
    outputContent.value.innerHTML = ''
  }
}

// File upload functionality
function triggerFileUpload() {
  fileInput.value?.click()
}

function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = (e) => {
    const content = e.target?.result
    if (typeof content === 'string') {
      // Set the raw JSON value
      rawJson.value = content

      // Manually update the input content with highlighting
      if (inputContent.value) {
        applyHighlighting(inputContent.value, content)
      }

      // Trigger prettification after a short delay
      setTimeout(() => {
        prettifyRawJson()
      }, 100)
    }
  }

  reader.onerror = () => {
    alert('Error reading file. Please try again.')
  }

  reader.readAsText(file)

  // Reset file input so the same file can be uploaded again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Cross-browser error position detection
function findErrorPosition(jsonText, error) {
  // Chrome/Edge: "Unexpected token X in JSON at position 123"
  const chromeMatch = error.message.match(/position\s+(\d+)/i)
  if (chromeMatch) {
    return parseInt(chromeMatch[1])
  }

  // Firefox: "JSON.parse: unexpected character at line X column Y"
  const firefoxMatch = error.message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (firefoxMatch) {
    const line = parseInt(firefoxMatch[1])
    const col = parseInt(firefoxMatch[2])
    const lines = jsonText.split('\n')
    let pos = 0
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
      pos += lines[i].length + 1 // +1 for newline
    }
    pos += col - 1
    return pos
  }

  // Safari and other browsers: Manual syntax analysis to find error position
  // This scans through the JSON and tracks structure to pinpoint errors

  const stack = [] // Track { [ depths
  let inString = false
  let escapeNext = false
  let expectValue = false // After : or [ or {
  let expectCommaOrClose = false // After a complete value
  let lastValueEndPos = -1

  for (let i = 0; i < jsonText.length; i++) {
    const char = jsonText[i]
    const prevChar = i > 0 ? jsonText[i - 1] : ''

    if (escapeNext) {
      escapeNext = false
      continue
    }

    // Handle strings
    if (inString) {
      if (char === '\\') {
        escapeNext = true
      } else if (char === '"') {
        inString = false
        lastValueEndPos = i
        expectCommaOrClose = true
        expectValue = false
      } else if (char === '\n' || char === '\r') {
        // Unescaped newline in string
        return i - 1
      }
      continue
    }

    // Skip whitespace
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      continue
    }

    // Start of string
    if (char === '"') {
      if (expectCommaOrClose && !expectValue) {
        // Expected comma or closing bracket, got string
        return i
      }
      inString = true
      expectValue = false
      expectCommaOrClose = false
      continue
    }

    // Opening brackets
    if (char === '{' || char === '[') {
      if (expectCommaOrClose && !expectValue) {
        // Expected comma or closing bracket, got opening bracket
        return i
      }
      stack.push({ char, pos: i })
      expectValue = char === '[' // Arrays expect value next
      expectCommaOrClose = false
      continue
    }

    // Closing brackets
    if (char === '}' || char === ']') {
      if (stack.length === 0) {
        // Unmatched closing bracket
        return i
      }
      const last = stack.pop()
      const expectedClose = last.char === '{' ? '}' : ']'
      if (char !== expectedClose) {
        // Mismatched bracket
        return i
      }
      lastValueEndPos = i
      expectValue = false
      expectCommaOrClose = true
      continue
    }

    // Colon (after object key)
    if (char === ':') {
      expectValue = true
      expectCommaOrClose = false
      continue
    }

    // Comma
    if (char === ',') {
      if (!expectCommaOrClose) {
        // Unexpected comma (e.g., leading comma, double comma)
        return i
      }
      expectValue = true
      expectCommaOrClose = false
      continue
    }

    // Number, boolean, null
    if (char === '-' || char === '.' || (char >= '0' && char <= '9') ||
        char === 't' || char === 'f' || char === 'n') {
      if (expectCommaOrClose && !expectValue) {
        // Expected comma or closing bracket, got value
        return i
      }
      // Find the end of this value
      let j = i
      while (j < jsonText.length &&
             /[0-9.eE+\-tfalsenu]/.test(jsonText[j])) {
        j++
      }
      lastValueEndPos = j - 1
      i = j - 1 // Skip ahead
      expectValue = false
      expectCommaOrClose = true
      continue
    }

    // Unexpected character
    return i
  }

  // Check for unclosed structures
  if (inString) {
    return jsonText.length - 1
  }
  if (stack.length > 0) {
    // Unclosed bracket - error at the end or at the last bracket
    return jsonText.length - 1
  }

  // If no specific error found, return the position where JSON ends
  return lastValueEndPos >= 0 ? lastValueEndPos : jsonText.length - 1
}

// JSON prettify and error highlight
function prettifyRawJson() {
  // Save scroll position and caret before prettification
  const savedInputScroll = inputWrapper.value?.scrollTop
  const savedInputScrollLeft = inputWrapper.value?.scrollLeft
  const savedContentScroll = inputContent.value?.scrollTop
  const savedCaret = inputContent.value ? saveCaretPosition(inputContent.value) : null

  try {
    const parsed = JSON.parse(rawJson.value)
    rawJson.value = JSON.stringify(parsed, null, 2)
    prettyJson.value = rawJson.value
    errorMessage.value = ''
    inputErrorLineIndex.value = null
    outputErrorLineIndex.value = null

    // Manually update content with highlighting (no template binding)
    if (inputContent.value) {
      applyHighlighting(inputContent.value, rawJson.value)
      inputContent.value.scrollTop = savedContentScroll
      if (savedCaret) {
        restoreCaretPosition(inputContent.value, savedCaret)
      }
    }
    if (inputWrapper.value) {
      inputWrapper.value.scrollTop = savedInputScroll
      inputWrapper.value.scrollLeft = savedInputScrollLeft
    }
    if (outputContent.value) {
      applyHighlighting(outputContent.value, prettyJson.value)
    }
  } catch (e) {
    const pos = findErrorPosition(rawJson.value, e)
    if (pos !== null) {
      const lines = rawJson.value.substring(0, pos).split('\n')
      inputErrorLineIndex.value = lines.length - 1
      const errorLine = lines.at(-1) || ''
      errorMessage.value = `Input error at line ${lines.length}:\n${errorLine}\n${' '.repeat(errorLine.length)}←\n${e.message}`
    } else {
      // Fallback: show error without line number
      inputErrorLineIndex.value = null
      errorMessage.value = `Input error:\n${e.message}`
    }
    prettyJson.value = ''

    // Restore scroll position even on error
    if (inputWrapper.value) {
      inputWrapper.value.scrollTop = savedInputScroll
      inputWrapper.value.scrollLeft = savedInputScrollLeft
    }
    if (inputContent.value && savedContentScroll !== undefined) {
      inputContent.value.scrollTop = savedContentScroll
    }
  }
}

function scrollToError(wrapperRef, lineIndex) {
  // Scroll to approximate line position
  nextTick(() => {
    if (wrapperRef.value) {
      const lineHeight = 24 // 1.5rem = 24px approximately
      const scrollPosition = lineIndex * lineHeight
      wrapperRef.value.scrollTo({ top: scrollPosition, behavior: 'smooth' })
    }
  })
}

function scrollToErrorLine() {
  // Determine which panel has the error and scroll to it
  if (inputErrorLineIndex.value !== null) {
    // Error in input panel
    const lineHeight = 24 // 1.5rem = 24px approximately
    const scrollPosition = Math.max(0, (inputErrorLineIndex.value - 2) * lineHeight) // Offset by 2 lines for better visibility

    // Focus first (this may scroll to top)
    if (inputContent.value) {
      inputContent.value.focus({ preventScroll: true }) // Prevent automatic scroll on focus
    }

    // Then scroll to the error line - scroll BOTH wrapper and content
    nextTick(() => {
      if (inputWrapper.value) {
        inputWrapper.value.scrollTop = scrollPosition
      }
      if (inputContent.value) {
        inputContent.value.scrollTop = scrollPosition
      }
      if (inputLineNumbers.value) {
        inputLineNumbers.value.scrollTop = scrollPosition
      }
    })
  } else if (outputErrorLineIndex.value !== null) {
    // Error in output panel
    const lineHeight = 24 // 1.5rem = 24px approximately
    const scrollPosition = Math.max(0, (outputErrorLineIndex.value - 2) * lineHeight) // Offset by 2 lines for better visibility

    // Focus first (this may scroll to top)
    if (outputContent.value) {
      outputContent.value.focus({ preventScroll: true }) // Prevent automatic scroll on focus
    }

    // Then scroll to the error line - scroll BOTH wrapper and content
    nextTick(() => {
      if (outputWrapper.value) {
        outputWrapper.value.scrollTop = scrollPosition
      }
      if (outputContent.value) {
        outputContent.value.scrollTop = scrollPosition
      }
      if (outputLineNumbers.value) {
        outputLineNumbers.value.scrollTop = scrollPosition
      }
    })
  }
}

// --- Syntax Highlighting ---
function syntaxHighlight(json) {
  if (!json) return ''

  // Escape HTML to prevent XSS
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Apply syntax highlighting with color classes
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number' // Default: numbers (orange)
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key' // Keys (blue)
      } else {
        cls = 'string' // String values (green)
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean' // Booleans (blue)
    } else if (/null/.test(match)) {
      cls = 'null' // Null (gray)
    }
    return '<span class="' + cls + '">' + match + '</span>'
  })
}

function applyHighlighting(el, text) {
  const highlighted = syntaxHighlight(text)
  if (el.innerHTML !== highlighted) {
    // Save scroll position before changing innerHTML
    const scrollTop = el.scrollTop
    const scrollLeft = el.scrollLeft

    el.innerHTML = highlighted

    // Restore scroll position after innerHTML change
    el.scrollTop = scrollTop
    el.scrollLeft = scrollLeft
  }
}

// --- Caret management utilities ---
let lastSelection = null

function saveCaretPosition(el) {
  const selection = window.getSelection()
  if (!selection.rangeCount) return null
  const range = selection.getRangeAt(0)
  const preRange = range.cloneRange()
  preRange.selectNodeContents(el)
  preRange.setEnd(range.startContainer, range.startOffset)
  const start = preRange.toString().length
  return { start, end: start + range.toString().length }
}

function restoreCaretPosition(el, saved) {
  if (!saved || !el) return
  const range = document.createRange()
  range.setStart(el, 0)
  range.collapse(true)
  const nodeStack = [el]
  let charCount = 0
  let node
  while ((node = nodeStack.pop())) {
    if (node.nodeType === 3) {
      const nextCharCount = charCount + node.length
      if (saved.start >= charCount && saved.start <= nextCharCount)
        range.setStart(node, saved.start - charCount)
      if (saved.end >= charCount && saved.end <= nextCharCount) {
        range.setEnd(node, saved.end - charCount)
        break
      }
      charCount = nextCharCount
    } else {
      let i = node.childNodes.length
      while (i--) nodeStack.push(node.childNodes[i])
    }
  }
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(range)
}

let prettifyTimeout = null
let highlightTimeout = null

function onInputEdit(event) {
  const el = event.target

  // Clear search highlights when editing starts
  if (inputMatches.value.length > 0) {
    inputMatches.value = []
    inputCurrentMatchIndex.value = 0
    inputFindTerm.value = ''
  }

  // Save all positions immediately
  const savedCaret = saveCaretPosition(el)
  const savedWrapperScroll = inputWrapper.value?.scrollTop
  const savedWrapperScrollLeft = inputWrapper.value?.scrollLeft
  const savedElScroll = el.scrollTop
  const savedElScrollLeft = el.scrollLeft

  // Update the reactive value (but it won't update template since we removed binding)
  rawJson.value = el.innerText

  // Apply syntax highlighting immediately for visual feedback
  clearTimeout(highlightTimeout)
  highlightTimeout = setTimeout(() => {
    applyHighlighting(el, el.innerText)

    // Restore all scroll positions immediately after highlighting
    el.scrollTop = savedElScroll
    el.scrollLeft = savedElScrollLeft
    if (inputWrapper.value) {
      inputWrapper.value.scrollTop = savedWrapperScroll
      inputWrapper.value.scrollLeft = savedWrapperScrollLeft
    }

    nextTick(() => restoreCaretPosition(el, savedCaret))
  }, 50)

  // Prettify after longer delay
  clearTimeout(prettifyTimeout)
  prettifyTimeout = setTimeout(() => {
    prettifyRawJson()
  }, 300)
}

// --- Output Editing ---
let outputPrettifyTimeout = null
let outputHighlightTimeout = null

function updateOutputContent(event) {
  const el = event.target

  // Clear search highlights when editing starts
  if (outputMatches.value.length > 0) {
    outputMatches.value = []
    outputCurrentMatchIndex.value = 0
    outputFindTerm.value = ''
  }

  // Save all positions immediately
  const savedCaret = saveCaretPosition(el)
  const savedWrapperScroll = outputWrapper.value?.scrollTop
  const savedWrapperScrollLeft = outputWrapper.value?.scrollLeft
  const savedElScroll = el.scrollTop
  const savedElScrollLeft = el.scrollLeft

  // Update the reactive value (but it won't update template since we removed binding)
  prettyJson.value = el.innerText

  // Apply syntax highlighting immediately for visual feedback
  clearTimeout(outputHighlightTimeout)
  outputHighlightTimeout = setTimeout(() => {
    applyHighlighting(el, el.innerText)

    // Restore all scroll positions immediately after highlighting
    el.scrollTop = savedElScroll
    el.scrollLeft = savedElScrollLeft
    if (outputWrapper.value) {
      outputWrapper.value.scrollTop = savedWrapperScroll
      outputWrapper.value.scrollLeft = savedWrapperScrollLeft
    }

    nextTick(() => restoreCaretPosition(el, savedCaret))
  }, 50)

  // Prettify after longer delay
  clearTimeout(outputPrettifyTimeout)
  outputPrettifyTimeout = setTimeout(() => {
    // Save scroll position and caret before prettification
    const savedOutputScroll = outputWrapper.value?.scrollTop
    const savedOutputScrollLeft = outputWrapper.value?.scrollLeft
    const savedContentScroll = outputContent.value?.scrollTop
    const savedCaretAtPrettify = outputContent.value ? saveCaretPosition(outputContent.value) : null

    try {
      const parsed = JSON.parse(prettyJson.value)
      rawJson.value = JSON.stringify(parsed, null, 2)
      prettyJson.value = rawJson.value
      errorMessage.value = ''
      outputErrorLineIndex.value = null
      inputErrorLineIndex.value = null

      // Manually update content with highlighting (no template binding)
      if (outputContent.value) {
        applyHighlighting(outputContent.value, prettyJson.value)
        outputContent.value.scrollTop = savedContentScroll
        if (savedCaretAtPrettify) {
          restoreCaretPosition(outputContent.value, savedCaretAtPrettify)
        }
      }
      if (outputWrapper.value) {
        outputWrapper.value.scrollTop = savedOutputScroll
        outputWrapper.value.scrollLeft = savedOutputScrollLeft
      }
      if (inputContent.value) {
        applyHighlighting(inputContent.value, rawJson.value)
      }
    } catch (e) {
      const pos = findErrorPosition(prettyJson.value, e)
      if (pos !== null) {
        const lines = prettyJson.value.substring(0, pos).split('\n')
        outputErrorLineIndex.value = lines.length - 1
        const errorLine = lines.at(-1) || ''
        errorMessage.value = `Output error at line ${lines.length}:\n${errorLine}\n${' '.repeat(errorLine.length)}←\n${e.message}`
      } else {
        // Fallback: show error without line number
        outputErrorLineIndex.value = null
        errorMessage.value = `Output error:\n${e.message}`
      }

      // Restore scroll position even on error
      if (outputWrapper.value) {
        outputWrapper.value.scrollTop = savedOutputScroll
        outputWrapper.value.scrollLeft = savedOutputScrollLeft
      }
      if (outputContent.value && savedContentScroll !== undefined) {
        outputContent.value.scrollTop = savedContentScroll
      }
    }
  }, 300)
}

function copyJson() {
  navigator.clipboard.writeText(prettyJson.value).then(() => alert('Copied!'))
}

function downloadJson() {
  // Create a blob with the pretty JSON content
  const blob = new Blob([prettyJson.value], { type: 'text/plain' })

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob)

  // Create a temporary link element and trigger download
  const link = document.createElement('a')
  link.href = url
  link.download = 'formatted-json.txt'
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  nextTick(() => {
    if (outputWrapper.value) outputWrapper.value.scrollTop = 0
  })
}

function syncScroll() {
  const inputScrollTop = inputWrapper.value.scrollTop
  const outputScrollTop = outputWrapper.value.scrollTop
  inputLineNumbers.value.scrollTop = inputScrollTop
  inputContent.value.scrollTop = inputScrollTop
  outputLineNumbers.value.scrollTop = outputScrollTop
  outputContent.value.scrollTop = outputScrollTop
}

// Focus helper
function focusFirstInputLineIfEmpty(event) {
  const isContent = event.target.closest('.json-editor-content')
  const isHeaderOrButton = event.target.closest('.panel-header') || event.target.closest('button')
  if (isContent || isHeaderOrButton) return
  if (!rawJson.value.trim()) {
    nextTick(() => {
      if (inputContent.value) inputContent.value.focus()
    })
  }
}

// Simple keyboard handlers (browser handles navigation naturally now)
function handleInputKeydown(event) {
  // Ctrl/Cmd+F to open find box
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    toggleInputFind()
  }
}

function handleOutputKeydown(event) {
  // Ctrl/Cmd+F to open find box
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    toggleOutputFind()
  }
}

// --- Find functionality ---
function toggleInputFind() {
  showInputFind.value = !showInputFind.value
  if (showInputFind.value) {
    nextTick(() => {
      inputFindInput.value?.focus()
    })
  } else {
    // Clear highlighting when closing
    inputMatches.value = []
    inputFindTerm.value = ''
    if (inputContent.value) {
      applyHighlighting(inputContent.value, rawJson.value)
    }
  }
}

function toggleOutputFind() {
  showOutputFind.value = !showOutputFind.value
  if (showOutputFind.value) {
    nextTick(() => {
      outputFindInput.value?.focus()
    })
  } else {
    // Clear highlighting when closing
    outputMatches.value = []
    outputFindTerm.value = ''
    if (outputContent.value) {
      applyHighlighting(outputContent.value, prettyJson.value)
    }
  }
}

function performInputSearch() {
  if (!inputFindTerm.value) {
    inputMatches.value = []
    inputCurrentMatchIndex.value = 0
    if (inputContent.value) {
      applyHighlighting(inputContent.value, rawJson.value)
    }
    return
  }

  const text = rawJson.value
  const searchTerm = inputFindTerm.value
  const matches = []
  let index = 0

  // Find all matches (case-insensitive)
  while (index < text.length) {
    const foundIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase(), index)
    if (foundIndex === -1) break
    matches.push({ start: foundIndex, end: foundIndex + searchTerm.length })
    index = foundIndex + 1
  }

  inputMatches.value = matches
  inputCurrentMatchIndex.value = matches.length > 0 ? 0 : 0
  highlightInputMatches()
}

function performOutputSearch() {
  if (!outputFindTerm.value) {
    outputMatches.value = []
    outputCurrentMatchIndex.value = 0
    if (outputContent.value) {
      applyHighlighting(outputContent.value, prettyJson.value)
    }
    return
  }

  const text = prettyJson.value
  const searchTerm = outputFindTerm.value
  const matches = []
  let index = 0

  // Find all matches (case-insensitive)
  while (index < text.length) {
    const foundIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase(), index)
    if (foundIndex === -1) break
    matches.push({ start: foundIndex, end: foundIndex + searchTerm.length })
    index = foundIndex + 1
  }

  outputMatches.value = matches
  outputCurrentMatchIndex.value = matches.length > 0 ? 0 : 0
  highlightOutputMatches()
}

function highlightInputMatches() {
  if (!inputContent.value || inputMatches.value.length === 0) {
    applyHighlighting(inputContent.value, rawJson.value)
    return
  }

  const text = rawJson.value
  let result = ''
  let lastIndex = 0

  // Sort matches by start position
  const sortedMatches = [...inputMatches.value].sort((a, b) => a.start - b.start)

  // Build the highlighted string with both syntax highlighting and search matches
  sortedMatches.forEach((match, i) => {
    const isCurrentMatch = i === inputCurrentMatchIndex.value
    const className = isCurrentMatch ? 'find-highlight-current' : 'find-highlight'

    // Add the part before the match with syntax highlighting
    const beforeMatch = text.substring(lastIndex, match.start)
    result += syntaxHighlight(beforeMatch)

    // Add the matched text with both syntax highlighting and search highlight
    const matchText = text.substring(match.start, match.end)
    const highlightedMatchText = syntaxHighlight(matchText)
    result += `<mark class="${className}">${highlightedMatchText}</mark>`

    lastIndex = match.end
  })

  // Add remaining text after last match
  result += syntaxHighlight(text.substring(lastIndex))

  const scrollTop = inputContent.value.scrollTop
  const scrollLeft = inputContent.value.scrollLeft
  inputContent.value.innerHTML = result
  inputContent.value.scrollTop = scrollTop
  inputContent.value.scrollLeft = scrollLeft

  // Scroll to current match
  scrollToInputMatch()
}

function highlightOutputMatches() {
  if (!outputContent.value || outputMatches.value.length === 0) {
    applyHighlighting(outputContent.value, prettyJson.value)
    return
  }

  const text = prettyJson.value
  let result = ''
  let lastIndex = 0

  // Sort matches by start position
  const sortedMatches = [...outputMatches.value].sort((a, b) => a.start - b.start)

  // Build the highlighted string with both syntax highlighting and search matches
  sortedMatches.forEach((match, i) => {
    const isCurrentMatch = i === outputCurrentMatchIndex.value
    const className = isCurrentMatch ? 'find-highlight-current' : 'find-highlight'

    // Add the part before the match with syntax highlighting
    const beforeMatch = text.substring(lastIndex, match.start)
    result += syntaxHighlight(beforeMatch)

    // Add the matched text with both syntax highlighting and search highlight
    const matchText = text.substring(match.start, match.end)
    const highlightedMatchText = syntaxHighlight(matchText)
    result += `<mark class="${className}">${highlightedMatchText}</mark>`

    lastIndex = match.end
  })

  // Add remaining text after last match
  result += syntaxHighlight(text.substring(lastIndex))

  const scrollTop = outputContent.value.scrollTop
  const scrollLeft = outputContent.value.scrollLeft
  outputContent.value.innerHTML = result
  outputContent.value.scrollTop = scrollTop
  outputContent.value.scrollLeft = scrollLeft

  // Scroll to current match
  scrollToOutputMatch()
}

function scrollToInputMatch() {
  if (inputMatches.value.length === 0) return

  const match = inputMatches.value[inputCurrentMatchIndex.value]
  const text = rawJson.value.substring(0, match.start)
  const lines = text.split('\n')
  const lineNumber = lines.length - 1
  const lineHeight = 24 // 1.5rem
  const scrollPosition = Math.max(0, (lineNumber - 2) * lineHeight)

  nextTick(() => {
    if (inputWrapper.value) {
      inputWrapper.value.scrollTop = scrollPosition
    }
  })
}

function scrollToOutputMatch() {
  if (outputMatches.value.length === 0) return

  const match = outputMatches.value[outputCurrentMatchIndex.value]
  const text = prettyJson.value.substring(0, match.start)
  const lines = text.split('\n')
  const lineNumber = lines.length - 1
  const lineHeight = 24 // 1.5rem
  const scrollPosition = Math.max(0, (lineNumber - 2) * lineHeight)

  nextTick(() => {
    if (outputWrapper.value) {
      outputWrapper.value.scrollTop = scrollPosition
    }
  })
}

function nextInputMatch() {
  if (inputMatches.value.length === 0) return
  inputCurrentMatchIndex.value = (inputCurrentMatchIndex.value + 1) % inputMatches.value.length
  highlightInputMatches()
}

function prevInputMatch() {
  if (inputMatches.value.length === 0) return
  inputCurrentMatchIndex.value = inputCurrentMatchIndex.value === 0
    ? inputMatches.value.length - 1
    : inputCurrentMatchIndex.value - 1
  highlightInputMatches()
}

function nextOutputMatch() {
  if (outputMatches.value.length === 0) return
  outputCurrentMatchIndex.value = (outputCurrentMatchIndex.value + 1) % outputMatches.value.length
  highlightOutputMatches()
}

function prevOutputMatch() {
  if (outputMatches.value.length === 0) return
  outputCurrentMatchIndex.value = outputCurrentMatchIndex.value === 0
    ? outputMatches.value.length - 1
    : outputCurrentMatchIndex.value - 1
  highlightOutputMatches()
}

onMounted(() => {
  inputWrapper.value.addEventListener('scroll', () => {
    outputWrapper.value.scrollTop = inputWrapper.value.scrollTop
    syncScroll()
  })
  outputWrapper.value.addEventListener('scroll', () => {
    inputWrapper.value.scrollTop = outputWrapper.value.scrollTop
    syncScroll()
  })

  // Apply initial highlighting
  if (inputContent.value && rawJson.value) {
    applyHighlighting(inputContent.value, rawJson.value)
  }
  if (outputContent.value && prettyJson.value) {
    applyHighlighting(outputContent.value, prettyJson.value)
  }
})

// No watchers needed - we manually update content with highlighting
</script>

<style scoped>
.json-app {
  width: 95%;
  height: 97vh;
  margin: 0 auto;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  flex-direction: column;
}

.json-app.has-error {
  height: 86vh;
}

.json-panels {
  flex: 1;
  display: flex;
  gap: 1rem;
  height: 100%;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd;
}

.panel-header .actions {
  display: flex;
  gap: 0.5rem;
}

.panel-header button {
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.panel-header button:hover:not(:disabled) {
  background: #f9fafb;
}

.panel-header button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.code-wrapper {
  flex: 1;
  display: flex;
  height: 100%;
  overflow: auto;
}

.line-numbers {
  background: #f9fafb;
  color: #6b7280;
  padding: 1rem 0.5rem;
  text-align: right;
  user-select: none;
  flex-shrink: 0;
  overflow: hidden;
  line-height: 1.5rem;
}

.line-number {
  display: block;
  height: 1.5rem;
}

.json-editor-content {
  flex: 1;
  padding: 1rem;
  background: white;
  overflow: auto;
  white-space: pre;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  color: #111827;
  line-height: 1.5rem;
  margin: 0;
  border: none;
  outline: none;
  cursor: text;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  tab-size: 2;
  -moz-tab-size: 2;
}

/* Syntax highlighting colors */
.json-editor-content :deep(.string) {
  color: #10b981; /* Green for string values */
}

.json-editor-content :deep(.number) {
  color: #f59e0b; /* Orange for numbers */
}

.json-editor-content :deep(.boolean) {
  color: #3b82f6; /* Blue for booleans */
}

.json-editor-content :deep(.null) {
  color: #6b7280; /* Gray for null */
}

.json-editor-content :deep(.key) {
  color: #8b5cf6; /* Purple for keys */
}

.error {
  margin-top: 0.5rem;
  background: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  text-align: left;
  white-space: pre-wrap;
  transition: background-color 0.2s, transform 0.1s;
}

.error:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.output-panel.fullscreen {
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  background: white;
  border-radius: 0;
  padding: 0;
}

.scroll-sync {
  display: flex;
  flex: 1;
  height: 100%;
  overflow: auto;
  align-items: flex-start;
}

.output-panel.disabled {
  pointer-events: none;
  opacity: 0.4;
}

/* Find box styles */
.find-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #ddd;
}

.find-input {
  flex: 1;
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: 'Courier New', Courier, monospace;
  outline: none;
}

.find-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.match-counter {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 60px;
  text-align: center;
}

.find-box button {
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.find-box button:hover:not(:disabled) {
  background: #f3f4f6;
}

.find-box button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Find highlighting styles */
.json-editor-content :deep(mark.find-highlight) {
  background-color: #fef08a;
  color: inherit;
  padding: 0;
  border-radius: 2px;
}

.json-editor-content :deep(mark.find-highlight-current) {
  background-color: #fbbf24;
  color: inherit;
  padding: 0;
  border-radius: 2px;
  font-weight: 600;
}
</style>
