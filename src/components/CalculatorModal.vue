<template>
  <div v-if="show" class="fixed inset-0 z-[70] flex flex-col justify-end">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-slate-900 rounded-t-3xl w-full flex flex-col">
      <div class="p-6 pb-safe space-y-4">
        <!-- Display -->
        <div class="bg-slate-800 rounded-xl p-4 min-h-[5rem] flex flex-col justify-end items-end overflow-hidden">
          <div class="text-slate-500 text-sm h-5 font-mono">{{ expression || '&nbsp;' }}</div>
          <div class="text-3xl text-white font-bold font-mono tracking-wider overflow-x-auto w-full text-end">{{ displayValue }}</div>
        </div>

        <!-- Keypad -->
        <div class="grid grid-cols-4 gap-3" dir="ltr">
          <button @click="clear" class="h-14 rounded-xl text-xl font-semibold bg-slate-700 text-rose-400 hover:bg-slate-600">C</button>
          <button @click="backspace" class="h-14 rounded-xl text-xl font-semibold bg-slate-700 text-rose-400 hover:bg-slate-600">⌫</button>
          <button @click="append('%')" class="h-14 rounded-xl text-xl font-semibold bg-slate-700 text-blue-400 hover:bg-slate-600">%</button>
          <button @click="append('/')" class="h-14 rounded-xl text-xl font-semibold bg-slate-700 text-blue-400 hover:bg-slate-600">÷</button>

          <button @click="append('7')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">7</button>
          <button @click="append('8')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">8</button>
          <button @click="append('9')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">9</button>
          <button @click="append('*')" class="h-14 rounded-xl text-xl font-semibold bg-slate-700 text-blue-400 hover:bg-slate-600">×</button>

          <button @click="append('4')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">4</button>
          <button @click="append('5')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">5</button>
          <button @click="append('6')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">6</button>
          <button @click="append('-')" class="h-14 rounded-xl text-xl font-semibold bg-slate-700 text-blue-400 hover:bg-slate-600">-</button>

          <button @click="append('1')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">1</button>
          <button @click="append('2')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">2</button>
          <button @click="append('3')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">3</button>
          <button @click="append('+')" class="h-14 rounded-xl text-xl font-semibold bg-slate-700 text-blue-400 hover:bg-slate-600">+</button>

          <button @click="append('00')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">00</button>
          <button @click="append('0')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">0</button>
          <button @click="append('.')" class="h-14 rounded-xl text-xl font-semibold bg-slate-800 text-white hover:bg-slate-700">.</button>
          <button @click="calculate" class="h-14 rounded-xl text-xl font-semibold bg-blue-600 text-white hover:bg-blue-500">=</button>
        </div>

        <button @click="useResult" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl px-6 py-4 mt-2 transition-colors">
          استخدام النتيجة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'use-result'])

const expression = ref('')
const displayValue = ref('0')
const justCalculated = ref(false)

const append = (char) => {
  if (justCalculated.value) {
    if (/[0-9]/.test(char)) {
      displayValue.value = char
      expression.value = ''
    } else {
      expression.value = displayValue.value + char
      displayValue.value = '0'
    }
    justCalculated.value = false
    return
  }

  if (/[+\-*/]/.test(char)) {
    if (expression.value && !displayValue.value || displayValue.value === '0') {
      expression.value = expression.value.slice(0, -1) + char
    } else {
      expression.value += displayValue.value + char
      displayValue.value = '0'
    }
  } else {
    if (displayValue.value === '0' && char !== '.') {
      displayValue.value = char
    } else {
      displayValue.value += char
    }
  }
}

const clear = () => {
  expression.value = ''
  displayValue.value = '0'
}

const backspace = () => {
  if (displayValue.value !== '0') {
    displayValue.value = displayValue.value.slice(0, -1)
    if (!displayValue.value) displayValue.value = '0'
  }
}

const calculate = () => {
  try {
    let fullExpr = expression.value + (displayValue.value !== '0' ? displayValue.value : '')
    if (!fullExpr) return
    // Very basic and safe evaluation
    // eslint-disable-next-line
    const res = new Function('return ' + fullExpr)()
    displayValue.value = String(res)
    expression.value = ''
    justCalculated.value = true
  } catch (e) {
    displayValue.value = 'Error'
    justCalculated.value = true
  }
}

const useResult = () => {
  if (!justCalculated.value) calculate()
  const val = parseFloat(displayValue.value)
  if (!isNaN(val)) {
    emit('use-result', val)
    clear()
  }
}
</script>
