#!/bin/bash

# Start development server for RACE Resume App
echo "🚀 Starting RACE Resume App development server..."

# Check if environment file exists
if [ ! -f .env ]; then
  echo "⚠️ .env file not found. Creating a sample one..."
  echo "PORT=5001
MONGO_URI=mongodb+srv://anuj:mongo2024@cluster0.hyvqjrf.mongodb.net/
JWT_SECRET=anuj2024
GEMINI_API_KEY=AIzaSyA4Izwx5mgQjb4DCLkMLLaruOuqUqyqosE" > .env
  echo "✅ Sample .env file created. Please update with your actual values if needed."
fi

# Run the server using nodemon
npx nodemon index.js 