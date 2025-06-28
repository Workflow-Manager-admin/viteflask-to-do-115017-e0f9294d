import './style.css';

// PUBLIC_INTERFACE
/**
 * Fetches all tasks from the backend API.
 * @returns {Promise<Array>} The array of tasks.
 */
async function fetchTasks() {
  const res = await fetch('http://localhost:3001/api/tasks'); // Adjust port if needed
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return await res.json();
}

// PUBLIC_INTERFACE
/**
 * Adds a new task to the backend.
 * @param {string} title - The new task's title.
 * @returns {Promise<object>} The created task object.
 */
async function addTask(title) {
  const res = await fetch('http://localhost:3001/api/tasks', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to add task');
  return await res.json();
}

// PUBLIC_INTERFACE
/**
 * Marks a task as completed.
 * @param {number|string} id - The task ID.
 */
async function completeTask(id) {
  const res = await fetch(`http://localhost:3001/api/tasks/${id}/complete`, {
    method: "PUT"
  });
  if (!res.ok) throw new Error('Failed to complete task');
  return await res.json();
}

// PUBLIC_INTERFACE
/**
 * Deletes a task by ID.
 * @param {number|string} id - The task ID.
 */
async function deleteTask(id) {
  const res = await fetch(`http://localhost:3001/api/tasks/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

// Minimal DOM template for app
function createApp() {
  return `
    <main class="centered">
      <header>
        <h1>To-Do List</h1>
      </header>
      <form id="add-task-form" autocomplete="off">
        <input type="text" id="new-task-input" maxlength="100" placeholder="Add a new task..." required />
        <button type="submit" aria-label="Add task">+</button>
      </form>
      <ul id="tasks-list"></ul>
    </main>
  `;
}

function createTaskItem(task) {
  return `
    <li class="task-item${task.completed ? ' completed' : ''}">
      <span class="task-title">${task.title}</span>
      <span class="task-actions">
        <button class="complete-btn" data-id="${task.id}" ${task.completed ? "disabled" : ""} title="Complete">&#10003;</button>
        <button class="delete-btn" data-id="${task.id}" title="Delete">&#128465;</button>
      </span>
    </li>
  `;
}

// State: in-memory only for re-rendering.
let tasks = [];

async function renderTaskList() {
  const list = document.getElementById('tasks-list');
  list.innerHTML = tasks.map(createTaskItem).join('');
}

async function loadTasks() {
  try {
    tasks = await fetchTasks();
    renderTaskList();
  } catch {
    document.getElementById('tasks-list').innerHTML = `<li class="error">Failed to fetch tasks.</li>`;
  }
}

function setupHandlers() {
  const form = document.getElementById('add-task-form');
  const input = document.getElementById('new-task-input');
  const list = document.getElementById('tasks-list');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    form.querySelector('button[type="submit"]').disabled = true;
    try {
      const newTaskObj = await addTask(value);
      tasks.push(newTaskObj);
      renderTaskList();
      input.value = '';
    } catch {
      alert('Failed to add task');
    }
    form.querySelector('button[type="submit"]').disabled = false;
  });

  list.addEventListener('click', async (e) => {
    if (e.target.classList.contains('complete-btn')) {
      const id = e.target.getAttribute('data-id');
      e.target.disabled = true;
      try {
        await completeTask(id);
        tasks = tasks.map(t =>
          t.id == id ? { ...t, completed: true } : t
        );
        renderTaskList();
      } catch {
        alert('Failed to complete task');
        e.target.disabled = false;
      }
    }
    if (e.target.classList.contains('delete-btn')) {
      const id = e.target.getAttribute('data-id');
      e.target.disabled = true;
      try {
        await deleteTask(id);
        tasks = tasks.filter(t => t.id != id);
        renderTaskList();
      } catch {
        alert('Failed to delete task');
        e.target.disabled = false;
      }
    }
  });
}

document.querySelector('#app').innerHTML = createApp();
loadTasks();
setupHandlers();
