const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// ═══════════════════════════════════════════════════
// 🔧 MySQL Configuration — Change these to match yours
// ═══════════════════════════════════════════════════
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'password',       // ← Tried 'password' from vscode settings
  database: 'foodordersystem',
};

// ═══════════════════════════════════════════════════
// 🎨 Terminal Helpers (colored output)
// ═══════════════════════════════════════════════════
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

function c(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function logBanner() {
  console.log('');
  console.log(c('cyan', '  ╔══════════════════════════════════════════════════════╗'));
  console.log(c('cyan', '  ║') + c('bright', '     🍔  DIET TOMORROW — Food Order System           ') + c('cyan', '║'));
  console.log(c('cyan', '  ╠══════════════════════════════════════════════════════╣'));
  console.log(c('cyan', '  ║') + `  Server   : ${c('green', `http://localhost:${port}`)}                  ` + c('cyan', '║'));
  console.log(c('cyan', '  ║') + `  Database : ${c('yellow', DB_CONFIG.database)} (MySQL)              ` + c('cyan', '║'));
  console.log(c('cyan', '  ║') + `  Status   : ${c('green', '✅ Running')}                              ` + c('cyan', '║'));
  console.log(c('cyan', '  ╚══════════════════════════════════════════════════════╝'));
  console.log('');
}

function logRequest(method, route, details = {}) {
  const methodColors = {
    GET: 'green', POST: 'yellow', PUT: 'blue', DELETE: 'red'
  };
  const color = methodColors[method] || 'white';
  const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: true });

  console.log('');
  console.log(c('dim', `  ${timestamp}`) + ` ┌─ ${c(color, c('bright', method))} ${c('cyan', route)} ${'─'.repeat(Math.max(0, 40 - method.length - route.length))}`);

  for (const [key, val] of Object.entries(details)) {
    console.log(c('dim', '               ') + `│  ${key}: ${c('white', val)}`);
  }
}

function logResult(success, message) {
  const icon = success ? c('green', '✅') : c('red', '❌');
  console.log(c('dim', '               ') + `│  ${icon} ${message}`);
  console.log(c('dim', '               ') + `└${'─'.repeat(45)}`);
}

function logTable(title, rows, columns) {
  if (!rows || rows.length === 0) {
    console.log(`  📋 ${title}: (empty)`);
    return;
  }

  console.log('');
  console.log(c('bright', `  📋 ${title}`));

  // Calculate column widths
  const widths = {};
  columns.forEach(col => {
    widths[col] = col.length;
    rows.forEach(row => {
      const val = String(row[col] ?? '');
      widths[col] = Math.max(widths[col], val.length);
    });
    widths[col] = Math.min(widths[col], 25); // cap width
  });

  // Header
  let headerLine = '  ┌';
  let headerText = '  │';
  let separatorLine = '  ├';
  columns.forEach((col, i) => {
    const pad = widths[col] + 2;
    headerLine += '─'.repeat(pad) + (i < columns.length - 1 ? '┬' : '┐');
    headerText += ' ' + c('cyan', col.padEnd(widths[col])) + ' ' + '│';
    separatorLine += '─'.repeat(pad) + (i < columns.length - 1 ? '┼' : '┤');
  });
  console.log(headerLine);
  console.log(headerText);
  console.log(separatorLine);

  // Rows
  rows.forEach(row => {
    let rowText = '  │';
    columns.forEach(col => {
      const val = String(row[col] ?? '').substring(0, 25);
      rowText += ' ' + val.padEnd(widths[col]) + ' │';
    });
    console.log(rowText);
  });

  // Footer
  let footerLine = '  └';
  columns.forEach((col, i) => {
    footerLine += '─'.repeat(widths[col] + 2) + (i < columns.length - 1 ? '┴' : '┘');
  });
  console.log(footerLine);
  console.log(c('dim', `  Total: ${rows.length} row(s)`));
}

// ═══════════════════════════════════════════════════
//  Middleware
// ═══════════════════════════════════════════════════
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'food order system')));

// ═══════════════════════════════════════════════════
// 🗄️ Database Initialization
// ═══════════════════════════════════════════════════
let pool;

