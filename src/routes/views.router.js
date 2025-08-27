const express = require('express');
const router = express.Router();
const ProductManager = require('../dao/ProductManager');

// Home -> lista de productos
router.get('/', async (req, res) => {
  const productos = await ProductManager.getProducts();
  res.render('home', { productos });
});

// Alias explícito: /products
router.get('/products', async (req, res) => {
  const productos = await ProductManager.getProducts();
  res.render('home', { productos });
});

// Realtime (minúscula)
router.get('/realtimeproducts', async (req, res) => {
  const productos = await ProductManager.getProducts();
  res.render('realTimeProducts', { productos });
});

// Alias con mayúscula
router.get('/realtimeProducts', async (req, res) => {
  const productos = await ProductManager.getProducts();
  res.render('realTimeProducts', { productos });
});

module.exports = router;
