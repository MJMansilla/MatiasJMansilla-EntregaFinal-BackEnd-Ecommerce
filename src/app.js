require("dotenv").config();
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const { connectDB } = require("./config/db");
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views.router");
const app = express();
const PORT = process.env.PORT || 8080;
app.set("case sensitive routing", false);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
connectDB(process.env.MONGODB_URI || "mongodb://localhost:27017");
const httpServer = app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`);
});
const { Server } = require("socket.io");
const io = new Server(httpServer);
const ProductManager = require("./dao/ProductManager");
io.on("connection", async (socket) => {
  socket.emit("productos", await ProductManager.getProducts({}, { limit: 50 }));
  socket.on("nuevoProducto", async (prod) => {
    try {
      await ProductManager.create(prod);
      io.emit("productos", await ProductManager.getProducts({}, { limit: 50 }));
    } catch (e) {
      socket.emit("errorProducto", e.message || "Error al crear");
    }
  });
  socket.on("eliminarProducto", async (id) => {
    await ProductManager.delete(id);
    io.emit("productos", await ProductManager.getProducts({}, { limit: 50 }));
  });
});
module.exports = app;
