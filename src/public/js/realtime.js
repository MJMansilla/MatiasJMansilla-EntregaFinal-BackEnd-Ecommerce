const socket = io();

socket.on("productos", (productos) => {
  const lista = document.getElementById("lista-productos");
  lista.innerHTML = "";
  productos.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `${p.title} - $${p.price} <button onclick="eliminarProducto(${p.id})">Eliminar</button>`;
    li.setAttribute("data-id", p.id);
    lista.appendChild(li);
  });
});

document.getElementById("form-producto").addEventListener("submit", function(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.price = Number(data.price);
  data.stock = Number(data.stock);
  socket.emit("nuevoProducto", data);
  e.target.reset();
});

window.eliminarProducto = function(id) {
  socket.emit("eliminarProducto", id);
};
