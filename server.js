const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'food order system')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Replace with your MySQL username
  password: 'password',  // Correct password provided by user
  multipleStatements: true // Allows running multiple queries from a file
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server:', err.message);
  } else {
    console.log('Connected to MySQL server!');
    
    // Create the database if it doesn't exist
    db.query('CREATE DATABASE IF NOT EXISTS foodordersystem;', (err) => {
      if (err) console.error('Error creating database:', err);
      
      // Select the database
      db.query('USE foodordersystem;', (err) => {
        if (err) console.error('Error selecting database:', err);
        else {
          console.log('Database selected: foodordersystem');
          
          // Execute the SQL file to create tables and insert mock data
          const sqlFilePath = path.join(__dirname, 'foodordersystem.session.sql');
          if (fs.existsSync(sqlFilePath)) {
            const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
            db.query(sqlQuery, (err) => {
              if (err) {
                // Usually throws an error if tables already exist, which is fine to ignore on subsequent runs
                console.log('SQL script ran. Note: Existing tables were not overwritten.');
              } else {
                console.log('Successfully executed foodordersystem.session.sql!');
              }
            });
          }
        }
      });
    });
  }
});

// APIs

// 1. Register User
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
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  });
});

// 2. Login User
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
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

  // Assuming multiple items, we insert them one by one into the simple orders table
  // Since 'orders' table has: id, user_id, food_name, quantity
  
  const values = cart.map(item => [userId, item.name, item.quantity]);
  const query = 'INSERT INTO orders (user_id, food_name, quantity) VALUES ?';
  
  db.query(query, [values], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Order placed successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Open http://localhost:${port}/index.html in your browser.`);
});  
