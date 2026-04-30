const hostname = window.location.hostname || 'localhost';
const API_BASE = window.location.port === '5000' ? '' : `http://${hostname}:5000`;

const isLoggedIn = localStorage.getItem('isFoodAppLoggedIn') === 'true';
const isLoginPage = window.location.pathname.includes('login.html');

if (!isLoggedIn && !isLoginPage) {
  window.location.href = 'login.html';
}

let cart = JSON.parse(localStorage.getItem('foodAppCart')) || [];

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }, 500);
  }
  updateCartBadge();
  if (window.location.pathname.includes('cart.html')) {
    renderCart();
  }
  if (window.location.pathname.includes('menu.html') || document.getElementById('food-grid')) {
    fetchMenuItems();
  }
});

function showToast(message) {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🍔</span> <div>${message}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function addToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, img, quantity: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`${name} added to cart!`);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const mobileBadges = document.querySelectorAll('.m-badge');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.animation = 'none';
    badge.offsetHeight;
    badge.style.animation = 'pulse-badge 2s infinite';
  });
  mobileBadges.forEach(badge => {
    badge.textContent = count;
  });
}



function saveCart() {
  localStorage.setItem('foodAppCart', JSON.stringify(cart));
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTax = document.getElementById('cart-tax');
  const cartTotal = document.getElementById('cart-total');
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="glass-panel text-center"><p>Your cart is empty! Time to add some delicious food.</p><br><a href="menu.html" class="btn btn-outline">Go to Menu</a></div>';
    cartSubtotal.textContent = '₹0';
    cartTax.textContent = '₹0';
    cartTotal.textContent = '₹0';
    return;
  }
  let subtotal = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    cartItemsContainer.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">₹${item.price}</div>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
        </div>
      </div>
    `;
  });
  const tax = subtotal * 0.05;
  const total = subtotal + tax + 40;
  cartSubtotal.textContent = '₹' + subtotal.toFixed(0);
  cartTax.textContent = '₹' + tax.toFixed(0);
  cartTotal.textContent = '₹' + total.toFixed(0);
}

function changeQty(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartBadge();
  renderCart();
}

function placeOrder(event) {
  event.preventDefault();
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  window.location.href = 'payment.html';
}

function clearCart() {
  cart = [];
  saveCart();
}

function getImageUrl(name, category) {
  const images = {
    'Classic Pepperoni Deluxe': 'assets/pizza.png',
    'Cheesy Double Smash Burger': 'assets/burger.png',
    'Midnight Lava Cake': 'assets/dessert.png',
    'Cold Coffee Delight': 'assets/cofe.png',
    'Strawberry Shake': 'assets/Strawberry Shake.jpg',
    'Paneer Butter Masala': 'assets/Paneerbutter.jpg',
    'Ghewar (Sweet)': 'assets/ghewar.jpg',
    'Dal Baati Churma': 'assets/dal baati.jpg',
    'Masala Dosa': 'assets/masala dosa.jpg',
    'Indian Veg Thali': 'assets/indian thali.jpg',
    'Cold Coffee': 'assets/cofe.png',
    'Strawberry Lassi': 'assets/Strawberry Shake.jpg',
    'Samosa Chaat': 'assets/images.jpg',
    'Chole Bhature': 'assets/chole-bhature-8230b.webp',
    'Idli Sambar': 'assets/idli.png',
    'Pani Puri': 'assets/panipuri.png'
  };
  if (images[name]) return images[name];
  
  const categoryImages = {
    'Pizza': 'assets/pizza.png',
    'Burgers': 'assets/burger.png',
    'Desserts': 'assets/dessert.png',
    'Drinks': 'assets/cofe.png',
    'Indian': 'assets/Paneerbutter.jpg'
  };
  return categoryImages[category] || 'assets/pizza.png';
}

async function fetchMenuItems() {
  try {
    const response = await fetch(`${API_BASE}/api/food-items`);
    const items = await response.json();
    renderMenuItems(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    showToast('Failed to load menu items');
  }
}

function renderMenuItems(items) {
  const foodGrid = document.getElementById('food-grid');
  if (!foodGrid) return;
  
  foodGrid.innerHTML = '';
  
  items.forEach(item => {
    const imgUrl = getImageUrl(item.name, item.category);
    const cardHtml = `
      <div class="food-card" data-category="${item.category}">
        <div class="food-card-img-wrap">
          <img src="${imgUrl}" alt="${item.name}">
        </div>
        <div class="food-card-content">
          <div class="food-card-header">
            <span class="food-card-title">${item.name}</span>
            <span class="food-rating">★ ${item.rating || '4.5'}</span>
          </div>
          <p class="food-desc">${item.description || ''}</p>
          <div class="food-card-footer">
            <span class="food-price">₹${item.price}</span>
            <button class="add-btn" onclick="addToCart('m${item.id}', '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${imgUrl}')"
              aria-label="Add to cart">+</button>
          </div>
        </div>
      </div>
    `;
    foodGrid.innerHTML += cardHtml;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const filterChips = document.querySelectorAll('.filter-chip');

  if (searchInput && filterChips.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterChips.forEach(c => c.classList.remove('active'));
      const allFilter = Array.from(filterChips).find(c => c.getAttribute('data-filter') === 'All');
      if (allFilter) allFilter.classList.add('active');
      const foodCards = document.querySelectorAll('.food-card');
      foodCards.forEach(card => {
        const titleElement = card.querySelector('.food-card-title');
        if (titleElement) {
          const title = titleElement.textContent.toLowerCase();
          card.style.display = title.includes(searchTerm) ? 'block' : 'none';
        }
      });
    });

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (searchInput.value !== '') {
          searchInput.value = '';
        }
        const filter = chip.getAttribute('data-filter');
        const foodCards = document.querySelectorAll('.food-card');
        foodCards.forEach(card => {
          if (filter === 'All') {
            card.style.display = 'block';
          } else {
            const category = card.getAttribute('data-category');
            card.style.display = (category === filter) ? 'block' : 'none';
          }
        });
      });
    });
  }
});

function toggleAuth(mode) {
  const loginSection = document.getElementById('login-section');
  const signupSection = document.getElementById('signup-section');
  if (mode === 'signup') {
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
  } else {
    loginSection.style.display = 'block';
    signupSection.style.display = 'none';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  if (!emailInput || !passwordInput) return;
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('isFoodAppLoggedIn', 'true');
      localStorage.setItem('foodAppUser', JSON.stringify(data.user));
      showToast('Welcome back, ' + data.user.name + '!');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showToast(data.error || 'Login failed');
    }
  } catch (error) {
    showToast('Server connection failed');
    console.error(error);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passwordInput = document.getElementById('reg-password');
  if (!nameInput || !emailInput || !passwordInput) return;
  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (response.ok) {
      showToast('Registration successful! please login.');
      setTimeout(() => {
        toggleAuth('login');
        document.getElementById('email').value = email;
      }, 1500);
    } else {
      showToast(data.error || 'Registration failed');
    }
  } catch (error) {
    showToast('Server connection failed');
    console.error(error);
  }
}

function handleLogout(event) {
  if (event) event.preventDefault();
  localStorage.removeItem('isFoodAppLoggedIn');
  localStorage.removeItem('foodAppUser');
  window.location.href = 'login.html';
}