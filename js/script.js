// ======================
// UTILITY FUNCTIONS
// ======================

function getLocalStorage(key, defaultValue = []) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage`, error);
        return defaultValue;
    }
}

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { 
            try {
                func.apply(this, args); 
            } catch (error) {
                console.error('Error in debounced function:', error);
            }
        }, timeout);
    };
}

function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

function isDueToday(dateString) {
    if (!dateString) return false;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
    } catch (error) {
        console.error('Error checking due date:', error);
        return false;
    }
}

function isOverdue(dateString) {
    if (!dateString) return false;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    } catch (error) {
        console.error('Error checking overdue status:', error);
        return false;
    }
}

// ======================
// AI SERVICE
// ======================

class AIService {
    static async analyzeTask(text) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = {
            tags: [],
            priority: 'medium',
            dueDate: null,
            similarTasks: []
        };
        
        // Simple keyword matching for demo
        const tagKeywords = {
            'work': ['meeting', 'report', 'presentation', 'email', 'deadline'],
            'personal': ['buy', 'grocery', 'family', 'friend', 'pet'],
            'health': ['exercise', 'doctor', 'yoga', 'meditation', 'diet'],
            'shopping': ['buy', 'purchase', 'order', 'grocery', 'mall']
        };
        
        // Find matching tags
        Object.entries(tagKeywords).forEach(([tag, keywords]) => {
            if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
                response.tags.push(tag);
            }
        });
        
        // Priority prediction
        if (/\b(urgent|asap|important)\b/i.test(text)) {
            response.priority = 'high';
        } else if (/\b(low|not important|whenever)\b/i.test(text)) {
            response.priority = 'low';
        }
        
        // Due date suggestion
        if (/\b(today|now)\b/i.test(text)) {
            response.dueDate = new Date().toISOString().split('T')[0];
        } else if (/\b(tomorrow)\b/i.test(text)) {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            response.dueDate = date.toISOString().split('T')[0];
        } else if (/\b(this week)\b/i.test(text)) {
            const date = new Date();
            date.setDate(date.getDate() + 3);
            response.dueDate = date.toISOString().split('T')[0];
        }
        
        // Find similar tasks
        response.similarTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(text.toLowerCase().split(' ')[0]) ||
            (task.tags && task.tags.some(tag => response.tags.includes(tag)))
        ).slice(0, 3);
        
        return response;
    }
    
    static async chat(message) {
        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const responses = [
            "Based on your tasks, I recommend focusing on high-priority items first.",
            "You have several work-related tasks due soon. Would you like me to help prioritize them?",
            "I notice you have some shopping tasks. Would you like to group them together?",
            "You seem to have many tasks due today. Would you like to reschedule some?",
            "I can help you organize your tasks more effectively. What would you like to focus on?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// ======================
// CORE APP FUNCTIONS
// ======================

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === 'dark';
    }
}

function toggleTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    if (!themeSwitch) return;
    
    const theme = themeSwitch.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function openAddTaskModal() {
    document.getElementById('modal-title').textContent = 'Add New Task';
    taskForm.reset();
    currentEditTaskId = null;
    renderTagOptions();
    taskModal.style.display = 'flex';
}

function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-due-date').value = task.dueDate || '';
    document.getElementById('task-priority').value = task.priority || 'medium';
    
    renderTagOptions(task.tags || []);
    currentEditTaskId = taskId;
    taskModal.style.display = 'flex';
}

function closeTaskModal() {
    taskModal.style.display = 'none';
}

function renderTagOptions(selectedTags = []) {
    tagsSelector.innerHTML = '';
    
    tags.forEach(tag => {
        const tagOption = document.createElement('div');
        tagOption.className = `tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`;
        tagOption.innerHTML = `
            ${tag}
            <input type="checkbox" ${selectedTags.includes(tag) ? 'checked' : ''} value="${tag}">
        `;
        
        tagOption.addEventListener('click', () => {
            const checkbox = tagOption.querySelector('input');
            checkbox.checked = !checkbox.checked;
            tagOption.classList.toggle('selected');
        });
        
        tagsSelector.appendChild(tagOption);
    });
}

function getSelectedTags() {
    const checkboxes = tagsSelector.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function renderTags() {
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <i class="fas fa-times remove-tag"></i>
        `;
        
        tagElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) {
                e.stopPropagation();
                removeTag(tag);
            } else {
                filterByTag(tag);
            }
        });
        
        tagsContainer.appendChild(tagElement);
    });
}

