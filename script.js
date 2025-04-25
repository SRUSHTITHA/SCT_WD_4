let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function addTask() {
  const taskInput = document.getElementById("taskInput").value.trim();
  const taskNotes = document.getElementById("taskNotes").value.trim();
  const category = document.getElementById("taskCategory").value;
  const priority = document.getElementById("taskPriority").value;
  const repeat = document.getElementById("taskRepeat").value;
  const dateTime = document.getElementById("taskDateTime").value;

  if (!taskInput || !dateTime) return alert("Please fill task & datetime");

  tasks.push({
    text: taskInput,
    notes: taskNotes,
    category,
    priority,
    repeat,
    dateTime,
    completed: false,
    reminded: false
  });

  saveAndDisplay();
}

function displayTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const filterStatus = document.getElementById("filterStatus").value;
  const sortBy = document.getElementById("sortBy").value;
  const search = document.getElementById("searchInput").value.toLowerCase();

  let filtered = tasks.filter(t =>
    t.text.toLowerCase().includes(search) &&
    (filterStatus === "all" || (filterStatus === "completed") === t.completed)
  );

  if (sortBy === "priority") {
    const order = { High: 1, Medium: 2, Low: 3 };
    filtered.sort((a, b) => order[a.priority] - order[b.priority]);
  } else if (sortBy === "date") {
    filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  } else if (sortBy === "category") {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  filtered.forEach((task, i) => {
    const li = document.createElement("li");
    li.classList.add(task.priority.toLowerCase());
    li.classList.toggle("completed", task.completed);

    const colorClass =
      new Date(task.dateTime) < new Date() && !task.completed
        ? "style='color:red'"
        : "";

    li.innerHTML = `
      <div>
        <strong>${task.text}</strong> <span ${colorClass}>(${task.dateTime})</span><br/>
        <small>${task.category} | ${task.priority} | ${task.repeat}</small><br/>
        <em>${task.notes}</em>
      </div>
      <div>
        <button onclick="toggleComplete(${i})">✅</button>
        <button onclick="deleteTask(${i})">🗑️</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateProgress();
  saveTasks();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  document.getElementById("completeSound").play();
  saveAndDisplay();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveAndDisplay();
}

function updateProgress() {
  const done = tasks.filter(t => t.completed).length;
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;
  document.getElementById("progressBar").style.width = `${pct}%`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveAndDisplay() {
  saveTasks();
  displayTasks();
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();
  recognition.onresult = function (e) {
    document.getElementById("taskInput").value = e.results[0][0].transcript;
  };
}

function checkReminders() {
  const now = new Date();
  tasks.forEach((task, index) => {
    if (!task.completed && !task.reminded && new Date(task.dateTime) <= now) {
      alert(`⏰ Reminder: ${task.text}`);
      task.reminded = true;
    }
  });
  saveTasks();
}

setInterval(checkReminders, 10000); // check every minute

document.getElementById("searchInput").addEventListener("input", displayTasks);
document.getElementById("filterStatus").addEventListener("change", displayTasks);
document.getElementById("sortBy").addEventListener("change", displayTasks);

new Sortable(document.getElementById("taskList"), {
  animation: 150,
  onEnd: function (evt) {
    const [moved] = tasks.splice(evt.oldIndex, 1);
    tasks.splice(evt.newIndex, 0, moved);
    saveAndDisplay();
  }
});


displayTasks();
