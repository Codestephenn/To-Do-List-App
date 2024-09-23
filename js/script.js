class Task {
    constructor(text) {
        this.id = Date.now();
        this.text = text;
        this.isCompleted = false;
    }
}

class TaskManager {
    constructor(storage) {
        this.tasks = storage.getTasks();
        this.storage = storage;
    }

    addTask(text) {
        const task = new Task(text);
        this.tasks.push(task);
        this.storage.saveTasks(this.tasks);
    }

    toggleTaskCompletion(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id == id) {
                task.isCompleted = !task.isCompleted;
            }
            return task;
        });
        this.storage.saveTasks(this.tasks);
    }

    removeTask(id) {
        this.tasks = this.tasks.filter(task => task.id != id);
        this.storage.saveTasks(this.tasks);
    }
}

class Storage {
    getTasks() {
        return JSON.parse(localStorage.getItem("Tasks")) || [];
    }

    saveTasks(tasks) {
        localStorage.setItem("Tasks", JSON.stringify(tasks));
    }
}

class UIHandler {
    constructor(taskManager, listContainer, inputField, addBtn) {
        this.taskManager = taskManager;
        this.listContainer = listContainer;
        this.inputField = inputField;

        addBtn.addEventListener("click", () => {
            if (inputField.value) {
                this.taskManager.addTask(inputField.value);
                this.renderTasks();
                inputField.value = '';
            } else {
                alert("You must write something!");
            }
        });

        // Event delegation for listContainer
        listContainer.addEventListener("click", (e) => {
            const id = e.target.closest("li")?.dataset.id; // Use closest to find the <li>
            if (e.target.tagName === "LI") {
                this.taskManager.toggleTaskCompletion(id);
            } else if (e.target.tagName === "SPAN") {
                this.taskManager.removeTask(id);
            }
            this.renderTasks();
        });
    }

    renderTasks() {
        this.listContainer.innerHTML = "";
        this.taskManager.tasks.forEach(task => {
            const li = document.createElement("li");
            li.textContent = task.text;
            li.dataset.id = task.id; // Ensure data-id is set correctly
            if (task.isCompleted) li.classList.add("checked");

            const span = document.createElement("span");
            span.textContent = "\u00d7"; // Delete icon
            li.appendChild(span);
            this.listContainer.appendChild(li);
        });
    }
}

// Initializing the application
(function() {
    const inputField = document.getElementById("input-field");
    const listContainer = document.getElementById("list-container");
    const addBtn = document.getElementById("add-button");
    const storage = new Storage();
    const taskManager = new TaskManager(storage);
    const uiHandler = new UIHandler(taskManager, listContainer, inputField, addBtn);
    uiHandler.renderTasks();
})();