// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const toggleListBtn = document.getElementById('toggleList');
const taskContainer = document.querySelector('.task-container');
const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Task array to store all tasks
let tasks = [];
let draggedItem = null;
let isDarkMode = false;

// Load tasks and theme from localStorage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
});

// Add event listener for the add button
addBtn.addEventListener('click', addTask);

// Add event listener for the Enter key in the input field
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Add event listener for the toggle list button
toggleListBtn.addEventListener('click', toggleTaskList);

// Add event listener for the theme toggle button
themeToggleBtn.addEventListener('click', toggleTheme);

// Function to toggle between light and dark themes
function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        htmlElement.classList.remove('light-theme');
        htmlElement.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggleBtn.title = 'Switch to light mode';
    } else {
        htmlElement.classList.remove('dark-theme');
        htmlElement.classList.add('light-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.title = 'Switch to dark mode';
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('darkMode', isDarkMode);
}

// Function to load theme preference from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme !== null) {
        isDarkMode = savedTheme === 'true';
        
        if (isDarkMode) {
            htmlElement.classList.remove('light-theme');
            htmlElement.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggleBtn.title = 'Switch to light mode';
        } else {
            htmlElement.classList.remove('dark-theme');
            htmlElement.classList.add('light-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.title = 'Switch to dark mode';
        }
    }
}

// Function to toggle the task list visibility with slide animation
function toggleTaskList() {
    const icon = toggleListBtn.querySelector('i');
    
    taskContainer.classList.toggle('collapsed');
    
    if (taskContainer.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    } else {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}

// Function to add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        return; // Don't add empty tasks
    }
    
    // Create a new task object
    const task = {
        id: Date.now(), // Use timestamp as unique ID
        text: taskText,
        completed: false,
        position: tasks.length // Add position property for ordering
    };
    
    // Add task to array
    tasks.push(task);
    
    // Save tasks to localStorage
    saveTasks();
    
    // Create and display the task element
    createTaskElement(task);
    
    // Clear the input field
    taskInput.value = '';
    
    // Focus on the input field for next entry
    taskInput.focus();
    
    // Make sure the task list is visible when adding a new task
    if (taskContainer.classList.contains('collapsed')) {
        toggleTaskList();
    }
}

// Function to create a task element and add it to the DOM
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.classList.add('task-item');
    taskItem.dataset.id = task.id;
    taskItem.draggable = true;
    
    // Create drag handle
    const dragHandle = document.createElement('div');
    dragHandle.classList.add('drag-handle');
    dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
    
    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox');
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', function() {
        toggleTaskStatus(task.id);
    });
    
    // Create task text
    const taskText = document.createElement('span');
    taskText.classList.add('task-text');
    taskText.textContent = task.text;
    if (task.completed) {
        taskText.classList.add('completed');
    }
    
    // Create actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('task-actions');
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', function() {
        deleteTask(task.id);
    });
    
    // Add delete button to actions container
    actionsContainer.appendChild(deleteBtn);
    
    // Append elements to task item
    taskItem.appendChild(dragHandle);
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(actionsContainer);
    
    // Add drag and drop event listeners
    taskItem.addEventListener('dragstart', handleDragStart);
    taskItem.addEventListener('dragend', handleDragEnd);
    taskItem.addEventListener('dragover', handleDragOver);
    taskItem.addEventListener('dragenter', handleDragEnter);
    taskItem.addEventListener('dragleave', handleDragLeave);
    taskItem.addEventListener('drop', handleDrop);
    
    // Append task item to task list
    taskList.appendChild(taskItem);
}

// Drag and drop event handlers
function handleDragStart(e) {
    this.classList.add('dragging');
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Update tasks array with new positions
    updateTaskPositions();
    
    // Save to localStorage
    saveTasks();
    
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    
    if (draggedItem !== this) {
        // Get all tasks
        const items = Array.from(taskList.querySelectorAll('.task-item'));
        const fromIndex = items.indexOf(draggedItem);
        const toIndex = items.indexOf(this);
        
        // Reorder in DOM
        if (fromIndex < toIndex) {
            taskList.insertBefore(draggedItem, this.nextSibling);
        } else {
            taskList.insertBefore(draggedItem, this);
        }
    }
    
    this.classList.remove('drag-over');
    return false;
}

// Function to update task positions after drag and drop
function updateTaskPositions() {
    const taskItems = Array.from(taskList.querySelectorAll('.task-item'));
    
    // Update the tasks array based on the new order
    const newTasksOrder = taskItems.map((item, index) => {
        const id = parseInt(item.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].position = index;
            return tasks[taskIndex];
        }
    }).filter(Boolean);
    
    tasks = newTasksOrder;
}

// Function to toggle the completed status of a task
function toggleTaskStatus(id) {
    const index = tasks.findIndex(task => task.id === id);
    
    if (index !== -1) {
        tasks[index].completed = !tasks[index].completed;
        
        // Update the task element in the DOM
        const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
        const taskText = taskItem.querySelector('.task-text');
        
        if (tasks[index].completed) {
            taskText.classList.add('completed');
        } else {
            taskText.classList.remove('completed');
        }
        
        // Save tasks to localStorage
        saveTasks();
    }
}

// Function to delete a task
function deleteTask(id) {
    // Filter out the task with the given id
    tasks = tasks.filter(task => task.id !== id);
    
    // Get the task element
    const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
    
    // Add a fade-out animation
    taskItem.style.opacity = '0';
    taskItem.style.transform = 'translateX(30px)';
    
    // Remove the task element after animation completes
    setTimeout(() => {
        taskItem.remove();
        
        // Update positions after deletion
        updateTaskPositions();
        
        // Save tasks to localStorage
        saveTasks();
    }, 300);
}

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        
        // Sort tasks by position
        tasks.sort((a, b) => {
            // If position is not defined, use the order they were added
            if (a.position === undefined) a.position = tasks.indexOf(a);
            if (b.position === undefined) b.position = tasks.indexOf(b);
            
            return a.position - b.position;
        });
        
        // Create and display task elements for each saved task
        tasks.forEach(task => {
            createTaskElement(task);
        });
    }
}