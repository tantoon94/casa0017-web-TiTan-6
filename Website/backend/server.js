const express = require('express');
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
});