const STORAGE_KEY = "daybook.tasks.v1";

/** @type {{id:string, text:string, done:boolean, addedAt:number, completedAt:number|null}[]} */
let tasks = load();
let searchQuery = "";

/* ---------- Storage ---------- */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ---------- Helpers ---------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function fmtTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time;
  const date = d.toLocaleDateString([], { day: "numeric", month: "short" });
  return `${date} · ${time}`;
}

/* ---------- Elements ---------- */
const composer        = document.getElementById("composer");
const taskInput       = document.getElementById("taskInput");
const pendingList     = document.getElementById("pendingList");
const completedList   = document.getElementById("completedList");
const pendingCount    = document.getElementById("pendingCount");
const completedCount  = document.getElementById("completedCount");
const pendingEmpty    = document.getElementById("pendingEmpty");
const completedEmpty  = document.getElementById("completedEmpty");
const clearCompletedBtn = document.getElementById("clearCompleted");

const statPending     = document.getElementById("statPending");
const statDone        = document.getElementById("statDone");
const statTotal       = document.getElementById("statTotal");
const progressPct     = document.getElementById("progressPct");
const progressFill    = document.getElementById("progressFill");
const progressNote    = document.getElementById("progressNote");

const navDay          = document.getElementById("navDay");
const navDate         = document.getElementById("navDate");
const heroDay         = document.getElementById("heroDay");
const heroDate        = document.getElementById("heroDate");
const searchInput     = document.getElementById("searchInput");

/* ---------- Date in header ---------- */
(function paintDate() {
  const now = new Date();
  const weekday = now.toLocaleDateString([], { weekday: "long" });
  const dayNum  = now.getDate();
  const month   = now.toLocaleDateString([], { month: "long" });
  const year    = now.getFullYear();

  navDay.textContent = weekday;
  navDate.textContent = `${dayNum} ${month} ${year}`;

  heroDay.textContent  = weekday + ".";
  heroDate.textContent = `${dayNum} ${month}, ${year}`;
})();

/* ---------- Notes by progress ---------- */
function noteFor(total, done) {
  if (total === 0)        return "Begin with a single line.";
  if (done === 0)         return "A clean slate. What matters most?";
  if (done === total)     return "All done. Rest is also work.";
  if (done / total < .5)  return "A good beginning. Keep going.";
  if (done / total < 1)   return "Almost there. The end is in sight.";
  return "";
}

/* ---------- Render ---------- */
function render() {
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  const q = searchQuery.trim().toLowerCase();
  const matches = (t) => !q || t.text.toLowerCase().includes(q);

  const pendingAll   = tasks.filter(t => !t.done);
  const completedAll = tasks.filter(t =>  t.done);

  const pending   = pendingAll.filter(matches)
    .sort((a, b) => b.addedAt - a.addedAt);
  const completed = completedAll.filter(matches)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  pending.forEach(t   => pendingList.appendChild(renderTask(t)));
  completed.forEach(t => completedList.appendChild(renderTask(t)));

  pendingCount.textContent   = String(pending.length);
  completedCount.textContent = String(completed.length);

  // Sidebar stats: always reflect totals (not filtered)
  statPending.textContent = String(pendingAll.length);
  statDone.textContent    = String(completedAll.length);
  statTotal.textContent   = String(tasks.length);

  const total = tasks.length;
  const pct = total === 0 ? 0 : Math.round((completedAll.length / total) * 100);
  progressPct.textContent = pct + "%";
  progressFill.style.width = pct + "%";
  progressNote.textContent = noteFor(total, completedAll.length);

  pendingEmpty.classList.toggle("is-hidden", pending.length > 0);
  completedEmpty.classList.toggle("is-hidden", completed.length > 0);
  if (q) {
    if (pending.length === 0)   pendingEmpty.textContent = "No matches in pending.";
    else pendingEmpty.textContent = "Nothing pending. A rare and beautiful thing.";
    if (completed.length === 0) completedEmpty.textContent = "No matches in completed.";
    else completedEmpty.textContent = "No tasks finished yet today.";
  } else {
    pendingEmpty.textContent   = "Nothing pending. A rare and beautiful thing.";
    completedEmpty.textContent = "No tasks finished yet today.";
  }

  clearCompletedBtn.classList.toggle("is-hidden", completedAll.length === 0);
}

function renderTask(t) {
  const li = document.createElement("li");
  li.className = "task" + (t.done ? " task--done" : "");
  li.dataset.id = t.id;

  const check = document.createElement("button");
  check.type = "button";
  check.className = "task__check" + (t.done ? " is-done" : "");
  check.setAttribute("aria-label", t.done ? "Mark as pending" : "Mark as complete");
  check.addEventListener("click", () => toggle(t.id));

  const body = document.createElement("div");
  body.className = "task__body";

  const text = document.createElement("div");
  text.className = "task__text";
  text.textContent = t.text;

  const meta = document.createElement("div");
  meta.className = "task__meta";
  meta.textContent = t.done
    ? `Added ${fmtTime(t.addedAt)} · Done ${fmtTime(t.completedAt)}`
    : `Added ${fmtTime(t.addedAt)}`;

  body.appendChild(text);
  body.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "task__actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "task__btn task__btn--edit";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => startEdit(t.id, body, text));

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "task__btn task__btn--delete";
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", () => remove(t.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(check);
  li.appendChild(body);
  li.appendChild(actions);

  return li;
}

/* ---------- Actions ---------- */
function add(textValue) {
  const text = textValue.trim();
  if (!text) return;
  tasks.push({
    id: uid(),
    text,
    done: false,
    addedAt: Date.now(),
    completedAt: null
  });
  save();
  render();
}

function toggle(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  t.completedAt = t.done ? Date.now() : null;
  save();
  render();
}

function remove(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function update(id, newText) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const trimmed = newText.trim();
  if (!trimmed) { remove(id); return; }
  t.text = trimmed;
  save();
  render();
}

function startEdit(id, bodyEl, textEl) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task__edit";
  input.value = t.text;
  input.maxLength = 200;

  bodyEl.replaceChild(input, textEl);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    update(id, input.value);
  };
  const cancel = () => {
    if (committed) return;
    committed = true;
    render();
  };

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { e.preventDefault(); cancel(); }
  });
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

/* ---------- Events ---------- */
composer.addEventListener("submit", (e) => {
  e.preventDefault();
  add(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  render();
});

/* ---------- Init ---------- */
render();
