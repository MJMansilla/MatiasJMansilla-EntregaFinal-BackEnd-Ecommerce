import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import CartManager from "../managers/CartManager.js";

const router = Router();
const pm = new ProductManager();
const cm = new CartManager();

// Vista de productos con paginación
router.get("/products", async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const baseUrl = "/products";
    const result = await pm.getPaginated({ limit, page, sort, query, baseUrl });

    res.render("index", {
      title: "Productos",
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// Detalle de producto
router.get("/products/:pid", async (req, res, next) => {
  try {
    const product = await pm.getById(req.params.pid);
    res.render("productDetail", { title: product.title, product });
  } catch (err) {
    next(err);
  }
});

// Vista realtime products
router.get("/realtimeproducts", async (req, res, next) => {
  try {
    res.render("realtime", { title: "Realtime Products" });
  } catch (err) {
    next(err);
  }
});

// Vista de carrito específico
router.get("/carts/:cid", async (req, res, next) => {
  try {
    const cart = await cm.getByIdPopulated(req.params.cid);
    res.render("cart", { title: `Carrito ${req.params.cid}`, cart });
  } catch (err) {
    next(err);
  }
});

// Home
router.get("/", (req, res) => {
  res.render("home", { title: "Inicio", message: "Bienvenid@ a la tienda!" });
});

export default router;
