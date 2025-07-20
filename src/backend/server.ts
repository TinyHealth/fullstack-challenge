import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// TODO: Implement the Task Manager Backend
//
// Requirements:
// 1. Define a Task interface with: id, title, completed, createdAt
// 2. Create an in-memory storage for tasks (Map or array)
// 3. Implement the following endpoints:
//    - GET /tasks - Return all tasks sorted by createdAt (newest first)
//    - POST /tasks - Create a new task with validation
//    - PUT /tasks/:id - Update a task (partial updates supported)
//    - DELETE /tasks/:id - Delete a specific task
//    - DELETE /tasks - Clear all tasks (for testing)
// 4. Handle errors appropriately with proper status codes
// 5. Make sure all tests pass!
//
// Refer to the README.md for the complete API specification

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});