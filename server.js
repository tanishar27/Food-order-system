const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'food order system')));

// ✅ FIXED DATABASE CONNECTION (Railway)
const db = mysql.createConnection({
  host: 'nozomi.proxy.rlwy.net',
  user: 'root',
  password: 'cTVUGmTdREWZNkJrOmrdtgifHLSuIFbE',
  database: 'railway',
  port: 15017,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect DB
db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
  } else {
    console.log('✅ Connected to Railway MySQL');
  }
});


// ================= APIs =================

// 1. Register User
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(query, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User registered successfully' });
  });
});

// 2. Login User
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

// 3. Save Order
app.post('/api/orders', (req, res) => {
  const { userId, cart } = req.body;

  if (!userId || !cart || cart.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const values = cart.map(item => [userId, item.name, item.quantity]);
  const query = 'INSERT INTO orders (user_id, food_name, quantity) VALUES ?';

  db.query(query, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Order placed successfully' });
  });
});

// Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});