function addNewTag() {
    const tagName = newTagInput.value.trim();
    if (!tagName) return;
    
    if (!tags.includes(tagName)) {
        tags.push(tagName);
        saveTags();
        renderTags();
        renderTagOptions();
    }
    
    newTagInput.value = '';
}

function removeTag(tagToRemove) {
    tags = tags.filter(tag => tag !== tagToRemove);
    
    tasks.forEach(task => {
        if (task.tags) {
            task.tags = task.tags.filter(tag => tag !== tagToRemove);
        }
    });
    
    saveTags();
    saveTasks();
    renderTags();
    renderTasks();
}

function filterByTag(tag) {
    taskSearch.value = '';
    const navItem = document.querySelector(`.sidebar-nav li[data-filter="all"]`);
    navItems.forEach(i => i.classList.remove('active'));
    navItem.classList.add('active');
    currentFilter = 'all';
    
    taskSearch.value = tag;
    renderTasks();
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const selectedTags = getSelectedTags();
    
    if (!title) {
        alert('Task title is required!');
        return;
    }
    
    const taskData = {
        title,
        description,
        dueDate,
        priority,
        tags: selectedTags,
        createdAt: new Date().toISOString(),
        completed: false
    };
    
    if (currentEditTaskId) {
        const taskIndex = tasks.findIndex(t => t.id === currentEditTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
        }
    } else {
        const newTask = {
            ...taskData,
            id: Date.now().toString()
        };
        tasks.unshift(newTask);
    }
    
    saveTasks();
    closeTaskModal();
    renderTasks();
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    const searchTerm = taskSearch.value.toLowerCase();
    const sortByValue = sortBy.value;
    
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || 
                             (task.description && task.description.toLowerCase().includes(searchTerm));
        
        const matchesFilter = 
            currentFilter === 'all' ||
            (currentFilter === 'today' && isDueToday(task.dueDate)) ||
            (currentFilter === 'important' && task.priority === 'high') ||
            (currentFilter === 'completed' && task.completed);
        
        return matchesSearch && matchesFilter;
    });
    
    filteredTasks.sort((a, b) => {
        switch (sortByValue) {
            case 'dueDate':
                return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
            case 'priority':
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'createdAt':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="empty-state">
                <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No tasks">
                <h3>No tasks found</h3>
                <p>${currentFilter === 'completed' ? 'No completed tasks yet' : 'Add a new task to get started'}</p>
            </div>
        `;
    } else {
        tasksContainer.innerHTML = '';
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-card ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${task.title}</h3>
                        ${task.tags && task.tags.length > 0 ? `
                            <div class="task-tags">
                                ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="task-btn edit" data-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-btn delete" data-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <div class="task-footer">
                    <span class="task-due-date ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}">
                        <i class="far fa-calendar-alt"></i>
                        ${task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                    </span>
                    <span class="priority-indicator priority-${task.priority}"></span>
                </div>
            `;
            
            tasksContainer.appendChild(taskElement);
            
            taskElement.querySelector('.task-btn.edit').addEventListener('click', () => openEditTaskModal(task.id));
            taskElement.querySelector('.task-btn.delete').addEventListener('click', () => deleteTask(task.id));
            taskElement.addEventListener('dblclick', () => toggleTaskCompletion(task.id));
        });
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskCounts();
}

function saveTags() {
    localStorage.setItem('tags', JSON.stringify(tags));
}

function updateTaskCounts() {
    document.getElementById('all-count').textContent = tasks.length;
    document.getElementById('today-count').textContent = tasks.filter(task => isDueToday(task.dueDate)).length;
    document.getElementById('important-count').textContent = tasks.filter(task => task.priority === 'high').length;
    document.getElementById('completed-count').textContent = tasks.filter(task => task.completed).length;
}

// ======================
// AI FEATURE FUNCTIONS
// ======================

function openAIAssistant() {
    const conversation = document.getElementById('ai-conversation');
    conversation.innerHTML = `
        <div class="ai-message ai-bot">
            Hi! I'm your task assistant. How can I help you today?
        </div>
    `;
    aiModal.style.display = 'flex';
}

async function sendAIMessage() {
    const input = document.getElementById('ai-user-input');
    const message = input.value.trim();
    if (!message) return;
    
    const conversation = document.getElementById('ai-conversation');
    
    // Add user message
    conversation.innerHTML += `
        <div class="ai-message ai-user">
            ${message}
        </div>
    `;
    
    input.value = '';
    conversation.scrollTop = conversation.scrollHeight;
    
    // Get AI response
    const response = await AIService.chat(message);
    
    // Add AI response
    conversation.innerHTML += `
        <div class="ai-message ai-bot">
            ${response}
        </div>
    `;
    
    conversation.scrollTop = conversation.scrollHeight;
}

async function analyzeTaskInput() {
    const titleInput = document.getElementById('task-title');
    const title = titleInput.value.trim();
    
    if (title.length > 5) { // Only analyze after some text is entered
        const analysis = await AIService.analyzeTask(title);
        
        // Show AI suggestions
        const suggestions = document.createElement('div');
        suggestions.className = 'ai-suggestions';
        
        if (analysis.tags.length > 0) {
            suggestions.innerHTML += `
                <div>Suggested tags: ${analysis.tags.map(tag => 
                    `<span class="ai-suggestion" data-tag="${tag}">${tag}</span>`
                ).join('')}</div>
            `;
        }
        
        if (analysis.dueDate) {
            suggestions.innerHTML += `
                <div>Suggested due date: 
                    <span class="ai-suggestion" data-date="${analysis.dueDate}">
                        ${formatDate(analysis.dueDate)}
                    </span>
                </div>
            `;
        }
        
        if (analysis.priority !== 'medium') {
            suggestions.innerHTML += `
                <div>Suggested priority: 
                    <span class="ai-suggestion" data-priority="${analysis.priority}">
                        ${analysis.priority}
                    </span>
                </div>
            `;
        }
        
        // Insert suggestions after title input
        const existingSuggestions = document.getElementById('ai-suggestions');
        if (existingSuggestions) {
            existingSuggestions.replaceWith(suggestions);
        } else {
            suggestions.id = 'ai-suggestions';
            titleInput.insertAdjacentElement('afterend', suggestions);
        }
        
        // Add click handlers for suggestions
        document.querySelectorAll('.ai-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                if (suggestion.dataset.tag) {
                    const tagOption = [...document.querySelectorAll('.tag-option')]
                        .find(el => el.textContent.includes(suggestion.dataset.tag));
                    if (tagOption) {
                        const checkbox = tagOption.querySelector('input');
                        checkbox.checked = !checkbox.checked;
                        tagOption.classList.toggle('selected');
                    }
                } else if (suggestion.dataset.date) {
                    document.getElementById('task-due-date').value = suggestion.dataset.date;
                } else if (suggestion.dataset.priority) {
                    document.getElementById('task-priority').value = suggestion.dataset.priority;
                }
            });
        });
    }
}

// ======================
// INITIALIZATION
// ======================

let tasks = [];
let tags = [];
let currentFilter = 'all';
let currentEditTaskId = null;
let aiModal, aiAssistantBtn, closeAIModal, aiSendBtn;

document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized');
    
    // Initialize DOM elements
    themeSwitch = document.getElementById('theme-switch');
    addTaskBtn = document.getElementById('add-task-btn');
    taskModal = document.getElementById('task-modal');
    closeModalBtn = document.querySelector('.close-btn');
    cancelTaskBtn = document.getElementById('cancel-task-btn');
    taskForm = document.getElementById('task-form');
    tasksContainer = document.getElementById('tasks-container');
    taskSearch = document.getElementById('task-search');
    sortBy = document.getElementById('sort-by');
    navItems = document.querySelectorAll('.sidebar-nav li');
    newTagInput = document.getElementById('new-tag-input');
    addTagBtn = document.getElementById('add-tag-btn');
    tagsContainer = document.getElementById('tags-container');
    tagsSelector = document.getElementById('tags-selector');
    aiModal = document.getElementById('ai-modal');
    aiAssistantBtn = document.getElemen
