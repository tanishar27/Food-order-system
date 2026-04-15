const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'food order system')));

// ✅ DATABASE CONNECTION (RAILWAY)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

// ✅ CONNECT
db.connect((err) => {
  if (err) {
    console.error('❌ FULL DB ERROR:', err);
  } else {
    console.log('✅ Connected to MySQL!');
  }
});

// ================= APIs =================

// 1. Register
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  });
});

// 2. Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      res.json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  });
});

// 3. Orders
app.post('/api/orders', (req, res) => {
  const { userId, cart } = req.body;

  if (!userId || !cart || cart.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const values = cart.map(item => [userId, item.name, item.quantity]);

  const query = 'INSERT INTO orders (user_id, food_name, quantity) VALUES ?';

  db.query(query, [values], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({ message: 'Order placed successfully' });
  });
});

// ================= START SERVER =================

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
