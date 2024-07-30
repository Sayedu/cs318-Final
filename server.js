const express = require('express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

// Mongoose models
const User = require('./models/User');
const Expense = require('./models/Expense');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname))); // Serves static files from the root
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// User registration
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword });
    await user.save();
    req.session.userId = user._id; // Set session after registration
    res.redirect('/'); // Redirect to home page after registration
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      req.session.userId = user._id;
      res.redirect('/'); // Redirect to home page after login
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Get user's expenses
app.get('/expenses', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.session.userId });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save user expenses
app.post('/expenses', isAuthenticated, async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, userId: req.session.userId });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve static files and home page
app.get('/', async (req, res) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      const expenses = await Expense.find({ userId: req.session.userId });
      res.json({ user, expenses }); // For demonstration, returning JSON. Adapt this to your front-end.
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Serve login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Create server

const server = http.createServer(app);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server running at http://localhost:${process.env.PORT || 3000}/`);
    });
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
  });
