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
});