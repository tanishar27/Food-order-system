<<<<<<< HEAD
# 🍔 Diet Tomorrow — Premium Food Ordering System

A sophisticated full-stack food ordering application built with a focus on modern UI/UX and robust database management. This project demonstrates a complete end-to-end flow from user authentication to dynamic menu management and order processing.

---

## 🚀 Features

- **🔐 User Authentication**: Secure login and registration system with session persistence using LocalStorage.
- **🍱 Dynamic Menu**: Real-time menu fetching from a MySQL database, replacing static HTML cards with live data.
- **🔍 Smart Search & Filter**: Instant search functionality and category-based filtering (Pizza, Burgers, Indian, etc.) for a seamless user experience.
- **🛒 Interactive Cart**: Full-featured shopping cart with real-time price calculation, tax (GST) estimation, and quantity management.
- **💎 Premium UI**: Modern "Glassmorphism" design aesthetic using Vanilla CSS, featuring smooth transitions, loaders, and responsive layouts.
- **📊 Robust Backend**: Express.js server handling API requests, connected to a relational MySQL database.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Custom Glassmorphism), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Relational Schema)
- **Tools**: CORS, MySQL2, Body-parser

---

## 📁 Database Schema

The project utilizes a structured MySQL database with the following tables:
- `users`: Stores user credentials and profile information.
- `menu_items`: Dynamic repository of food items with pricing, ratings, and categories.
- `orders`: Tracks user orders and their current status (Preparing, Out for Delivery, etc.).
- `payments`: Records transaction details and payment methods (UPI, Card, COD).

---

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Configuration**:
   Update the `DB_CONFIG` object in `server.js` with your MySQL credentials.

4. **Run the Server**:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:5000`.*

5. **Open the App**:
   Serve the `food order system` folder (e.g., using Live Server on port 3000) and navigate to `login.html`.

---

## 🎨 Design Philosophy

Diet Tomorrow is designed to feel alive. It uses a curated dark-mode palette with vibrant accents, subtle micro-animations, and a "frosted glass" effect to provide a premium, state-of-the-art dining experience right from the browser.

---

Created with ❤️ for the DBMS Project.
=======
# Food-Order-System
Online food order system with login and menu features
>>>>>>> aa8034698aecfa309d3ebf6fceadd45202683521
