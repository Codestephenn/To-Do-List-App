(function() {
  console.log('JavaScript is working!');

  // Get references to DOM elements for input field, task list, and add button
  const inputField = document.getElementById("input-field");
  const listContainer = document.getElementById("list-container");
  const addBtn = document.getElementById("add-button");

  // Array to store tasks, initialized from localStorage or empty array
  let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];

  // Add event listener to handle adding a new task when the button is clicked
  addBtn.addEventListener("click", addTask);

  // Add a task to the task list and save it in localStorage
  function addTask() {
    // Ensure that the input field is not empty
    if (inputField.value === '') {
      alert("You must write something!");
    } else {
      // Create a new task object with a unique ID and completion status
      const taskObj = {
        id: Date.now(), // Use timestamp as a unique ID
        text: inputField.value, 
        isCompleted: false
      };

      // Add the task to the task array and update the display
      tasks.push(taskObj);
      renderTasks();
      saveTasks();
    }
    // Clear the input field after task is added
    inputField.value = "";
  }

  // Handle task list interactions: toggling completion status or removing tasks
  listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
      toggleTaskCompletion(e.target.dataset.id); // Toggle task completion
    } else if (e.target.tagName === "SPAN") {
      removeTask(e.target.parentElement.dataset.id); // Remove task
    }
  }, false);

  // Render all tasks from the tasks array onto the UI
  function renderTasks() {
    listContainer.innerHTML = ""; // Clear the list before rendering
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task.text;
      li.dataset.id = task.id;
      
      // Mark completed tasks visually
      if (task.isCompleted) {
        li.classList.add("checked");
      }

      // Add a close (×) button for task removal
      const span = document.createElement("span");
      span.textContent = "\u00d7";
      li.appendChild(span);
      listContainer.appendChild(li);
    });
  }

  // Toggle the completion status of a task by its ID
  function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
      if (task.id == id) {
        task.isCompleted = !task.isCompleted;
      }
      return task;
    });
    renderTasks(); // Re-render the updated task list
    saveTasks(); // Save updated task list to localStorage
  }

  // Remove a task by its ID and re-render the task list
  function removeTask(id) {
    tasks = tasks.filter(task => task.id != id);
    renderTasks(); // Re-render the updated task list
    saveTasks(); // Save updated task list to localStorage
  }

  // Save the current task list to localStorage
  function saveTasks() {
    localStorage.setItem("Tasks", JSON.stringify(tasks));
  }

  // Display all tasks from localStorage when the page is loaded
  function displayTasks() {
    renderTasks(); // Render tasks stored in the tasks array
  }

  // Immediately invoke the display function to render tasks on load
  displayTasks();

})();