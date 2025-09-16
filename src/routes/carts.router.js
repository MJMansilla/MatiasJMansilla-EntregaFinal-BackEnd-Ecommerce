const express = require("express");
const router = express.Router();
const CartManager = require("../dao/CartManager");
router.post("/", async (req, res) => {
  try {
    const cart = await CartManager.create();
    res.status(201).json({ status: "success", payload: cart });
  } catch {
    res.status(500).json({ status: "error", error: "Internal error" });
  }
});
router.get("/:cid", async (req, res) => {
  try {
    const cart = await CartManager.getById(req.params.cid);
    if (!cart)
      return res.status(404).json({ status: "error", error: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch {
    res.status(400).json({ status: "error", error: "Invalid id" });
  }
});
router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products))
      return res
        .status(400)
        .json({ status: "error", error: "products must be an array" });
    const cart = await CartManager.replaceAll(req.params.cid, products);
    if (!cart)
      return res.status(404).json({ status: "error", error: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch (e) {
    res.status(400).json({ status: "error", error: e.message || "Invalid id" });
  }
});
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const qty = req.body.quantity;
    const cart = await CartManager.setQuantity(
      req.params.cid,
      req.params.pid,
      qty
    );
    if (!cart)
      return res.status(404).json({ status: "error", error: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch {
    res.status(400).json({ status: "error", error: "Invalid id" });
  }
});
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await CartManager.removeProduct(
      req.params.cid,
      req.params.pid
    );
    if (!cart)
      return res.status(404).json({ status: "error", error: "Cart not found" });
    res.json({ status: "success" });
  } catch {
    res.status(400).json({ status: "error", error: "Invalid id" });
  }
});
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await CartManager.clear(req.params.cid);
    if (!cart)
      return res.status(404).json({ status: "error", error: "Cart not found" });
    res.json({ status: "success" });
  } catch {
    res.status(400).json({ status: "error", error: "Invalid id" });
  }
});
module.exports = router;
