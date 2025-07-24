# Fullstack Technical Challenge

## Overview

This is a simple task management application designed as a technical interview challenge. The goal is to assess fullstack development skills by having candidates implement either the frontend or backend portion of the application while the other half is already provided.

## Challenge Structure

The complete application consists of:
- **Backend**: REST API built with Express.js and TypeScript
- **Frontend**: Vanilla TypeScript application with a simple UI
- **E2E Tests**: Comprehensive Playwright tests that verify the full application functionality

For the interview, candidates will receive:
- One half of the implementation (either frontend OR backend)
- Complete end-to-end tests
- API documentation/interface specifications

## Challenge Goal

Your task is to implement the missing half of the application so that all end-to-end tests pass. The tests serve as your specification and success criteria.

## Time Limit

45 minutes

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

2. Install Playwright browsers (first time only):
   ```bash
   npx playwright install
   # or
   bunx playwright install
   ```

3. Run the tests to see what needs to be implemented:
   ```bash
   npm test
   # or
   bun run test
   ```

4. Start development servers:
   ```bash
   npm run dev
   # or
   bun dev
   ```

   This will start:
   - Backend server on http://localhost:3000
   - Frontend server on http://localhost:3001

## Available Scripts

- `npm run dev` - Start both frontend and backend servers
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server
- `npm run build` - Build both frontend and backend
- `npm test` - Run end-to-end tests
- `npm run test:ui` - Run tests with Playwright UI

## API Specification

### Base URL
`http://localhost:3000`

### Endpoints

#### GET /tasks
Returns all tasks sorted by creation date (newest first)

**Response:**
```json
[
  {
    "id": "1234567890",
    "title": "Task title",
    "completed": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /tasks
Creates a new task

**Request Body:**
```json
{
  "title": "Task title"
}
```

**Response:** `201 Created`
```json
{
  "id": "1234567890",
  "title": "Task title",
  "completed": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Title is required and must be a non-empty string"
}
```

#### PUT /tasks/:id
Updates a task (partial update supported)

**Request Body:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

**Response:** `200 OK`
```json
{
  "id": "1234567890",
  "title": "Updated title",
  "completed": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: `{ "error": "Task not found" }`
- `400 Bad Request`: `{ "error": "Title must be a non-empty string" }`
- `400 Bad Request`: `{ "error": "Completed must be a boolean" }`

#### DELETE /tasks/:id
Deletes a task

**Response:** `204 No Content`

**Error Response:** `404 Not Found`
```json
{
  "error": "Task not found"
}
```

## Frontend Requirements

If implementing the frontend:

1. **UI Elements:**
   - Input field for new tasks (#task-input)
   - Submit button to add tasks
   - Task list displaying all tasks (#task-list)
   - Each task should show:
     - Checkbox to toggle completion
     - Task title
     - Delete button
   - Error message display (#error-message)

2. **Functionality:**
   - Add new tasks
   - Toggle task completion status
   - Delete tasks
   - Display errors for failed operations
   - Clear error messages after 3 seconds
   - Tasks should be sorted newest first

3. **CSS Classes:**
   - `.task-item` - Task container
   - `.task-item.completed` - Completed task styling
   - `.task-checkbox` - Completion checkbox
   - `.task-text` - Task title text
   - `.delete-button` - Delete button
   - `.error-message` - Error display

## Evaluation Criteria

1. **Functionality**: All tests pass
2. **Code Quality**: Clean, readable, maintainable code
3. **Error Handling**: Graceful handling of API errors
4. **TypeScript Usage**: Proper typing and type safety
5. **Problem Solving**: Approach to debugging failing tests

## Tips

- Start by running the tests to understand what needs to be implemented
- Use the test descriptions as your specification
- The tests are comprehensive - if they pass, your implementation is correct
- Don't overthink the solution - keep it simple and focused
- Ask questions if requirements are unclear

Good luck!