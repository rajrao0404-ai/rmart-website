export async function onRequestGet({ env }) {
  return new Response(JSON.stringify({ key_id: env.RAZORPAY_KEY_ID || "" }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
