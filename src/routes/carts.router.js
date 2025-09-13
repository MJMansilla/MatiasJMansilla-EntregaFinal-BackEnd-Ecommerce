const express = require('express');
const router = express.Router();
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Crear carrito (helper)
router.post('/', async (req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: cart });
  } catch (e) {
    res.status(500).json({ status: 'error', error: 'Internal error' });
  }
});

// GET /api/carts/:cid => populate
router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
    res.json({ status: 'success', payload: cart });
  } catch (e) {
    res.status(400).json({ status: 'error', error: 'Invalid id' });
  }
});

// PUT /api/carts/:cid => reemplazar array completo de productos
// body: { products: [{ product: <pid>, quantity: N }, ...] }
router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', error: 'products must be an array' });
    }
    // validar productos existentes
    const ids = products.map(p => p.product);
    const found = await Product.find({ _id: { $in: ids } }, '_id');
    if (found.length !== ids.length) {
      return res.status(400).json({ status: 'error', error: 'Some product ids are invalid' });
    }
    const normalized = products.map(p => ({ product: p.product, quantity: Math.max(Number(p.quantity)||1, 1) }));
    const cart = await Cart.findByIdAndUpdate(
      req.params.cid,
      { products: normalized },
      { new: true }
    ).populate('products.product');
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
    res.json({ status: 'success', payload: cart });
  } catch (e) {
    res.status(400).json({ status: 'error', error: 'Invalid id' });
  }
});

// PUT /api/carts/:cid/products/:pid => setear cantidad
// body: { quantity: N }
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const qty = Math.max(Number(req.body.quantity)||1, 1);
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });

    const idx = cart.products.findIndex(p => String(p.product) === String(req.params.pid));
    if (idx === -1) {
      // si no existe, lo agrega
      cart.products.push({ product: req.params.pid, quantity: qty });
    } else {
      cart.products[idx].quantity = qty;
    }
    await cart.save();
    await cart.populate('products.product');
    res.json({ status: 'success', payload: cart });
  } catch (e) {
    res.status(400).json({ status: 'error', error: 'Invalid id' });
  }
});

// DELETE /api/carts/:cid/products/:pid => elimina producto puntual
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
    cart.products = cart.products.filter(p => String(p.product) !== String(req.params.pid));
    await cart.save();
    res.json({ status: 'success' });
  } catch (e) {
    res.status(400).json({ status: 'error', error: 'Invalid id' });
  }
});

// DELETE /api/carts/:cid => vaciar carrito
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(req.params.cid, { products: [] }, { new: true });
    if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
    res.json({ status: 'success' });
  } catch (e) {
    res.status(400).json({ status: 'error', error: 'Invalid id' });
  }
});

module.exports = router;
