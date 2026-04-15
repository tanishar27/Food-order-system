CREATE TABLE food_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    image VARCHAR(255),
    category VARCHAR(50),
    rating FLOAT DEFAULT 0
);

INSERT INTO food_items (name, description, price, image, category, rating) VALUES

-- Pizza
('Classic Pepperoni Deluxe', 'Loaded with juicy pepperoni and melted cheese', 499, 'pizza.jpg', 'Pizza', 4.9),

-- Burgers
('Cheesy Double Smash', 'Two juicy patties with cheddar cheese', 349, 'burger.jpg', 'Burgers', 4.8),

-- Desserts
('Midnight Lava Cake', 'Warm chocolate cake with molten center', 249, 'cake.jpg', 'Desserts', 5.0),
('Ghewar (Sweet)', 'Traditional Rajasthani dessert soaked in sugar syrup', 140, 'ghewar.jpg', 'Desserts', 4.7),

-- Drinks
('Cold Coffee', 'Chilled coffee with whipped cream', 120, 'coldcoffee.jpg', 'Drinks', 4.0),
('Strawberry Shake', 'Fresh strawberry milkshake', 150, 'shake.jpg', 'Drinks', 4.5),

-- Indian
('Paneer Butter Masala', 'Soft paneer in creamy tomato gravy', 220, 'paneer.jpg', 'Indian', 4.9),
('Dal Baati Churma', 'Authentic Rajasthani platter', 180, 'dalbaati.jpg', 'Indian', 4.8),
('Masala Dosa', 'Crispy dosa with chutney and sambar', 120, 'dosa.jpg', 'Indian', 4.6); 
