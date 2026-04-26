const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const port = process.env.PORT || 5000;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'foodordersystem',
  port: Number(process.env.DB_PORT) || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null,
};

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', white: '\x1b[37m',
};
function c(color, text) { return `${colors[color]}${text}${colors.reset}`; }

function logBanner() {
  const nets = os.networkInterfaces();
  let localIp = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
      }
    }
  }
  console.log(c('cyan', '\n  ╔══════════════════════════════════════════════════════╗'));
  console.log(c('cyan', '  ║') + c('bright', '     🍔  DIET TOMORROW — Food Order System           ') + c('cyan', '║'));
  console.log(c('cyan', '  ╠══════════════════════════════════════════════════════╣'));
  console.log(c('cyan', '  ║') + `  Local    : ${c('green', `http://localhost:${port}`)}                  ` + c('cyan', '║'));
  console.log(c('cyan', '  ║') + `  Network  : ${c('green', `http://${localIp}:${port}`)}               ` + c('cyan', '║'));
  console.log(c('cyan', '  ║') + `  Database : ${c('yellow', DB_CONFIG.database)} (MySQL)              ` + c('cyan', '║'));
  console.log(c('cyan', '  ╚══════════════════════════════════════════════════════╝\n'));
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'food order system')));

let pool;

async function initDatabase() {
  console.log(c('yellow', '  ⏳ Connecting to MySQL...'));
  try {
    pool = mysql.createPool({ ...DB_CONFIG, waitForConnections: true, connectionLimit: 10 });
    const connection = await pool.getConnection();
    console.log(c('green', '  ✅ MySQL connection established'));
    connection.release();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT          AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(50)  NOT NULL,
        email      VARCHAR(50)  NOT NULL UNIQUE,
        password   VARCHAR(50)  NOT NULL,
        phone      VARCHAR(15),
        city       VARCHAR(30)  DEFAULT 'Mumbai',
        created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(c('green', '  ✅ Table "users" ready'));

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id          INT           AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100)  NOT NULL,
        category    VARCHAR(30)   NOT NULL,
        price       DECIMAL(8,2)  NOT NULL,
        rating      DECIMAL(3,1)  DEFAULT 4.0,
        is_veg      TINYINT(1)    DEFAULT 1,
        description VARCHAR(200)
      )
    `);
    console.log(c('green', '  ✅ Table "menu_items" ready'));

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id           INT          AUTO_INCREMENT PRIMARY KEY,
        user_id      INT          NOT NULL,
        food_name    VARCHAR(100) NOT NULL,
        quantity     INT          DEFAULT 1,
        total_amount DECIMAL(8,2),
        status       ENUM('Pending','Preparing','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
        ordered_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log(c('green', '  ✅ Table "orders" ready'));

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id             INT          AUTO_INCREMENT PRIMARY KEY,
        order_id       INT          NOT NULL,
        user_id        INT          NOT NULL,
        amount         DECIMAL(8,2) NOT NULL,
        method         ENUM('Card','UPI','COD') DEFAULT 'UPI',
        status         ENUM('Success','Failed','Pending') DEFAULT 'Success',
        transaction_id VARCHAR(20)  UNIQUE,
        paid_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (user_id)  REFERENCES users(id)
      )
    `);
    console.log(c('green', '  ✅ Table "payments" ready'));

    const [[{ count: uCount }]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    if (uCount === 0) {
      await pool.query(`
        INSERT INTO users (name, email, password, phone, city) VALUES
          ('Tanisha',      'tanisha@gmail.com',   '1234',       '9876543210', 'Mumbai'),
          ('Harshwardhan', 'harsh@gmail.com',     'harsh123',   '9876500001', 'Pune'),
          ('Riya Shah',    'riya@gmail.com',      'riya456',    '9876500002', 'Delhi'),
          ('Aman Verma',   'aman@gmail.com',      'aman789',    '9876500003', 'Bangalore'),
          ('Priya Joshi',  'priya@gmail.com',     'priya321',   '9876500004', 'Chennai'),
          ('Rohan Mehta',  'rohan@gmail.com',     'rohan111',   '9876500005', 'Jaipur'),
          ('Sneha Patil',  'sneha@gmail.com',     'sneha222',   '9876500006', 'Surat'),
          ('Karan Singh',  'karan@gmail.com',     'karan333',   '9876500007', 'Ahmedabad'),
          ('Neha Gupta',   'neha@gmail.com',      'neha444',    '9876500008', 'Kolkata'),
          ('Admin',        'admin@gmail.com',     'admin123',   '9000000000', 'Mumbai')
      `);
      console.log(c('green', '  ✅ 10 users seeded'));
    } else {
      console.log(c('dim', `  ℹ️  Users seed skipped (${uCount} exist)`));
    }

    const [[{ count: mCount }]] = await pool.query('SELECT COUNT(*) AS count FROM menu_items');
    if (mCount === 0) {
      await pool.query(`
        INSERT INTO menu_items (name, category, price, rating, is_veg, description) VALUES
          ('Classic Pepperoni Deluxe',   'Pizza',    499.00, 4.9, 0, 'Loaded with spicy pepperoni and mozzarella'),
          ('Cheesy Double Smash Burger', 'Burgers',  349.00, 4.8, 0, 'Double beef patties with cheese overload'),
          ('Midnight Lava Cake',         'Desserts', 249.00, 5.0, 1, 'Warm molten chocolate cake'),
          ('Cold Coffee Delight',        'Drinks',   120.00, 4.0, 1, 'Chilled coffee with whipped cream'),
          ('Paneer Butter Masala',       'Indian',   220.00, 4.9, 1, 'Creamy paneer curry with butter naan'),
          ('Dal Baati Churma',           'Indian',   180.00, 4.7, 1, 'Traditional Rajasthani dish'),
          ('Margherita Pizza',           'Pizza',    399.00, 4.6, 1, 'Classic tomato and basil pizza'),
          ('Chicken Biryani',            'Indian',   280.00, 4.8, 0, 'Aromatic basmati rice'),
          ('Veg Spring Rolls',           'Snacks',   149.00, 4.3, 1, 'Crispy rolls stuffed with mixed veggies'),
          ('Mango Lassi',                'Drinks',    90.00, 4.5, 1, 'Thick chilled mango yogurt drink')
      `);
      console.log(c('green', '  ✅ 10 menu items seeded'));
    } else {
      console.log(c('dim', `  ℹ️  Menu seed skipped (${mCount} exist)`));
    }

    const [[{ count: oCount }]] = await pool.query('SELECT COUNT(*) AS count FROM orders');
    if (oCount === 0) {
      await pool.query(`
        INSERT INTO orders (user_id, food_name, quantity, total_amount, status) VALUES
          (1,  'Classic Pepperoni Deluxe',   2, 998.00,  'Delivered'),
          (2,  'Chicken Biryani',            1, 280.00,  'Delivered'),
          (3,  'Margherita Pizza',           1, 399.00,  'Out for Delivery'),
          (4,  'Paneer Butter Masala',       3, 660.00,  'Preparing'),
          (5,  'Cheesy Double Smash Burger', 2, 698.00,  'Delivered'),
          (6,  'Midnight Lava Cake',         4, 996.00,  'Pending'),
          (7,  'Dal Baati Churma',           2, 360.00,  'Delivered'),
          (8,  'Cold Coffee Delight',        3, 360.00,  'Preparing'),
          (9,  'Veg Spring Rolls',           5, 745.00,  'Out for Delivery'),
          (10, 'Mango Lassi',               2, 180.00,  'Delivered')
      `);
      console.log(c('green', '  ✅ 10 orders seeded'));
    } else {
      console.log(c('dim', `  ℹ️  Orders seed skipped (${oCount} exist)`));
    }

    const [[{ count: pCount }]] = await pool.query('SELECT COUNT(*) AS count FROM payments');
    if (pCount === 0) {
      await pool.query(`
        INSERT INTO payments (order_id, user_id, amount, method, status, transaction_id) VALUES
          (1,  1,  998.00, 'Card', 'Success', 'TXN20241001'),
          (2,  2,  280.00, 'UPI',  'Success', 'TXN20241002'),
          (3,  3,  399.00, 'COD',  'Pending', 'TXN20241003'),
          (4,  4,  660.00, 'UPI',  'Success', 'TXN20241004'),
          (5,  5,  698.00, 'Card', 'Success', 'TXN20241005'),
          (6,  6,  996.00, 'COD',  'Pending', 'TXN20241006'),
          (7,  7,  360.00, 'UPI',  'Success', 'TXN20241007'),
          (8,  8,  360.00, 'UPI',  'Failed',  'TXN20241008'),
          (9,  9,  745.00, 'Card', 'Success', 'TXN20241009'),
          (10, 10, 180.00, 'COD',  'Success', 'TXN20241010')
      `);
      console.log(c('green', '  ✅ 10 payments seeded'));
    } else {
      console.log(c('dim', `  ℹ️  Payments seed skipped (${pCount} exist)`));
    }

  } catch (err) {
    console.error(c('red', `  ❌ Database Error: ${err.message}`));
    throw err;
  }
}

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  try {
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    res.json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.code === 'ER_DUP_ENTRY' ? 'Email already exists' : 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) res.json({ message: 'Login successful', user: rows[0] });
    else res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/orders', async (req, res) => {
  const { userId, cart, paymentMethod } = req.body;
  if (!userId || !cart || cart.length === 0) return res.status(400).json({ error: 'Invalid order' });
  try {
    for (const item of cart) {
      const total = item.price * item.quantity;
      const [orderResult] = await pool.query(
        'INSERT INTO orders (user_id, food_name, quantity, total_amount, status) VALUES (?, ?, ?, ?, ?)',
        [userId, item.name, item.quantity, total, 'Preparing']
      );
      const txnId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
      await pool.query(
        'INSERT INTO payments (order_id, user_id, amount, method, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
        [orderResult.insertId, userId, total, paymentMethod || 'UPI', 'Success', txnId]
      );
    }
    console.log(c('green', `  📦 Order placed by User #${userId}`));
    res.json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/food-items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY rating DESC');
    res.json(rows);
  } catch (err) {
    res.json([
      { id: 1, name: 'Classic Pepperoni Deluxe',   price: 499, category: 'Pizza',    rating: 4.9, description: 'Loaded with spicy pepperoni' },
      { id: 2, name: 'Cheesy Double Smash Burger',  price: 349, category: 'Burgers',  rating: 4.8, description: 'Double beef patties' },
      { id: 3, name: 'Midnight Lava Cake',           price: 249, category: 'Desserts', rating: 5.0, description: 'Warm molten chocolate cake' },
      { id: 4, name: 'Cold Coffee Delight',          price: 120, category: 'Drinks',   rating: 4.0, description: 'Chilled coffee' },
      { id: 5, name: 'Paneer Butter Masala',         price: 220, category: 'Indian',   rating: 4.9, description: 'Creamy paneer curry' },
    ]);
  }
});

