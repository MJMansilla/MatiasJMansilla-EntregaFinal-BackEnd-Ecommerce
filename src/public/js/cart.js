async function removeFromCart(cid, pid) {
  if (!confirm("¿Eliminar producto del carrito?")) return;
  const res = await fetch(`/api/carts/${cid}/products/${pid}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (res.ok && data.status === "success") location.reload();
  else alert(data.error || "Error eliminando.");
}

async function emptyCart(cid) {
  if (!confirm("¿Vaciar carrito?")) return;
  const res = await fetch(`/api/carts/${cid}`, { method: "DELETE" });
  const data = await res.json();
  if (res.ok && data.status === "success") location.reload();
  else alert(data.error || "Error vaciando.");
}

async function updateQty(ev, cid, pid) {
  ev.preventDefault();
  const form = ev.target;
  const quantity = parseInt(form.quantity.value);
  const res = await fetch(`/api/carts/${cid}/products/${pid}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json();
  if (res.ok && data.status === "success") location.reload();
  else alert(data.error || "Error actualizando.");
  return false;
}
