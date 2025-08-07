const express = require("express");
const app = express();
const productsRouter = require("./dao/products.router");
const cartsRouter = require("./dao/carts.router");

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.listen(8080, () => {
    console.log("Servidor escuchando en puerto 8080");
});