async function initDatabase() {
  console.log(c('yellow', '\n  ⏳ Connecting to MySQL...'));

  // First connect without database to create it if needed
  const tempConnection = await mysql.createConnection({
    host: DB_CONFIG.host,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
  });

  await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
  console.log(c('green', `  ✅ Database "${DB_CONFIG.database}" ready`));
  await tempConnection.end();

  // Now create the pool with the database
  pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Test connection
  const connection = await pool.getConnection();
  console.log(c('green', '  ✅ MySQL connection pool established'));
  connection.release();

  // Create tables
  console.log(c('yellow', '  ⏳ Initializing tables...'));

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log(c('green', '  ✅ Table "users" ready'));

  await pool.query(`
    CREATE TABLE IF NOT EXISTS food_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      price INT NOT NULL,
      image VARCHAR(255),
      category VARCHAR(50),
      rating FLOAT DEFAULT 0
    )
  `);
  console.log(c('green', '  ✅ Table "food_items" ready'));

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      total_amount DECIMAL(10,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'confirmed',
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  console.log(c('green', '  ✅ Table "orders" ready'));

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      food_name VARCHAR(100),
      quantity INT,
      price INT,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
  console.log(c('green', '  ✅ Table "order_items" ready'));

  // Seed food_items if empty
  const [foodRows] = await pool.query('SELECT COUNT(*) as count FROM food_items');
  if (foodRows[0].count === 0) {
    console.log(c('yellow', '  ⏳ Seeding food_items...'));
    await pool.query(`
      INSERT INTO food_items (name, description, price, image, category, rating) VALUES
      ('Classic Pepperoni Deluxe', 'Loaded with juicy pepperoni and melted cheese', 499, 'pizza.jpg', 'Pizza', 4.9),
      ('Cheesy Double Smash', 'Two juicy patties with cheddar cheese', 349, 'burger.jpg', 'Burgers', 4.8),
      ('Midnight Lava Cake', 'Warm chocolate cake with molten center', 249, 'cake.jpg', 'Desserts', 5.0),
      ('Ghewar (Sweet)', 'Traditional Rajasthani dessert soaked in sugar syrup', 140, 'ghewar.jpg', 'Desserts', 4.7),
      ('Cold Coffee', 'Chilled coffee with whipped cream', 120, 'coldcoffee.jpg', 'Drinks', 4.0),
      ('Strawberry Shake', 'Fresh strawberry milkshake', 150, 'shake.jpg', 'Drinks', 4.5),
      ('Paneer Butter Masala', 'Soft paneer in creamy tomato gravy', 220, 'paneer.jpg', 'Indian', 4.9),
      ('Dal Baati Churma', 'Authentic Rajasthani platter', 180, 'dalbaati.jpg', 'Indian', 4.8),
      ('Masala Dosa', 'Crispy dosa with chutney and sambar', 120, 'dosa.jpg', 'Indian', 4.6)
    `);
    console.log(c('green', '  ✅ 9 food items seeded'));
  }

  // Print current database contents
  const [users] = await pool.query('SELECT id, name, email, created_at FROM users');
  logTable('USERS', users, ['id', 'name', 'email', 'created_at']);

  const [foods] = await pool.query('SELECT id, name, price, category, rating FROM food_items');
  logTable('FOOD ITEMS', foods, ['id', 'name', 'price', 'category', 'rating']);

  const [orders] = await pool.query('SELECT id, user_id, total_amount, status, order_date FROM orders');
  logTable('ORDERS', orders, ['id', 'user_id', 'total_amount', 'status', 'order_date']);
}

// ═══════════════════════════════════════════════════
// 📡 API ROUTES
// ═══════════════════════════════════════════════════

// ── 1. Register User ──
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  logRequest('POST', '/api/register', { '👤 Name': name, '📧 Email': email });

  if (!name || !email || !password) {
    logResult(false, 'Missing required fields');
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );

    logResult(true, `User registered (ID: ${result.insertId})`);

    // Print updated users table
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users');
    logTable('USERS (updated)', users, ['id', 'name', 'email', 'created_at']);

    res.json({ message: 'User registered successfully', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      logResult(false, `Email "${email}" already exists`);
      return res.status(400).json({ error: 'Email already exists' });
    }
    logResult(false, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── 2. Login User ──
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  logRequest('POST', '/api/login', { '📧 Email': email });

  if (!email || !password) {
    logResult(false, 'Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      logResult(true, `Login successful — ${user.name} (ID: ${user.id})`);
      res.json({ message: 'Login successful', user });
    } else {
      logResult(false, 'Invalid email or password');
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    logResult(false, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── 3. Place Order ──
app.post('/api/orders', async (req, res) => {
  const { userId, cart } = req.body;

  logRequest('POST', '/api/orders', {
    '👤 User ID': userId,
    '🛒 Items': cart ? cart.length : 0,
  });

  if (!userId || !cart || cart.length === 0) {
    logResult(false, 'Invalid order data');
    return res.status(400).json({ error: 'Invalid order data' });
  }

  try {
    // Calculate total
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Insert order
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'confirmed']
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cart) {
      await pool.query(
        'INSERT INTO order_items (order_id, food_name, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.name, item.quantity, item.price]
      );
    }

    logResult(true, `Order #${orderId} placed — ₹${totalAmount}`);

    // Print order details
    const [orderItems] = await pool.query(
      'SELECT food_name, quantity, price FROM order_items WHERE order_id = ?',
      [orderId]
    );
    logTable(`ORDER #${orderId} ITEMS`, orderItems, ['food_name', 'quantity', 'price']);

    // Print all orders summary
    const [allOrders] = await pool.query(`
      SELECT o.id, u.name as user_name, o.total_amount, o.status, o.order_date 
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
    `);
    logTable('ALL ORDERS', allOrders, ['id', 'user_name', 'total_amount', 'status', 'order_date']);

    res.json({ message: 'Order placed successfully', orderId });
  } catch (err) {
    logResult(false, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── 4. Get All Food Items ──
app.get('/api/food-items', async (req, res) => {
  logRequest('GET', '/api/food-items');

  try {
    const [rows] = await pool.query('SELECT * FROM food_items');
    logResult(true, `Returned ${rows.length} food items`);
    res.json(rows);
  } catch (err) {
    logResult(false, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── 5. Get User's Orders ──
app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;

  logRequest('GET', `/api/orders/${userId}`);

  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.order_date 
       FROM orders o WHERE o.user_id = ? ORDER BY o.order_date DESC`,
      [userId]
    );

    // For each order, get the items
    for (const order of orders) {
      const [items] = await pool.query(
        'SELECT food_name, quantity, price FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    logResult(true, `Returned ${orders.length} orders for user ${userId}`);
    logTable(`ORDERS for User ${userId}`, orders, ['id', 'total_amount', 'status', 'order_date']);

    res.json(orders);
  } catch (err) {
    logResult(false, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── 6. Get All Users (admin view) ──
app.get('/api/users', async (req, res) => {
  logRequest('GET', '/api/users');

  try {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users');
    logResult(true, `Returned ${rows.length} users`);
    logTable('USERS', rows, ['id', 'name', 'email', 'created_at']);
    res.json(rows);
  } catch (err) {
    logResult(false, err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Fallback: serve index.html for SPA ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'food order system', 'index.html'));
});

// ═══════════════════════════════════════════════════
// 🚀 Start Server
// ═══════════════════════════════════════════════════
async function start() {
  try {
    await initDatabase();
    app.listen(port, () => {
      logBanner();
      console.log(c('dim', '  Waiting for requests...\n'));
    });
  } catch (err) {
    console.error(c('red', '\n  ❌ FAILED TO START SERVER'));
    console.error(c('red', `  ${err.message}`));
    console.error('');
    console.error(c('yellow', '  💡 Make sure MySQL is running and the config at the top of server.js is correct:'));
    console.error(c('dim', `     Host     : ${DB_CONFIG.host}`));
    console.error(c('dim', `     User     : ${DB_CONFIG.user}`));
    console.error(c('dim', `     Password : ${DB_CONFIG.password || '(empty)'}`));
    console.error(c('dim', `     Database : ${DB_CONFIG.database}`));
    console.error('');
    process.exit(1);
  }
}

start();