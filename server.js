const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const User = require('./models/User');
const Task = require('./models/Task');
const authRoutes = require('./routes/auth');  // We'll create this
const taskRoutes = require('./routes/tasks'); // We'll create this
const apiRoutes = require('./routes/api');    // For RESTful APIs

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/todoapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));  // For CSS/JS files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session setup (stored in MongoDB)
app.use(session({
  secret: 'your-secret-key-change-in-prod',  // Use env var in production
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/todoapp' })
}));

// Auth middleware (protect routes)
const requireAuth = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect('/auth/login');
};

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', requireAuth, taskRoutes);  // Web CRUD (protected)
app.use('/api', apiRoutes);  // RESTful (unprotected)

// Home route (redirect to login if not auth'd)
app.get('/', requireAuth, (req, res) => res.redirect('/tasks'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
