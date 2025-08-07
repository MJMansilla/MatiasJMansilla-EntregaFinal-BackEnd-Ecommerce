const express = require("express");
const router = express.Router();
const { ProductManager } = require("./ProductManager");

router.get("/", async (req, res) => {
    const productos = await ProductManager.getProducts();
    res.json(productos);
});

router.get("/:productId", async (req, res) => {
    const producto = await ProductManager.getProductById(req.params.productId);
    producto ? res.json(producto) : res.status(404).send("Producto no encontrado");
});

router.post("/", async (req, res) => {
    const nuevo = await ProductManager.addProduct(req.body);
    res.status(201).json(nuevo);
});

router.put("/:productId", async (req, res) => {
    const actualizado = await ProductManager.updateProduct(req.params.productId, req.body);
    actualizado ? res.json(actualizado) : res.status(404).send("Producto no encontrado");
});

router.delete("/:productId", async (req, res) => {
    await ProductManager.deleteProduct(req.params.productId);
    res.send("Producto eliminado");
});

module.exports = router;
