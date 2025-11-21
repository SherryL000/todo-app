const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Dashboard (Read all, with search)
router.get('/', async (req, res) => {
  const { keyword, priority, dateFrom, dateTo } = req.query;
  let query = { userId: req.session.userId };
  if (keyword) query.title = { $regex: keyword, $options: 'i' };  // Fuzzy search bonus
  if (priority) query.priority = priority;
  if (dateFrom) query.dueDate = { $gte: new Date(dateFrom) };
  if (dateTo) query.dueDate = { ...query.dueDate, $lte: new Date(dateTo) };

  const tasks = await Task.find(query).sort({ dueDate: 1 });
  res.render('tasks', { tasks, userId: req.session.userId });
});

// Create form
router.get('/new', (req, res) => res.render('new-task'));

// Handle create
router.post('/', async (req, res) => {
  const task = new Task({ ...req.body, userId: req.session.userId });
  await task.save();
  res.redirect('/tasks');
});

// Update form (modal-like via GET for simplicity)
router.get('/:id/edit', async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId });
  if (!task) return res.status(404).send('Task not found');
  res.render('edit-task', { task });
});

// Handle update
router.put('/:id', async (req, res) => {
  await Task.findOneAndUpdate({ _id: req.params.id, userId: req.session.userId }, req.body);
  res.redirect('/tasks');
});

// Delete
router.delete('/:id', async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
  res.redirect('/tasks');
});

module.exports = router;
