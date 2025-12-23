const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const themeToggle = document.getElementById("themeToggle");
const focusToggle = document.getElementById("focusToggle");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const streakCount = document.getElementById("streakCount");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let focusMode = false;

let streak = JSON.parse(localStorage.getItem("streak")) || {
  count: 0,
  lastCompletedDate: null
};

/* Smart Auto Focus */
function autoFocusHighestPriority() {
  if (!focusMode) return;

  const priorityOrder = [
    "urgent-important",
    "not-urgent-important",
    "urgent-not-important",
    "not-urgent-not-important"
  ];

  for (let p of priorityOrder) {
    if (tasks.some(t => t.priority === p && !t.completed)) {
      document.querySelectorAll(".matrix-column")
        .forEach(col => col.classList.remove("active"));

      document
        .querySelector(`[data-priority="${p}"]`)
        .classList.add("active");
      break;
    }
  }
}

/* Render */
function renderTasks() {
  document.querySelectorAll(".task-list").forEach(list => list.innerHTML = "");

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
  <span class="task-text">${task.text}</span>
  <div class="task-actions">
    <input type="checkbox" ${task.completed ? "checked" : ""} />
    <button class="delete-btn" title="Delete task">✕</button>
  </div>
`;

    li.querySelector("input").addEventListener("change", () => {
      task.completed = !task.completed;
      if (task.completed) updateStreak();
      saveAndRender();
    });
    li.querySelector(".delete-btn").addEventListener("click", () => {
  tasks.splice(index, 1);
  saveAndRender();
});


    document
      .querySelector(`[data-priority="${task.priority}"] .task-list`)
      .appendChild(li);
  });

  document.querySelectorAll(".task-list").forEach(list => {
    if (!list.children.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "🌊 Clear waters here";
      list.appendChild(empty);
    }
  });

  updateProgress();
  autoFocusHighestPriority();
}

/* Progress */
function updateProgress() {
  if (!tasks.length) return;

  const done = tasks.filter(t => t.completed).length;
  const percent = Math.round((done / tasks.length) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% Completed`;
}

/* Streak */
function updateStreak() {
  const today = new Date().toDateString();
  if (streak.lastCompletedDate === today) return;

  streak.count++;
  streak.lastCompletedDate = today;
  localStorage.setItem("streak", JSON.stringify(streak));
  streakCount.textContent = streak.count;
}

/* Add Task */
addTaskBtn.addEventListener("click", () => {
  if (!taskInput.value.trim()) return;
  tasks.push({
    text: taskInput.value,
    priority: prioritySelect.value,
    completed: false
  });
  taskInput.value = "";
  saveAndRender();
});

/* Focus Mode */
focusToggle.addEventListener("click", () => {
  focusMode = !focusMode;
  document.body.classList.toggle("focus", focusMode);
  document.querySelectorAll(".matrix-column")
    .forEach(col => col.classList.remove("active"));
  autoFocusHighestPriority();
});

/* Theme */
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* Storage */
function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

/* Init */
streakCount.textContent = streak.count;
renderTasks();