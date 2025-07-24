import { test, expect } from '@playwright/test';

test.describe('Task Manager Application', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.delete('http://localhost:3000/tasks');
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle('Task Manager');
    await expect(page.locator('h1')).toHaveText('Task Manager');
    await expect(page.locator('#task-input')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Add Task');
  });

  test('should add a new task', async ({ page }) => {
    const taskTitle = 'Buy groceries';
    
    await page.fill('#task-input', taskTitle);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toHaveText(taskTitle);
    await expect(page.locator('#task-input')).toHaveValue('');
  });

  test('should add multiple tasks', async ({ page }) => {
    const tasks = ['First task', 'Second task', 'Third task'];
    
    for (const task of tasks) {
      await page.fill('#task-input', task);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(100);
    }
    
    await expect(page.locator('.task-item')).toHaveCount(3);
    
    const taskTexts = await page.locator('.task-text').allTextContents();
    expect(taskTexts).toEqual(tasks.reverse());
  });

  test('should not add empty task', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.task-item')).toHaveCount(0);
  });

  test('should not add task with only spaces', async ({ page }) => {
    await page.fill('#task-input', '   ');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.task-item')).toHaveCount(0);
  });

  test('should toggle task completion', async ({ page }) => {
    await page.fill('#task-input', 'Test task');
    await page.click('button[type="submit"]');
    
    const taskItem = page.locator('.task-item').first();
    const checkbox = taskItem.locator('.task-checkbox');
    
    await expect(taskItem).not.toHaveClass(/completed/);
    
    await checkbox.click();
    await expect(taskItem).toHaveClass(/completed/);
    await expect(checkbox).toBeChecked();
    
    await checkbox.click();
    await expect(taskItem).not.toHaveClass(/completed/);
    await expect(checkbox).not.toBeChecked();
  });

  test('should delete a task', async ({ page }) => {
    await page.fill('#task-input', 'Task to delete');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.task-item')).toHaveCount(1);
    
    await page.click('.delete-button');
    
    await expect(page.locator('.task-item')).toHaveCount(0);
  });

  test('should persist tasks after page reload', async ({ page }) => {
    const taskTitle = 'Persistent task';
    
    await page.fill('#task-input', taskTitle);
    await page.click('button[type="submit"]');
    
    await page.reload();
    
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toHaveText(taskTitle);
  });

  test('should maintain task order (newest first)', async ({ page }) => {
    const tasks = ['Old task', 'Middle task', 'New task'];
    
    for (const task of tasks) {
      await page.fill('#task-input', task);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(100);
    }
    
    const taskTexts = await page.locator('.task-text').allTextContents();
    expect(taskTexts).toEqual(['New task', 'Middle task', 'Old task']);
  });

  test('should handle API errors gracefully', async ({ page, context }) => {
    await context.route('**/tasks', route => route.abort());
    
    await page.fill('#task-input', 'Test task');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toHaveText('Failed to fetch');
    
    await page.waitForTimeout(3500);
    await expect(page.locator('.error-message')).toHaveText('');
  });

  test('should handle concurrent operations', async ({ page }) => {
    await page.fill('#task-input', 'Task 1');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.task-item:has-text("Task 1")');
    
    await page.fill('#task-input', 'Task 2');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.task-item:has-text("Task 2")');
    
    await page.fill('#task-input', 'Task 3');
    await page.click('button[type="submit"]');
    await page.waitForSelector('.task-item:has-text("Task 3")');
    
    await expect(page.locator('.task-item')).toHaveCount(3);
  });

  test('should update UI immediately after operations', async ({ page }) => {
    await page.fill('#task-input', 'Quick task');
    await page.click('button[type="submit"]');
    
    const checkbox = page.locator('.task-checkbox').first();
    await checkbox.click();
    
    await expect(page.locator('.task-item').first()).toHaveClass(/completed/);
    
    await page.click('.delete-button');
    await expect(page.locator('.task-item')).toHaveCount(0);
  });

  test('should validate POST /tasks endpoint', async ({ request }) => {
    // Test empty title
    const emptyResponse = await request.post('http://localhost:3000/tasks', {
      data: { title: '' }
    });
    expect(emptyResponse.status()).toBe(400);
    const emptyError = await emptyResponse.json();
    expect(emptyError.error).toBe('Title is required and must be a non-empty string');

    // Test missing title
    const missingResponse = await request.post('http://localhost:3000/tasks', {
      data: {}
    });
    expect(missingResponse.status()).toBe(400);
    const missingError = await missingResponse.json();
    expect(missingError.error).toBe('Title is required and must be a non-empty string');

    // Test valid task creation
    const validResponse = await request.post('http://localhost:3000/tasks', {
      data: { title: 'Valid task' }
    });
    expect(validResponse.status()).toBe(201);
    const task = await validResponse.json();
    expect(task).toMatchObject({
      title: 'Valid task',
      completed: false
    });
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeDefined();
  });

  test('should validate PUT /tasks/:id endpoint', async ({ request }) => {
    // Create a task first
    const createResponse = await request.post('http://localhost:3000/tasks', {
      data: { title: 'Task to update' }
    });
    const task = await createResponse.json();

    // Test partial update - title only
    const titleUpdateResponse = await request.put(`http://localhost:3000/tasks/${task.id}`, {
      data: { title: 'Updated title' }
    });
    expect(titleUpdateResponse.status()).toBe(200);
    const updatedTask = await titleUpdateResponse.json();
    expect(updatedTask.title).toBe('Updated title');
    expect(updatedTask.completed).toBe(false);

    // Test partial update - completed only
    const completedUpdateResponse = await request.put(`http://localhost:3000/tasks/${task.id}`, {
      data: { completed: true }
    });
    expect(completedUpdateResponse.status()).toBe(200);
    const completedTask = await completedUpdateResponse.json();
    expect(completedTask.title).toBe('Updated title');
    expect(completedTask.completed).toBe(true);

    // Test invalid title
    const invalidTitleResponse = await request.put(`http://localhost:3000/tasks/${task.id}`, {
      data: { title: '' }
    });
    expect(invalidTitleResponse.status()).toBe(400);
    const titleError = await invalidTitleResponse.json();
    expect(titleError.error).toBe('Title must be a non-empty string');

    // Test invalid completed type
    const invalidCompletedResponse = await request.put(`http://localhost:3000/tasks/${task.id}`, {
      data: { completed: 'not a boolean' }
    });
    expect(invalidCompletedResponse.status()).toBe(400);
    const completedError = await invalidCompletedResponse.json();
    expect(completedError.error).toBe('Completed must be a boolean');

    // Test task not found
    const notFoundResponse = await request.put('http://localhost:3000/tasks/nonexistent', {
      data: { title: 'Updated' }
    });
    expect(notFoundResponse.status()).toBe(404);
    const notFoundError = await notFoundResponse.json();
    expect(notFoundError.error).toBe('Task not found');
  });

  test('should validate DELETE /tasks/:id endpoint', async ({ request }) => {
    // Create a task first
    const createResponse = await request.post('http://localhost:3000/tasks', {
      data: { title: 'Task to delete' }
    });
    const task = await createResponse.json();

    // Test successful deletion
    const deleteResponse = await request.delete(`http://localhost:3000/tasks/${task.id}`);
    expect(deleteResponse.status()).toBe(204);

    // Test task not found
    const notFoundResponse = await request.delete(`http://localhost:3000/tasks/${task.id}`);
    expect(notFoundResponse.status()).toBe(404);
    const notFoundError = await notFoundResponse.json();
    expect(notFoundError.error).toBe('Task not found');
  });

  test('should sort tasks by createdAt (newest first)', async ({ request }) => {
    // Create tasks with small delays to ensure different timestamps
    await request.post('http://localhost:3000/tasks', {
      data: { title: 'First task' }
    });
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await request.post('http://localhost:3000/tasks', {
      data: { title: 'Second task' }
    });
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await request.post('http://localhost:3000/tasks', {
      data: { title: 'Third task' }
    });

    const response = await request.get('http://localhost:3000/tasks');
    const tasks = await response.json();
    
    expect(tasks).toHaveLength(3);
    expect(tasks[0].title).toBe('Third task');
    expect(tasks[1].title).toBe('Second task');
    expect(tasks[2].title).toBe('First task');
    
    // Verify timestamps are in descending order
    const timestamps = tasks.map(task => new Date(task.createdAt).getTime());
    expect(timestamps[0]).toBeGreaterThan(timestamps[1]);
    expect(timestamps[1]).toBeGreaterThan(timestamps[2]);
  });

  test('should have TaskManager class implementation', async ({ page }) => {
    // Verify TaskManager class exists on window object
    const taskManagerExists = await page.evaluate(() => {
      return typeof window.TaskManager === 'function';
    });
    expect(taskManagerExists).toBe(true);

    // Verify TaskManager can be instantiated
    const canInstantiate = await page.evaluate(() => {
      try {
        new window.TaskManager();
        return true;
      } catch (e) {
        return false;
      }
    });
    expect(canInstantiate).toBe(true);
  });

  test('should clear error messages after 3 seconds', async ({ page, context }) => {
    // Block API requests to trigger error
    await context.route('**/tasks', route => route.abort());
    
    await page.fill('#task-input', 'Test task');
    await page.click('button[type="submit"]');
    
    // Error should appear immediately
    await expect(page.locator('.error-message')).toHaveText('Failed to fetch');
    
    // Error should disappear after 3 seconds
    await page.waitForTimeout(3100);
    await expect(page.locator('.error-message')).toHaveText('');
  });

  test('should handle multiple API error scenarios', async ({ page, context }) => {
    // Test 500 server error
    await context.route('**/tasks', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.fill('#task-input', 'Test task');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText('Internal server error');
    
    // Clear the route for next test
    await context.unroute('**/tasks');
    
    // Test 400 validation error
    await context.route('**/tasks', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Title is required and must be a non-empty string' })
      });
    });
    
    await page.fill('#task-input', 'Another test task');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText('Title is required and must be a non-empty string');
  });
});