app.get('/api/admin/users', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, phone, city, created_at FROM users ORDER BY id');
  res.json(rows);
});

app.get('/api/admin/orders', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT o.id, u.name AS customer, u.city, o.food_name, o.quantity,
           o.total_amount, o.status, o.ordered_at
    FROM orders o JOIN users u ON o.user_id = u.id
    ORDER BY o.ordered_at DESC
  `);
  res.json(rows);
});

app.get('/api/admin/payments', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT p.transaction_id, u.name AS customer, o.food_name,
           p.amount, p.method, p.status AS payment_status, p.paid_at
    FROM payments p
    JOIN users  u ON p.user_id  = u.id
    JOIN orders o ON p.order_id = o.id
    ORDER BY p.paid_at DESC
  `);
  res.json(rows);
});

app.get('/api/admin/stats', async (req, res) => {
  const [[revenue]]    = await pool.query(`SELECT SUM(amount) AS total_revenue, COUNT(*) AS total_txns, AVG(amount) AS avg_value FROM payments WHERE status='Success'`);
  const [[userCount]]  = await pool.query(`SELECT COUNT(*) AS total FROM users`);
  const [[orderCount]] = await pool.query(`SELECT COUNT(*) AS total FROM orders`);
  const [topItems]     = await pool.query(`SELECT food_name, SUM(quantity) AS qty FROM orders GROUP BY food_name ORDER BY qty DESC LIMIT 5`);
  const [byMethod]     = await pool.query(`SELECT method, COUNT(*) AS count, SUM(amount) AS revenue FROM payments GROUP BY method`);
  res.json({ revenue, userCount: userCount.total, orderCount: orderCount.total, topItems, byMethod });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'food order system', 'index.html')));

async function start() {
  try {
    await initDatabase();
    app.listen(port, '0.0.0.0', () => { logBanner(); });
  } catch (err) {
    console.error(c('red', `  ❌ FAILED TO START: ${err.message}`));
    process.exit(1);
  }
}
start();