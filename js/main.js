/**
 * GENZPHOTO — Premium Photography & Camera Studio
 * Client-Side Business Logic & Controller
 * (Add to Cart, LocalStorage, WhatsApp Booking & Checkout)
 * ════════════════════════════════════════════════════════
 */

'use strict';

// ──────────────────────────────────────────────
// CONFIGURATION & CONSTANTS
// ──────────────────────────────────────────────
const CONFIG = {
  adminPhone: '6285761450850', // WhatsApp Admin Phone Number
  storageKey: 'genzphoto_cart_v1',
  currencyPrefix: 'Rp '
};

// ──────────────────────────────────────────────
// UTILITY: Format Number to Indonesian Rupiah
// ──────────────────────────────────────────────
function formatRupiah(number) {
  const num = typeof number === 'number' ? number : parseInt(number, 10) || 0;
  return CONFIG.currencyPrefix + num.toLocaleString('id-ID');
}

// ──────────────────────────────────────────────
// 1. SHOPPING CART (localStorage Engine)
// ──────────────────────────────────────────────
function getCart() {
  try {
    const raw = localStorage.getItem(CONFIG.storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read cart from localStorage:', err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(cart));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(product) {
  if (!product || !product.id) return;

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: parseInt(product.price, 10) || 0,
      image: product.image || 'images/cameras/sony-a6400.jpg',
      qty: 1
    });
  }

  saveCart(cart);
  showCartToast(product.name);
  bumpCartBadge();
}

