import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

// Routers
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

// Managers (para sockets)
import ProductManager from "./managers/ProductManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

//HANDLEBARS
app.engine(
  "handlebars",
  engine({
    extname: ".handlebars",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

//CONEXIÓN A MONGO
async function connectMongo() {
  try {
    const MONGO_URL =
      "mongodb+srv://coder:codercoder@cluster0.zwizklb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(MONGO_URL);
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
}
await connectMongo();

//SOCKET.IO
io.on("connection", async (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);
  const pm = new ProductManager();

  // Enviar lista inicial
  try {
    const products = await pm.getAllLean();
    socket.emit("products", products);
  } catch (err) {
    console.error(
      "Error al obtener productos iniciales para sockets:",
      err.message
    );
  }

  // Crear producto desde el cliente
  socket.on("addProduct", async (data) => {
    try {
      const created = await pm.create(data);
      const products = await pm.getAllLean();
      io.emit("products", products); // Actualizar a todos
      socket.emit("productAdded", { ok: true, product: created });
    } catch (err) {
      socket.emit("productAdded", { ok: false, error: err.message });
    }
  });

  // Eliminar producto por id
  socket.on("deleteProduct", async (id) => {
    try {
      await pm.delete(id);
      const products = await pm.getAllLean();
      io.emit("products", products);
      socket.emit("productDeleted", { ok: true, id });
    } catch (err) {
      socket.emit("productDeleted", { ok: false, error: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 Cliente desconectado:", socket.id);
  });
});

//ROUTERS
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

//MANEJO DE ERRORES
app.use((err, req, res, next) => {
  console.error("🛑 Error no controlado:", err);
  const status = err.status || 500;
  res.status(status).json({
    status: "error",
    error: err.message || "Error interno del servidor",
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(` Server escuchando en http://localhost:${PORT}`);
});
