const socket = io();

const ul = document.getElementById("product-list");
const createForm = document.getElementById("create-form");
const deleteForm = document.getElementById("delete-form");

socket.on("products", (items) => {
  ul.innerHTML = "";
  items.forEach((p) => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `<div><strong>${p.title}</strong> — $${p.price} | Stock: ${
      p.stock
    } <div class="muted">${p.category} | ${
      p.status ? "Disponible" : "No disp."
    }</div></div><small>${p._id}</small>`;
    ul.appendChild(li);
  });
});

createForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(createForm);
  const data = Object.fromEntries(formData.entries());
  data.price = Number(data.price);
  data.stock = Number(data.stock);
  data.status = formData.get("status") === "on";
  socket.emit("addProduct", data);
  createForm.reset();
});

deleteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = new FormData(deleteForm).get("id");
  socket.emit("deleteProduct", id);
  deleteForm.reset();
});
