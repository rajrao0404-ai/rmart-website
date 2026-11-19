function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json({ error: "Payment gateway is not configured yet." }, 503);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount < 100) {
    return json({ error: "Minimum payment amount is ₹1." }, 400);
  }
  const receipt = String(body.receipt || `RM${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  try {
    const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount, currency: "INR", receipt })
    });
    const result = await response.json();
    if (!response.ok) {
      const status = response.status === 401 ? 401 : 500;
      return json({ error: result.error?.description || "Could not create payment order." }, status);
    }
    return json({ order_id: result.id, amount: result.amount, currency: result.currency });
  } catch {
    return json({ error: "Payment gateway is temporarily unavailable." }, 500);
  }
}
