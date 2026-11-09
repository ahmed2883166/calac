const result = document.querySelector('#result');
const history = document.querySelector('#history');
const keys = document.querySelector('.keys');
let expression = '';
let justEvaluated = false;

const operators = ['+', '−', '×', '÷', '%'];
const isOperator = (value) => operators.includes(value);
const readable = (value) => value || '0';

function updateDisplay() {
  result.textContent = readable(expression);
}

function calculate() {
  if (!expression || isOperator(expression.at(-1))) return;
  const formula = expression.replaceAll('×', '*').replaceAll('÷', '/').replaceAll('−', '-').replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
  try {
    const answer = Function(`"use strict"; return (${formula})`)();
    if (!Number.isFinite(answer)) throw new Error();
    history.textContent = `${expression} =`;
    expression = String(Number(answer.toPrecision(12)));
    justEvaluated = true;
    updateDisplay();
  } catch {
    result.textContent = 'خطأ';
  }
}

function input(value) {
  if (/\d|\./.test(value) && justEvaluated) { expression = ''; history.innerHTML = '&nbsp;'; justEvaluated = false; }
  if (isOperator(value)) {
    if (!expression && value !== '−') return;
    if (isOperator(expression.at(-1))) expression = expression.slice(0, -1);
    expression += value;
  } else if (value === '.') {
    const part = expression.split(/[+−×÷%]/).at(-1);
    if (!part.includes('.')) expression += expression ? '.' : '0.';
  } else if (expression.length < 18) expression += value;
  updateDisplay();
}

keys.addEventListener('click', ({ target }) => {
  if (!target.matches('button')) return;
  const { action, value } = target.dataset;
  if (action === 'clear') { expression = ''; history.innerHTML = '&nbsp;'; updateDisplay(); }
  else if (action === 'backspace') { expression = expression.slice(0, -1); updateDisplay(); }
  else if (action === 'sign') {
    const match = expression.match(/(-?\d*\.?\d*)$/);
    const current = match?.[0] ?? '';
    if (!current) expression += '−';
    else if (current.startsWith('-')) expression = expression.slice(0, -current.length) + current.slice(1);
    else expression = expression.slice(0, -current.length) + `-${current}`;
    updateDisplay();
  } else if (action === 'equals') calculate();
  else input(value);
});

document.addEventListener('keydown', (event) => {
  const map = { '*':'×', '/':'÷', '-':'−', Enter:'=', '=':'=', Escape:'AC', Backspace:'⌫' };
  const key = map[event.key] ?? event.key;
  if (/^[0-9.]$/.test(key) || isOperator(key)) input(key);
  else if (key === '=') calculate();
  else if (key === 'AC') { expression = ''; history.innerHTML = '&nbsp;'; updateDisplay(); }
  else if (key === '⌫') { expression = expression.slice(0, -1); updateDisplay(); }
});

document.querySelector('#theme-toggle').addEventListener('click', () => document.body.classList.toggle('dark'));
