interface Task {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
}

class TaskManager {
    private apiUrl = 'http://localhost:3000';
    private taskForm: HTMLFormElement;
    private taskInput: HTMLInputElement;
    private taskList: HTMLUListElement;
    private errorMessage: HTMLDivElement;

    constructor() {
        this.taskForm = document.getElementById('task-form') as HTMLFormElement;
        this.taskInput = document.getElementById('task-input') as HTMLInputElement;
        this.taskList = document.getElementById('task-list') as HTMLUListElement;
        this.errorMessage = document.getElementById('error-message') as HTMLDivElement;

        this.init();
    }

    private init(): void {
        this.taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.loadTasks();
    }

    private showError(message: string): void {
        this.errorMessage.textContent = message;
        setTimeout(() => {
            this.errorMessage.textContent = '';
        }, 3000);
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();
        
        const title = this.taskInput.value.trim();
        if (!title) return;

        try {
            const response = await fetch(`${this.apiUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create task');
            }

            this.taskInput.value = '';
            await this.loadTasks();
        } catch (error) {
            this.showError(error instanceof Error ? error.message : 'Failed to add task');
        }
    }

    private async loadTasks(): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/tasks`);
            if (!response.ok) {
                throw new Error('Failed to load tasks');
            }

            const tasks: Task[] = await response.json();
            this.renderTasks(tasks);
        } catch (error) {
            this.showError('Failed to load tasks');
        }
    }

    private renderTasks(tasks: Task[]): void {
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

    private async toggleTask(id: string, completed: boolean): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            await this.loadTasks();
        } catch (error) {
            this.showError('Failed to update task');
            await this.loadTasks();
        }
    }

    private async deleteTask(id: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/tasks/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            await this.loadTasks();
        } catch (error) {
            this.showError('Failed to delete task');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});