#!/bin/bash
# Deployment script for the TiTan-6 project

# Switch to the project directory
cd ~/Desktop/casa0017-web-TiTan-6

# Pull the latest code from the Git repository "main" branch
echo "Pulling latest code from Git repository..."
git pull origin main

# Switch to the back-end directory, install dependencies, and restart the server
cd back-end
echo "Installing dependencies..."
npm install

# Stop the currently running server (if it exists)
echo "Killing existing server process (if running)..."
pkill -f "node server.js"

# Startup server (log output to both terminal and file)
echo "Starting the server..."
node server.js | tee ../server.log &

echo "Deployment completed! The server is running in the background."