const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");

const viewsRouter = require("./routes/views.router");
const productsRouter = require("./routes/products.router");
let cartsRouter;
try {
  cartsRouter = require("./routes/carts.router");
} catch {
  cartsRouter = null;
}

const ProductManager = require("./dao/ProductManager");

const app = express();
const PORT = process.env.PORT || 8080;

const MONGO_URI =
  "mongodb+srv://coder:codercoder@cluster0.olj5ktk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const conectarDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Mongo] Conectado a Atlas");
  } catch (err) {
    console.error("[Mongo] Error de conexión:", err.message);
    process.exit(1);
  }
};

conectarDB();

app.set("case sensitive routing", false);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
if (cartsRouter) app.use("/api/carts", cartsRouter);

const httpServer = app.listen(PORT, () =>
  console.log(`Server http://localhost:${PORT}`)
);
const io = new Server(httpServer);

io.on("connection", async (socket) => {
  console.log("[io] Cliente conectado:", socket.id);

  try {
    socket.emit(
      "productos",
      await ProductManager.getProducts({}, { limit: 50 })
    );
  } catch (e) {
    socket.emit("errorProducto", "No se pudo cargar el listado inicial");
  }

  socket.on("nuevoProducto", async (prod) => {
    try {
      await ProductManager.create(prod);
      io.emit("productos", await ProductManager.getProducts({}, { limit: 50 }));
      socket.emit("productoCreado", "Producto creado ok");
    } catch (e) {
      socket.emit("errorProducto", e?.message || "Error al crear");
    }
  });

  socket.on("eliminarProducto", async (id) => {
    try {
      await ProductManager.delete(id);
      io.emit("productos", await ProductManager.getProducts({}, { limit: 50 }));
    } catch (e) {
      socket.emit("errorProducto", e?.message || "Error al eliminar");
    }
  });
});

module.exports = app;
