import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const tasks: Map<string, Task> = new Map();

app.get('/tasks', (req: Request, res: Response) => {
  const taskArray = Array.from(tasks.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(taskArray);
});

app.post('/tasks', (req: Request, res: Response) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  const id = Date.now().toString();
  const newTask: Task = {
    id,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.set(id, newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  const task = tasks.get(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }
    task.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }
    task.completed = completed;
  }

  tasks.set(id, task);
  res.json(task);
});

app.delete('/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  if (!tasks.has(id)) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.delete(id);
  res.status(204).send();
});

app.delete('/tasks', (req: Request, res: Response) => {
  tasks.clear();
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});