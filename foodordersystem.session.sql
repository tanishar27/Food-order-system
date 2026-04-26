USE foodordersystem;

CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  email      VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(50)  NOT NULL,
  phone      VARCHAR(15),
  city       VARCHAR(30)  DEFAULT 'Mumbai',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  category    VARCHAR(30)   NOT NULL,
  price       DECIMAL(8,2)  NOT NULL,
  rating      DECIMAL(3,1)  DEFAULT 4.0,
  is_veg      TINYINT(1)    DEFAULT 1,
  description VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS orders (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  food_name    VARCHAR(100) NOT NULL,
  quantity     INT          DEFAULT 1,
  total_amount DECIMAL(8,2),
  status       ENUM('Pending','Preparing','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  ordered_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

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
);

INSERT IGNORE INTO users (name, email, password, phone, city) VALUES
  ('Tanisha',      'tanisha@gmail.com',   '1234',       '9876543210', 'Mumbai'),
  ('Harshwardhan', 'harsh@gmail.com',     'harsh123',   '9876500001', 'Pune'),
  ('Riya Shah',    'riya@gmail.com',      'riya456',    '9876500002', 'Delhi'),
  ('Aman Verma',   'aman@gmail.com',      'aman789',    '9876500003', 'Bangalore'),
  ('Priya Joshi',  'priya@gmail.com',     'priya321',   '9876500004', 'Chennai'),
  ('Rohan Mehta',  'rohan@gmail.com',     'rohan111',   '9876500005', 'Jaipur'),
  ('Sneha Patil',  'sneha@gmail.com',     'sneha222',   '9876500006', 'Surat'),
  ('Karan Singh',  'karan@gmail.com',     'karan333',   '9876500007', 'Ahmedabad'),
  ('Neha Gupta',   'neha@gmail.com',      'neha444',    '9876500008', 'Kolkata'),
  ('Admin',        'admin@gmail.com',     'admin123',   '9000000000', 'Mumbai');

INSERT IGNORE INTO menu_items (name, category, price, rating, is_veg, description) VALUES
  ('Classic Pepperoni Deluxe',   'Pizza',    499.00, 4.9, 0, 'Loaded with spicy pepperoni and mozzarella'),
  ('Cheesy Double Smash Burger', 'Burgers',  349.00, 4.8, 0, 'Double beef patties with cheese overload'),
  ('Midnight Lava Cake',         'Desserts', 249.00, 5.0, 1, 'Warm molten chocolate cake'),
  ('Cold Coffee Delight',        'Drinks',   120.00, 4.0, 1, 'Chilled coffee with whipped cream'),
  ('Paneer Butter Masala',       'Indian',   220.00, 4.9, 1, 'Creamy paneer curry with butter naan'),
  ('Dal Baati Churma',           'Indian',   180.00, 4.7, 1, 'Traditional Rajasthani dish'),
  ('Margherita Pizza',           'Pizza',    399.00, 4.6, 1, 'Classic tomato and basil pizza'),
  ('Chicken Biryani',            'Indian',   280.00, 4.8, 0, 'Aromatic basmati rice with tender chicken'),
  ('Veg Spring Rolls',           'Snacks',   149.00, 4.3, 1, 'Crispy rolls stuffed with mixed veggies'),
  ('Mango Lassi',                'Drinks',    90.00, 4.5, 1, 'Thick chilled mango yogurt drink');

INSERT IGNORE INTO orders (user_id, food_name, quantity, total_amount, status) VALUES
  (1,  'Classic Pepperoni Deluxe',   2, 998.00,  'Delivered'),
  (2,  'Chicken Biryani',            1, 280.00,  'Delivered'),
  (3,  'Margherita Pizza',           1, 399.00,  'Out for Delivery'),
  (4,  'Paneer Butter Masala',       3, 660.00,  'Preparing'),
  (5,  'Cheesy Double Smash Burger', 2, 698.00,  'Delivered'),
  (6,  'Midnight Lava Cake',         4, 996.00,  'Pending'),
  (7,  'Dal Baati Churma',           2, 360.00,  'Delivered'),
  (8,  'Cold Coffee Delight',        3, 360.00,  'Preparing'),
  (9,  'Veg Spring Rolls',           5, 745.00,  'Out for Delivery'),
  (10, 'Mango Lassi',               2, 180.00,  'Delivered');

INSERT IGNORE INTO payments (order_id, user_id, amount, method, status, transaction_id) VALUES
  (1,  1,  998.00, 'Card', 'Success', 'TXN20241001'),
  (2,  2,  280.00, 'UPI',  'Success', 'TXN20241002'),
  (3,  3,  399.00, 'COD',  'Pending', 'TXN20241003'),
  (4,  4,  660.00, 'UPI',  'Success', 'TXN20241004'),
  (5,  5,  698.00, 'Card', 'Success', 'TXN20241005'),
  (6,  6,  996.00, 'COD',  'Pending', 'TXN20241006'),
  (7,  7,  360.00, 'UPI',  'Success', 'TXN20241007'),
  (8,  8,  360.00, 'UPI',  'Failed',  'TXN20241008'),
  (9,  9,  745.00, 'Card', 'Success', 'TXN20241009'),
  (10, 10, 180.00, 'COD',  'Success', 'TXN20241010');

SELECT * FROM users;
SELECT * FROM orders;
SELECT * FROM menu_items;
SELECT * FROM payments;

SELECT o.id, u.name AS customer_name, u.city, o.food_name, o.quantity, o.total_amount, o.status, o.ordered_at
FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.ordered_at DESC;

SELECT p.transaction_id, u.name AS customer, o.food_name, p.amount, p.method, p.status AS payment_status, p.paid_at
FROM payments p JOIN users u ON p.user_id = u.id JOIN orders o ON p.order_id = o.id;

SELECT SUM(amount) AS total_revenue, COUNT(*) AS total_transactions, AVG(amount) AS avg_order_value
FROM payments WHERE status = 'Success';

SELECT u.name, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS total_spent
FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name ORDER BY total_spent DESC;

SELECT method, COUNT(*) AS transactions, SUM(amount) AS revenue FROM payments GROUP BY method;

SELECT food_name, SUM(quantity) AS total_qty_sold, COUNT(id) AS times_ordered, SUM(total_amount) AS revenue_generated
FROM orders GROUP BY food_name ORDER BY total_qty_sold DESC;

SELECT u.name, u.email, SUM(o.total_amount) AS total_spent
FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name, u.email
HAVING total_spent > (SELECT AVG(total_amount) FROM orders);
