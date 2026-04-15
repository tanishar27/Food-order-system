
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(50),
  password VARCHAR(50)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  food_name VARCHAR(50),
  quantity INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (name, email, password)
VALUES ('Tanisha', 'tanisha@gmail.com', '1234');


INSERT INTO orders (user_id, food_name, quantity)
VALUES (1, 'Pizza', 2);

SELECT * FROM users;
SELECT * FROM orders;