function updateCartQty(productId, delta) {
  let cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === productId);

  if (itemIndex > -1) {
    cart[itemIndex].qty += delta;
    if (cart[itemIndex].qty <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart(cart);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function calculateCartItemCount(cart) {
  return cart.reduce((count, item) => count + item.qty, 0);
}

// ──────────────────────────────────────────────
// 2. CART UI: Badge & Drawer Rendering
// ──────────────────────────────────────────────
function updateCartBadge() {
  const cart = getCart();
  const totalCount = calculateCartItemCount(cart);
  const badgeEl = document.getElementById('cartBadge');

  if (badgeEl) {
    badgeEl.textContent = totalCount;
    badgeEl.style.display = totalCount > 0 ? 'flex' : 'none';
  }
}

function bumpCartBadge() {
  const badgeEl = document.getElementById('cartBadge');
  if (badgeEl) {
    badgeEl.classList.remove('bump');
    // Force reflow
    void badgeEl.offsetWidth;
    badgeEl.classList.add('bump');
  }
}

function renderCartDrawer() {
  const cart = getCart();
  const cartBody = document.getElementById('cartBody');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const cartHeaderCount = document.getElementById('cartItemCountHeader');
  const cartFooter = document.getElementById('cartFooter');

  if (!cartBody) return;

  const totalCount = calculateCartItemCount(cart);
  const grandTotal = calculateCartTotal(cart);

  if (cartHeaderCount) {
    cartHeaderCount.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'items'}`;
  }

  if (cartTotalPrice) {
    cartTotalPrice.textContent = formatRupiah(grandTotal);
  }

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">
          <i class="fa-solid fa-camera"></i>
        </div>
        <h4>Your Cart is Empty</h4>
        <p>Explore our premium cameras and gear to add items to your cart.</p>
        <button id="browseCamerasBtn" class="btn btn-gold btn-browse-cameras">
          <i class="fa-solid fa-bag-shopping"></i> Browse Cameras
        </button>
      </div>
    `;

    if (cartFooter) {
      cartFooter.style.display = 'none';
    }

    const browseBtn = document.getElementById('browseCamerasBtn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        closeCartDrawer();
        const shopSection = document.getElementById('shop');
        if (shopSection) {
          shopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
    return;
  }

  if (cartFooter) {
    cartFooter.style.display = 'flex';
  }

  let html = '';
  cart.forEach(item => {
    const itemSubtotal = item.price * item.qty;
    html += `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img-wrap">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/cameras/sony-a6400.jpg'" />
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <p class="cart-item-unit-price">${formatRupiah(item.price)} / unit</p>
          <div class="cart-item-controls">
            <div class="cart-qty-group">
              <button class="cart-qty-btn btn-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn btn-qty-plus" data-id="${item.id}" aria-label="Increase quantity">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
            <span class="cart-item-subtotal">${formatRupiah(itemSubtotal)}</span>
            <button class="cart-item-remove btn-item-remove" data-id="${item.id}" aria-label="Remove item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  cartBody.innerHTML = html;

  // Attach dynamic event listeners inside cart body
  cartBody.querySelectorAll('.btn-qty-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      updateCartQty(id, -1);
    });
  });

  cartBody.querySelectorAll('.btn-qty-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      updateCartQty(id, 1);
    });
  });

  cartBody.querySelectorAll('.btn-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      removeFromCart(id);
    });
  });
}

// ──────────────────────────────────────────────
// 3. CART DRAWER OPEN / CLOSE
// ──────────────────────────────────────────────
function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');

  renderCartDrawer();

  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');

  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ──────────────────────────────────────────────
// 4. TOAST NOTIFICATION
// ──────────────────────────────────────────────
let toastTimer = null;
function showCartToast(productName) {
  const toast = document.getElementById('cartToast');
  const toastMsg = document.getElementById('cartToastMsg');

  if (!toast) return;

  if (toastMsg) {
    toastMsg.textContent = `${productName} added to cart!`;
  }

  if (toastTimer) clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ──────────────────────────────────────────────
// 5. WHATSAPP CHECKOUT (CART)
// ──────────────────────────────────────────────
function checkoutViaWhatsApp() {
  const cart = getCart();

  if (!cart || cart.length === 0) {
    alert('Keranjang belanja Anda masih kosong.');
    return;
  }

  const grandTotal = calculateCartTotal(cart);

  let message = `Halo Admin GENZPHOTO,\nSaya ingin memesan / menyewa produk kamera berikut:\n\n`;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.qty;
    message += `${index + 1}. *${item.name}*\n   - Qty: ${item.qty} unit\n   - Harga: ${formatRupiah(item.price)}\n   - Subtotal: ${formatRupiah(subtotal)}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Total Perkiraan: ${formatRupiah(grandTotal)}*\n\n`;
  message += `Mohon info ketersediaan stok/unit, prosedur sewa/beli, dan detail pembayarannya. Terima kasih!`;

  const waUrl = `https://wa.me/${CONFIG.adminPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

// ──────────────────────────────────────────────
// 6. WHATSAPP DIRECT BOOKING (PACKAGES)
// ──────────────────────────────────────────────
function bookPackageViaWhatsApp(packageName, packagePrice) {
  const message = `Halo Admin GENZPHOTO,\nSaya ingin melakukan pemesanan paket *${packageName}* (${packagePrice}).\n\nMohon info ketersediaan tanggal dan jadwal sesinya. Terima kasih!`;
  const waUrl = `https://wa.me/${CONFIG.adminPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

// ──────────────────────────────────────────────
// 7. INITIALIZE ALL INTERACTIONS & LISTENERS
// ──────────────────────────────────────────────
function initCartListeners() {
  // Add to Cart buttons on Camera Cards
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const card = btn.closest('.camera-card');
      const id = btn.dataset.id || (card ? card.dataset.id : '') || 'camera-' + Date.now();
      const name = btn.dataset.name || (card ? card.dataset.name : '') || 'Camera';
      const price = btn.dataset.price || (card ? card.dataset.price : '') || 0;
      const image = btn.dataset.image || (card ? card.dataset.image : '') || 'images/cameras/sony-a6400.jpg';

      addToCart({ id, name, price, image });

      // Button visual feedback animation
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Added';
      btn.style.background = 'linear-gradient(135deg, #D4AF37, #F9A826)';
      btn.style.color = '#0A0A0A';

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.style.color = '';
      }, 1400);
    });
  });

  // Navbar Cart Button Toggle
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  // Cart Close Button
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', closeCartDrawer);
  }

  // Cart Overlay Click
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCartDrawer);
  }

  // Toast "View Cart" Button
  const toastViewBtn = document.getElementById('toastViewCartBtn');
  if (toastViewBtn) {
    toastViewBtn.addEventListener('click', () => {
      const toast = document.getElementById('cartToast');
      if (toast) toast.classList.remove('show');
      openCartDrawer();
    });
  }

  // Checkout via WhatsApp Button
  const checkoutWaBtn = document.getElementById('checkoutWaBtn');
  if (checkoutWaBtn) {
    checkoutWaBtn.addEventListener('click', checkoutViaWhatsApp);
  }

  // Clear Cart Button
  const clearCartBtn = document.getElementById('clearCartBtn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mengosongkan seluruh isi keranjang?')) {
        clearCart();
      }
    });
  }

  // Booking buttons for Pricing Packages (.btn-book-wa)
  document.querySelectorAll('.btn-book-wa').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const packageName = btn.dataset.package || 'Custom Package';
      const packagePrice = btn.dataset.price || 'Sesuai Kesepakatan';
      bookPackageViaWhatsApp(packageName, packagePrice);
    });
  });

  // Initialize Badge & render on load
  updateCartBadge();
}

// ──────────────────────────────────────────────
// 8. PAGE LOADER
// ──────────────────────────────────────────────
function initLoader() {
  const loader = document.getElementById('pageLoader');
  const percentEl = document.getElementById('loaderPercent');
  const barEl = document.querySelector('.loader-bar');

  if (!loader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 18) + 8;
    if (progress > 100) progress = 100;

    if (percentEl) percentEl.textContent = `${progress}%`;
    if (barEl) barEl.style.width = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
          if (loader.parentNode) loader.style.display = 'none';
        }, 700);
      }, 200);
    }
  }, 35);
}

// ──────────────────────────────────────────────
// 9. NAVBAR SCROLL & ACTIVE LINK
// ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

function handleNavbar() {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function updateActiveLink() {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const id = section.getAttribute('id');
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

window.addEventListener('scroll', () => {
  handleNavbar();
  updateActiveLink();
}, { passive: true });

// ──────────────────────────────────────────────
// 10. MOBILE MENU
// ──────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
    document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
  });

  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ──────────────────────────────────────────────
// 11. SCROLL REVEAL ANIMATIONS
// ──────────────────────────────────────────────
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => {
          el.classList.add('active');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

// ──────────────────────────────────────────────
// 12. ANIMATED COUNTERS
// ──────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1600;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

// ──────────────────────────────────────────────
// 13. HERO PARTICLES
// ──────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = Math.random() * 3 + 1;
    const left = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = Math.random() * 8 + 8;
    const opacity = Math.random() * 0.4 + 0.2;

    p.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      opacity: ${opacity};
    `;

    container.appendChild(p);
  }
}

// ──────────────────────────────────────────────
// 14. CURSOR GLOW
// ──────────────────────────────────────────────
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ──────────────────────────────────────────────
// 15. BACK TO TOP
// ──────────────────────────────────────────────
function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ──────────────────────────────────────────────
// 16. SMOOTH ANCHOR SCROLL
// ──────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ──────────────────────────────────────────────
// 17. 3D TILT EFFECT FOR CAMERA CARDS
// ──────────────────────────────────────────────
function initTiltEffect() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.camera-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xRot = ((y / rect.height) - 0.5) * 6;
      const yRot = ((x / rect.width) - 0.5) * -6;
      card.style.transform = `perspective(600px) rotateX(${xRot}deg) rotateY(${yRot}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
}

// ──────────────────────────────────────────────
// 18. ACCESSIBILITY (ESC Key)
// ──────────────────────────────────────────────
function initA11y() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      if (navLinksEl && navLinksEl.classList.contains('open')) {
        hamburger.classList.remove('open');
        navLinksEl.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
}

// ──────────────────────────────────────────────
// 19. INITIALIZATION
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  handleNavbar();
  updateActiveLink();
  initScrollReveal();
  initCounters();
  initParticles();
  initCursorGlow();
  initBackTop();
  initSmoothScroll();
  initTiltEffect();
  initCartListeners();
  initA11y();

  console.log(
    '%c GENZPHOTO %c Pure Client-Side E-Commerce & Booking Activated ',
    'background:#D4AF37;color:#0A0A0A;font-weight:800;padding:4px 8px;border-radius:3px 0 0 3px;font-family:monospace',
    'background:#1A1A1A;color:#D4AF37;font-weight:600;padding:4px 8px;border-radius:0 3px 3px 0;font-family:monospace'
  );
});

// Window resize handler
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navLinksEl && navLinksEl.classList.contains('open')) {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    document.body.style.overflow = '';
  }
});
