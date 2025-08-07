const express = require("express");
const router = express.Router();
const { CartManager } = require("./CartManager");

router.post("/cart", async (req, res) => {
    const nuevo = await CartManager.createCart();
    res.status(201).json(nuevo);
});

router.get("/:cartId", async (req, res) => {
    const carrito = await CartManager.getCartById(req.params.cartId);
    carrito ? res.json(carrito.products) : res.status(404).send("Carrito no encontrado");
});

router.post("/:cartId/product/:productId", async (req, res) => {
    const actualizado = await CartManager.addProductToCart(req.params.cartId, req.params.productId);
    actualizado ? res.json(actualizado) : res.status(404).send("Carrito no encontrado");
});

module.exports = router;
