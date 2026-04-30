const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'food order system')));
app.use('/food%20order%20system', express.static(path.join(__dirname, 'food order system')));
app.use('/food order system', express.static(path.join(__dirname, 'food order system')));
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});


const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database opening error: ' + err.message);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    city TEXT DEFAULT 'Mumbai',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    rating REAL DEFAULT 4.0,
    is_veg INTEGER DEFAULT 1,
    description TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_amount REAL,
    status TEXT DEFAULT 'Pending',
    ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    method TEXT DEFAULT 'UPI',
    status TEXT DEFAULT 'Success',
    transaction_id TEXT UNIQUE,
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], function(err) {
    if (err) return res.status(400).json({ error: 'Email exists' });
    res.json({ userId: this.lastID });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (user) res.json({ user });
    else res.status(401).json({ error: 'Invalid login' });
  });
});

app.get('/api/food-items', (req, res) => {
  db.all('SELECT * FROM menu_items', (err, rows) => res.json(rows));
});

app.post('/api/orders', (req, res) => {
  const { userId, cart, method, totalAmount } = req.body;
  db.serialize(() => {
    let lastOrderId = null;
    cart.forEach((item, index) => {
      db.run('INSERT INTO orders (user_id, food_name, quantity, total_amount) VALUES (?, ?, ?, ?)', 
        [userId, item.name, item.quantity, item.price * item.quantity], 
        function(err) {
          if (!err && index === cart.length - 1) {
             lastOrderId = this.lastID;
             const txnId = 'TXN' + Date.now();
             const paymentStatus = method === 'COD' ? 'Pending' : 'Success';
             db.run('INSERT INTO payments (order_id, user_id, amount, method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
               [lastOrderId, userId, totalAmount || 0, method || 'UPI', paymentStatus, txnId]);
          }
      });
    });
  });
  res.json({ message: 'Ordered' });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'food order system', 'index.html'));
});

app.listen(port, () => console.log(`🚀 Simple Server: http://localhost:${port}`));