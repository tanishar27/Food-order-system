const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Drop all existing tables
  db.run("DROP TABLE IF EXISTS payments");
  db.run("DROP TABLE IF EXISTS orders");
  db.run("DROP TABLE IF EXISTS menu_items");
  db.run("DROP TABLE IF EXISTS users");

  // Create users
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    city TEXT DEFAULT 'Mumbai',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create menu_items
  db.run(`CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    rating REAL DEFAULT 4.0,
    is_veg INTEGER DEFAULT 1,
    description TEXT
  )`);

  // Create orders
  db.run(`CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_amount REAL,
    status TEXT DEFAULT 'Pending',
    ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Create payments
  db.run(`CREATE TABLE payments (
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

  // Insert users
  db.run(`INSERT OR IGNORE INTO users (name, email, password, phone, city) VALUES
    ('Tanisha',      'tanisha@gmail.com',   '1234',       '9876543210', 'Mumbai'),
    ('Harshwardhan', 'harsh@gmail.com',     'harsh123',   '9876500001', 'Pune'),
    ('Riya Shah',    'riya@gmail.com',      'riya456',    '9876500002', 'Delhi'),
    ('Aman Verma',   'aman@gmail.com',      'aman789',    '9876500003', 'Bangalore'),
    ('Priya Joshi',  'priya@gmail.com',     'priya321',   '9876500004', 'Chennai'),
    ('Rohan Mehta',  'rohan@gmail.com',     'rohan111',   '9876500005', 'Jaipur'),
    ('Sneha Patil',  'sneha@gmail.com',     'sneha222',   '9876500006', 'Surat'),
    ('Karan Singh',  'karan@gmail.com',     'karan333',   '9876500007', 'Ahmedabad'),
    ('Neha Gupta',   'neha@gmail.com',      'neha444',    '9876500008', 'Kolkata'),
    ('Admin',        'admin@gmail.com',     'admin123',   '9000000000', 'Mumbai')`);

  // Insert menu_items
  db.run(`INSERT OR IGNORE INTO menu_items (name, category, price, rating, is_veg, description) VALUES
    ('Paneer Butter Masala', 'North Indian', 150.00, 4.9, 1, 'Soft paneer cubes in rich creamy tomato gravy'),
    ('Dal Baati Churma', 'North Indian', 120.00, 4.7, 1, 'Authentic Rajasthani platter with crispy baati'),
    ('Masala Dosa', 'South Indian', 90.00, 4.8, 1, 'Crispy crepe stuffed with spiced potato filling'),
    ('Indian Veg Thali', 'North Indian', 180.00, 4.6, 1, 'Complete meal with roti, rice, dal, and veggies'),
    ('Ghewar (Sweet)', 'Sweets', 110.00, 4.5, 1, 'Traditional Rajasthani disc-shaped sweet dish'),
    ('Cold Coffee', 'Drinks', 60.00, 4.3, 1, 'Chilled brew with milk and cream'),
    ('Strawberry Lassi', 'Drinks', 70.00, 4.4, 1, 'Sweet yogurt drink blended with fresh strawberries'),
    ('Samosa Chaat', 'Snacks', 50.00, 4.6, 1, 'Crushed samosas topped with yogurt and chutneys'),
    ('Chole Bhature', 'North Indian', 110.00, 4.8, 1, 'Spicy chickpea curry with fried fluffy bread'),
    ('Idli Sambar', 'South Indian', 60.00, 4.5, 1, 'Soft steamed rice cakes served with hot lentil soup'),
    ('Pani Puri', 'Snacks', 40.00, 4.7, 1, 'Crispy hollow puris filled with spicy tangy water and potato mixture'),
    ('Midnight Lava Cake', 'Sweets', 249.00, 5.0, 1, 'Decadent warm chocolate cake with molten center and vanilla scoop.')`);

  // Insert orders
  db.run(`INSERT OR IGNORE INTO orders (user_id, food_name, quantity, total_amount, status) VALUES
    (1,  'Paneer Butter Masala', 2, 300.00,  'Delivered'),
    (2,  'Dal Baati Churma',     1, 120.00,  'Delivered'),
    (3,  'Masala Dosa',          1, 90.00,   'Out for Delivery'),
    (4,  'Indian Veg Thali',     3, 540.00,  'Preparing'),
    (5,  'Ghewar (Sweet)',       2, 220.00,  'Delivered'),
    (6,  'Cold Coffee',          4, 240.00,  'Pending'),
    (7,  'Strawberry Lassi',     2, 140.00,  'Delivered'),
    (8,  'Samosa Chaat',         3, 150.00,  'Preparing'),
    (9,  'Chole Bhature',        5, 550.00,  'Out for Delivery'),
    (10, 'Idli Sambar',          2, 120.00,  'Delivered')`);

  // Insert payments
  db.run(`INSERT OR IGNORE INTO payments (order_id, user_id, amount, method, status, transaction_id) VALUES
    (1,  1,  300.00, 'Card', 'Success', 'TXN20241001'),
    (2,  2,  120.00, 'UPI',  'Success', 'TXN20241002'),
    (3,  3,  90.00,  'COD',  'Pending', 'TXN20241003'),
    (4,  4,  540.00, 'UPI',  'Success', 'TXN20241004'),
    (5,  5,  220.00, 'Card', 'Success', 'TXN20241005'),
    (6,  6,  240.00, 'COD',  'Pending', 'TXN20241006'),
    (7,  7,  140.00, 'UPI',  'Success', 'TXN20241007'),
    (8,  8,  150.00, 'UPI',  'Failed',  'TXN20241008'),
    (9,  9,  550.00, 'Card', 'Success', 'TXN20241009'),
    (10, 10, 120.00, 'COD',  'Success', 'TXN20241010')`);
});

console.log("Database updated successfully with Indian Veg items including Pani Puri.");
