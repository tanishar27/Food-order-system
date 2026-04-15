// Auth Check
const isLoggedIn = localStorage.getItem('isFoodAppLoggedIn') === 'true';
const isLoginPage = window.location.pathname.includes('login.html');

if (!isLoggedIn && !isLoginPage) {
  window.location.href = 'login.html';
}

// Initial State
let cart = JSON.parse(localStorage.getItem('foodAppCart')) || [];

window.addEventListener('load', () => {
  // Remove Loader
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }, 500); // minimum showing 500ms for visual
  }

  updateCartBadge();
  
  // Render Cart if on cart page
  if (window.location.pathname.includes('cart.html')) {
    renderCart();
  }
});

// Toast notification function
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

// Add to Cart
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

// Update Cart Badge
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

// Auth Handlers
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
    const response = await fetch('/api/login', {
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
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showToast('Registration successful! please login.');
      setTimeout(() => {
        toggleAuth('login');
        // Pre-fill email for convenience
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

function saveCart() {
  localStorage.setItem('foodAppCart', JSON.stringify(cart));
}

// Cart Page Logic
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
  
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax + 40; // 40 delivery fee
  
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

// Complete Order logic communicating with backend
async function placeOrder(event) {
  event.preventDefault();
  
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  const userString = localStorage.getItem('foodAppUser');
  let userId = 1; // Fallback to user ID 1 (Tanisha) if details missing somehow
  if (userString) {
    const user = JSON.parse(userString);
    if (user.id) userId = user.id;
  }

  try {
    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, cart: cart })
    });

    const data = await response.json();

    if (response.ok) {
      clearCart();
      window.location.href = 'order-confirmation.html';
    } else {
      showToast(data.error || 'Failed to place order');
    }
  } catch (error) {
    showToast('Failed to connect to the server');
    console.error(error);
  }
}

// Clear Cart logic for order confirmation
function clearCart() {
  cart = [];
  saveCart();
}

// Menu filtering and searching
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const filterChips = document.querySelectorAll('.filter-chip');
  const foodCards = document.querySelectorAll('.food-card');

  if (searchInput && filterChips.length > 0 && foodCards.length > 0) {
    // Search functionality
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      // Reset filter to 'All' when searching
      filterChips.forEach(c => c.classList.remove('active'));
      const allFilter = Array.from(filterChips).find(c => c.getAttribute('data-filter') === 'All');
      if (allFilter) allFilter.classList.add('active');
      
      foodCards.forEach(card => {
        const titleElement = card.querySelector('.food-card-title');
        if (titleElement) {
          const title = titleElement.textContent.toLowerCase();
          if (title.includes(searchTerm)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      });
    });

    // Category filtering
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        // Update active class
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        // Clear search input
        if (searchInput.value !== '') {
          searchInput.value = '';
        }

        const filter = chip.getAttribute('data-filter');

        foodCards.forEach(card => {
          if (filter === 'All') {
            card.style.display = 'block';
          } else {
            const category = card.getAttribute('data-category');
            if (category === filter) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });
  }
});
