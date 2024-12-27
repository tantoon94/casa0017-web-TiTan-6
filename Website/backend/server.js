const express = require('express');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 4000;

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'mydatabase',
};

let connection;

// Before connec ting to the database, check if the port is in use and kill the process if necessary
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


// 创建数据库连接
const connectToDatabase = async () => {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the MySQL database.');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
};

// Serve the front-end files
app.use(express.static(path.join(__dirname, '../front-end')));

// Example API endpoint
app.get('/api/example', (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// 数据库测试端点
app.get('/', async (req, res) => {
  try {
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected!', result: rows[0].result });
  } catch (err) {
    console.error('Query failed:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Backend is running on http://localhost:${PORT}`);
  console.log(`Server is running on http://${localIP}:${PORT}`);
});