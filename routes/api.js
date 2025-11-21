const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// GET /api/tasks (Read: all or search)
router.get('/tasks', async (req, res) => {
  const { keyword, priority } = req.query;  // Simple search
  let query = {};
  if (keyword) query.title = { $regex: keyword, $options: 'i' };
  if (priority) query.priority = priority;
  const tasks = await Task.find(query);
  res.json(tasks);
});

// POST /api/tasks (Create)
router.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

// PUT /api/tasks/:id (Update)
router.put('/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
