#!/usr/bin/env node

// Import necessary modules
const express = require('express');
const path = require('path');
const os = require('os');
const { exec } = require('child_process'); // For running shell commands

const app = express();
const PORT = 3000;

// Function to get the local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface in interfaces) {
        for (const alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}

// Function to check and kill processes using the target port
function killPortProcess(port, callback) {
    const command = process.platform === 'win32'
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port}`;
    
    exec(command, (err, stdout, stderr) => {
        if (err || stderr) {
            console.error(`Error checking port ${port}:`, err || stderr);
            return callback(); // Continue starting the server even if no process is found
        }
        
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
            console.log(`Port ${port} is in use. Attempting to close...`);
            // For Windows: Extract PID from the netstat output
            if (process.platform === 'win32') {
                lines.forEach(line => {
                    const match = line.match(/\d+$/);
                    if (match) {
                        const pid = match[0];
                        exec(`taskkill /PID ${pid} /F`, (err, stdout, stderr) => {
                            if (err) console.error(`Failed to kill process ${pid}:`, err || stderr);
                            else console.log(`Process ${pid} killed.`);
                        });
                    }
                });
            } else {
                // For Unix-based systems: Extract PID from lsof output
                lines.forEach(line => {
                    const match = line.match(/\b\d+\b/);
                    if (match) {
                        const pid = match[0];
                        exec(`kill -9 ${pid}`, (err, stdout, stderr) => {
                            if (err) console.error(`Failed to kill process ${pid}:`, err || stderr);
                            else console.log(`Process ${pid} killed.`);
                        });
                    }
                });
            }
        }
        callback();
    });
}

// Serve the front-end files
app.use(express.static(path.join(__dirname, '../front-end')));

// Example API endpoint
app.get('/api/example', (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Start the server, but kill any existing process using the target port 3000
killPortProcess(PORT, () => {
    app.listen(PORT, () => {
        const localIP = getLocalIP();
        console.log(`Server is running on http://${localIP}:${PORT}`);
    });
});
