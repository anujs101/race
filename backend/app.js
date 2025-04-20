const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Security middleware
app.use(helmet()); // Sets various HTTP headers for security

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Basic middleware
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://raceresumeapp.com', 'http://localhost:3000'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to RACE API' });
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/jobs', require('./routes/jobs'));

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

app.use('/api/rehan', (req, res) => {
  
})

// Error handling middleware
app.use(errorHandler);

module.exports = app; 