const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'food order system')));

// ✅ DATABASE CONNECTION (SQLite drop-in replacement)
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite:', err.message);
  } else {
    console.log('✅ Connected to Local SQLite Database');
    
    // Initialize tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        food_name TEXT,
        quantity INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);
    });
  }
});

// ================= APIs =================

// 1. Register User
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.run(query, [name, email, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
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
  db.get(query, [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      res.json({ message: 'Login successful', user: row });
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

  const stmt = db.prepare('INSERT INTO orders (user_id, food_name, quantity) VALUES (?, ?, ?)');
  
  cart.forEach(item => {
    stmt.run([userId, item.name, item.quantity]);
  });

  stmt.finalize((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order placed successfully' });
  });
});

// Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});