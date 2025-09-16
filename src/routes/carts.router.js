import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const cm = new CartManager();

// Crear carrito
router.post("/", async (req, res, next) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// Obtener carrito con populate
router.get("/:cid", async (req, res, next) => {
  try {
    const cart = await cm.getByIdPopulated(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// Agregar producto al carrito (cantidad opcional en body)
router.post("/:cid/product/:pid", async (req, res, next) => {
  try {
    const quantity = parseInt(req.body.quantity || 1);
    const cart = await cm.addProduct(req.params.cid, req.params.pid, quantity);
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE api/carts/:cid/products/:pid
router.delete("/:cid/products/:pid", async (req, res, next) => {
  try {
    const cart = await cm.removeProduct(req.params.cid, req.params.pid);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// PUT api/carts/:cid  (reemplaza arreglo de productos)
router.put("/:cid", async (req, res, next) => {
  try {
    const productsArray = req.body.products;
    const cart = await cm.replaceProducts(req.params.cid, productsArray);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// PUT api/carts/:cid/products/:pid  (solo cantidad)
router.put("/:cid/products/:pid", async (req, res, next) => {
  try {
    const quantity = parseInt(req.body.quantity);
    const cart = await cm.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      quantity
    );
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

// DELETE api/carts/:cid  (vaciar)
router.delete("/:cid", async (req, res, next) => {
  try {
    const cart = await cm.emptyCart(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (err) {
    next(err);
  }
});

export default router;
