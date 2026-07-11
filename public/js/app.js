// ============================================================
// TANZANIAN KITCHEN — FULL FRONTEND APP.JS
// Connected to Cloudflare Worker API
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.endsWith("menu.html")) {
    initMenuPage();
  } else if (path.endsWith("drinks.html")) {
    initDrinksPage();
  } else if (path.endsWith("order.html")) {
    initOrderPage();
  } else {
    initHomePage();
  }
});

// ============================================================
// API HELPERS
// ============================================================

async function apiGet(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`GET ${endpoint} failed`);
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`POST ${endpoint} failed`);
  return res.json();
}

// ============================================================
// HOME PAGE
// ============================================================

function initHomePage() {
  // You can add any home-specific JS here if needed
  console.log("Home page loaded");
}

// ============================================================
// MENU PAGE
// ============================================================

async function initMenuPage() {
  const container = document.getElementById("menu-list");
  if (!container) return;

  try {
    const menu = await apiGet("/api/menu");
    renderItems(container, menu, "food");
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load menu.</p>";
  }
}

// ============================================================
// DRINKS PAGE
// ============================================================

async function initDrinksPage() {
  const container = document.getElementById("drinks-list");
  if (!container) return;

  try {
    const drinks = await apiGet("/api/drinks");
    renderItems(container, drinks, "drink");
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load drinks.</p>";
  }
}

// ============================================================
// RENDER ITEMS (MENU + DRINKS)
// ============================================================

function renderItems(container, items, type) {
  container.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "popular-card";

    const name = document.createElement("h3");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = `$${item.price.toFixed(2)}`;

    const btn = document.createElement("button");
    btn.textContent = "Add to Order";
    btn.addEventListener("click", () => addToCart(item, type));

    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(btn);

    container.appendChild(card);
  });
}

// ============================================================
// ORDER CART (IN-MEMORY)
// ============================================================

const cart = {
  items: [],
  total: 0
};

function addToCart(item, type) {
  cart.items.push({
    id: item.id,
    name: item.name,
    price: item.price,
    type
  });

  cart.total += item.price;
  updateCartUI();
}

// ============================================================
// ORDER PAGE
// ============================================================

function initOrderPage() {
  const cartContainer = document.getElementById("order-items");
  const totalEl = document.getElementById("order-total");
  const form = document.getElementById("order-form");

  if (!cartContainer || !totalEl || !form) {
    console.warn("Order page missing required elements");
    return;
  }

  // Initial render
  updateCartUI();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";

    if (!name || cart.items.length === 0) {
      alert("Please enter your name and add at least one item.");
      return;
    }

    const orderPayload = {
      name,
      phone,
      items: cart.items,
      total: cart.total
    };

    try {
      const result = await apiPost("/api/order", orderPayload);
      console.log("Order result:", result);

      // Optional admin notify
      try {
        await apiPost("/api/admin/notify", {
          name,
          total: cart.total
        });
      } catch (notifyErr) {
        console.warn("Admin notify failed:", notifyErr);
      }

      alert("Your order has been placed! Thank you.");
      resetCart();
      form.reset();
      updateCartUI();
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    }
  });
}

// ============================================================
// CART UI
// ============================================================

function updateCartUI() {
  const cartContainer = document.getElementById("order-items");
  const totalEl = document.getElementById("order-total");

  if (!cartContainer || !totalEl) return;

  cartContainer.innerHTML = "";

  if (cart.items.length === 0) {
    cartContainer.innerHTML = "<p>No items in your order yet.</p>";
  } else {
    cart.items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-row";

      const name = document.createElement("span");
      name.textContent = item.name;

      const price = document.createElement("span");
      price.textContent = `$${item.price.toFixed(2)}`;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.style.marginLeft = "10px";
      removeBtn.addEventListener("click", () => removeFromCart(index));

      row.appendChild(name);
      row.appendChild(price);
      row.appendChild(removeBtn);

      cartContainer.appendChild(row);
    });
  }

  totalEl.textContent = `$${cart.total.toFixed(2)}`;
}

function removeFromCart(index) {
  const item = cart.items[index];
  cart.total -= item.price;
  cart.items.splice(index, 1);
  updateCartUI();
}

function resetCart() {
  cart.items = [];
  cart.total = 0;
}
