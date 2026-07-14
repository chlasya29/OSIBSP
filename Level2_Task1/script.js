
(() => {
  const displayEl = document.getElementById('display');
  const historyEl = document.getElementById('history');
  const keysEl    = document.querySelector('.keys');

  let current   = '0';     
  let previous  = null;    
  let operator  = null;    
  let justEvaluated = false;

  /* ---------- render ---------- */
  function render() {
    displayEl.textContent = formatForDisplay(current);
    historyEl.innerHTML = buildHistory() || '&nbsp;';
  }

  function formatForDisplay(value) {
    if (value === 'Error') return 'Error';
    // limit length so it doesn't overflow
    if (value.length > 12) {
      const num = parseFloat(value);
      if (!isFinite(num)) return 'Error';
      return num.toPrecision(10).replace(/\.?0+$/, '');
    }
    return value;
  }

  function buildHistory() {
    if (previous === null) return '';
    const opSym = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator] || '';
    return `${previous} ${opSym}`;
  }

  /* ---------- input handlers ---------- */
  function inputDigit(d) {
    if (justEvaluated) { current = '0'; justEvaluated = false; }
    if (current === '0') current = d;
    else if (current.length < 14) current += d;
  }

  function inputDot() {
    if (justEvaluated) { current = '0'; justEvaluated = false; }
    if (!current.includes('.')) current += '.';
  }

  function clearAll() {
    current = '0';
    previous = null;
    operator = null;
    justEvaluated = false;
  }

  function toggleSign() {
    if (current === '0' || current === 'Error') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
  }

  function percent() {
    const n = parseFloat(current);
    if (isNaN(n)) return;
    current = String(n / 100);
  }

  function backspace() {
    if (justEvaluated) { clearAll(); return; }
    if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
  }

  function chooseOperator(op) {
    if (current === 'Error') return;
    if (previous !== null && operator && !justEvaluated) {
      compute();
    }
    previous = parseFloat(current);
    operator = op;
    justEvaluated = false;
    current = '0';
    // tiny trick: allow next digit to overwrite \"0\"
  }

  function compute() {
    if (previous === null || operator === null) return;
    const a = previous;
    const b = parseFloat(current);
    if (isNaN(b)) return;
    let result;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        if (b === 0) { current = 'Error'; previous = null; operator = null; return; }
        result = a / b; break;
      default: return;
    }
    // round floating point noise
    result = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
    current = String(result);
    previous = null;
    operator = null;
    justEvaluated = true;
  }

  /* ---------- click handling ---------- */
  keysEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button.key');
    if (!btn) return;

    flash(btn);

    const val    = btn.dataset.value;
    const action = btn.dataset.action;

    if (val !== undefined) {
      if (val === '.') inputDot();
      else if (/^\d$/.test(val)) inputDigit(val);
      else chooseOperator(val);
    } else if (action) {
      if (action === 'clear')   clearAll();
      if (action === 'sign')    toggleSign();
      if (action === 'percent') percent();
      if (action === 'equals')  compute();
    }
    render();
  });

  function flash(btn) {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 90);
  }

  /* ---------- keyboard ---------- */
  const keyMap = {
    '+': '[data-value=\"+\"]',
    '-': '[data-value=\"-\"]',
    '*': '[data-value=\"*\"]',
    '/': '[data-value=\"/\"]',
    '.': '[data-value=\".\"]',
    '%': '[data-action=\"percent\"]',
    'Enter':     '[data-action=\"equals\"]',
    '=':         '[data-action=\"equals\"]',
    'Escape':    '[data-action=\"clear\"]',
    'Backspace': null,            // handled separately
  };

  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key);
      flash(document.querySelector(`[data-value=\"${e.key}\"]`));
      render(); return;
    }
    if (e.key === 'Backspace') {
      backspace(); render(); return;
    }
    const sel = keyMap[e.key];
    if (sel) {
      const btn = document.querySelector(sel);
      if (btn) btn.click();
      e.preventDefault();
    }
  });

  /* ---------- init ---------- */
  render();
})();