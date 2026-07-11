export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response("OK", { headers: corsHeaders });
    }

    // ============================================================
    // ROUTES
    // ============================================================

    // ---------------------------
    // GET MENU
    // ---------------------------
    if (path === "/api/menu" && request.method === "GET") {
      const menu = [
        { id: 1, name: "Nyama Choma", price: 14.99 },
        { id: 2, name: "Pilau ya Nyama", price: 12.99 },
        { id: 3, name: "Mandazi", price: 4.99 }
      ];

      return json(menu, corsHeaders);
    }

    // ---------------------------
    // GET DRINKS
    // ---------------------------
    if (path === "/api/drinks" && request.method === "GET") {
      const drinks = [
        { id: 1, name: "Coca-Cola", price: 2.99 },
        { id: 2, name: "Fanta Passion", price: 3.49 },
        { id: 3, name: "Mango Juice", price: 4.49 }
      ];

      return json(drinks, corsHeaders);
    }

    // ---------------------------
    // PLACE ORDER
    // ---------------------------
    if (path === "/api/order" && request.method === "POST") {
      const body = await request.json();

      // Save order to D1 (if you want)
      if (env.DB) {
        await env.DB.prepare(
          "INSERT INTO orders (name, items, total) VALUES (?, ?, ?)"
        ).bind(body.name, JSON.stringify(body.items), body.total).run();
      }

      return json({ success: true, message: "Order received!" }, corsHeaders);
    }

    // ---------------------------
    // ADMIN NOTIFICATION
    // ---------------------------
    if (path === "/api/admin/notify" && request.method === "POST") {
      const body = await request.json();

      // Example: send to Discord webhook
      if (env.WEBHOOK_URL) {
        await fetch(env.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `New order from ${body.name}: $${body.total}`
          })
        });
      }

      return json({ sent: true }, corsHeaders);
    }

    // ---------------------------
    // FALLBACK
    // ---------------------------
    return new Response("Not Found", { status: 404 });
  }
};

// ============================================================
// JSON RESPONSE HELPER
// ============================================================
function json(data, headers) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}
