async function addToCart(ev, form) {
  ev.preventDefault();
  const cid = form.cid.value.trim();
  const pid = form.pid.value.trim();
  const quantity = parseInt(form.quantity.value || 1);

  try {
    const res = await fetch(`/api/carts/${cid}/product/${pid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success")
      throw new Error(data.error || "Error");
    alert("Producto agregado al carrito!");
    return false;
  } catch (err) {
    alert("Error: " + err.message);
    return false;
  }
}
