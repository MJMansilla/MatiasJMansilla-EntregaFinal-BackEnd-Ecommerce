async function ensureCart() {
  let cid = localStorage.getItem("cid");
  if (!cid) {
    const r = await fetch("/api/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const d = await r.json();
    if (d?.payload?._id) {
      cid = d.payload._id;
      localStorage.setItem("cid", cid);
    }
  }
  return cid;
}
async function addToCart(pid) {
  const cid = await ensureCart();
  await fetch(`/api/carts/${cid}/products/${pid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: 1 }),
  });
  alert("Agregado!");
}
async function removeFromCart(cid, pid) {
  await fetch(`/api/carts/${cid}/products/${pid}`, { method: "DELETE" });
  location.reload();
}
async function clearCart(cid) {
  await fetch(`/api/carts/${cid}`, { method: "DELETE" });
  location.reload();
}
