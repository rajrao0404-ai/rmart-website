function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestPost({ request, env }) {
  if (!env.RAZORPAY_KEY_SECRET) return json({ error: "Payment gateway is not configured." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
  if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => typeof v === "string" && v.length)) {
    return json({ error: "Missing payment verification fields." }, 400);
  }
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
    const expected = toHex(digest);
    if (expected.length !== razorpay_signature.length) return json({ verified: false, error: "Payment signature mismatch." }, 400);
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ razorpay_signature.charCodeAt(i);
    if (diff !== 0) return json({ verified: false, error: "Payment signature mismatch." }, 400);
    return json({ verified: true });
  } catch {
    return json({ error: "Could not verify payment." }, 500);
  }
}
