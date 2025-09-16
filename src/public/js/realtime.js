const socket = io();
socket.on("productos", (productos) => {
  const ul = document.getElementById("lista-productos");
  ul.innerHTML = "";
  productos.forEach((p) => {
    const li = document.createElement("li");
    li.setAttribute("data-id", p._id);
    li.innerHTML = `${p.title} — $${p.price} <button onclick="eliminarProducto('${p._id}')">Eliminar</button>`;
    ul.appendChild(li);
  });
});
document.getElementById("form-producto").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.price = Number(data.price);
  data.stock = Number(data.stock);
  socket.emit("nuevoProducto", data);
  e.target.reset();
});
function eliminarProducto(id) {
  socket.emit("eliminarProducto", id);
}
