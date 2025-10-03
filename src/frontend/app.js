"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class TaskManager {
    constructor() {
        this.apiUrl = 'http://localhost:3000';
        this.taskForm = document.getElementById('task-form');
        this.taskInput = document.getElementById('task-input');
        this.taskList = document.getElementById('task-list');
        this.errorMessage = document.getElementById('error-message');
        this.init();
    }
    init() {
        this.taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.loadTasks();
    }
    showError(message) {
        this.errorMessage.textContent = message;
        setTimeout(() => {
            this.errorMessage.textContent = '';
        }, 3000);
    }
    handleSubmit(e) {
        return __awaiter(this, void 0, void 0, function* () {
            e.preventDefault();
            const title = this.taskInput.value.trim();
            if (!title)
                return;
            try {
                const response = yield fetch(`${this.apiUrl}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title }),
                });
                if (!response.ok) {
                    const error = yield response.json();
                    throw new Error(error.error || 'Failed to create task');
                }
                this.taskInput.value = '';
                yield this.loadTasks();
            }
            catch (error) {
                this.showError(error instanceof Error ? error.message : 'Failed to add task');
            }
        });
    }
    loadTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiUrl}/tasks`);
                if (!response.ok) {
                    throw new Error('Failed to load tasks');
                }
                const tasks = yield response.json();
                this.renderTasks(tasks);
            }
            catch (error) {
                this.showError('Failed to load tasks');
            }
        });
    }
    renderTasks(tasks) {
        this.taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.taskId = task.id;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTask(task.id, !task.completed));
            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.title;
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => this.deleteTask(task.id));
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteButton);
            this.taskList.appendChild(li);
        });
    }
    toggleTask(id, completed) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiUrl}/tasks/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completed }),
                });
                if (!response.ok) {
                    throw new Error('Failed to update task');
                }
                yield this.loadTasks();
            }
            catch (error) {
                this.showError('Failed to update task');
                yield this.loadTasks();
            }
        });
    }
    deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${this.apiUrl}/tasks/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
                yield this.loadTasks();
            }
            catch (error) {
                this.showError('Failed to delete task');
            }
        });
    }
}

// Expose TaskManager to window so tests can verify its presence
window.TaskManager = TaskManager;

document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
