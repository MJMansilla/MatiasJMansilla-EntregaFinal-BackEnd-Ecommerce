const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query, category, status } = req.query;

    const lim = Math.max(parseInt(limit) || 10, 1);
    const pg = Math.max(parseInt(page) || 1, 1);

    let filter = {};
    if (category) filter.category = category;
    if (status !== undefined) filter.status = String(status) === 'true';
    if (query) {
      const [k, v] = String(query).split(':');
      if (k && v !== undefined) {
        if (k === 'category') filter.category = v;
        if (k === 'status') filter.status = String(v) === 'true';
      }
    }

    let sortObj = {};
    if (sort === 'asc') sortObj.price = 1;
    else if (sort === 'desc') sortObj.price = -1;

    const total = await Product.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);
    const validPage = Math.min(pg, totalPages);

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip((validPage - 1) * lim)
      .limit(lim)
      .lean();

    const hasPrevPage = validPage > 1;
    const hasNextPage = validPage < totalPages;

    const base = '/products';
    const q = new URLSearchParams();
    q.set('limit', lim);
    if (sort) q.set('sort', sort);
    if (query) q.set('query', query);
    if (category) q.set('category', category);
    if (status !== undefined) q.set('status', status);

    const prevLink = hasPrevPage ? `${base}?${new URLSearchParams({...Object.fromEntries(q), page: validPage - 1})}` : null;
    const nextLink = hasNextPage ? `${base}?${new URLSearchParams({...Object.fromEntries(q), page: validPage + 1})}` : null;

    res.render('products', {
      products,
      page: validPage,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (e) {
    res.status(500).send('Error rendering products');
  }
});

// Detalle
router.get('/products/:pid', async (req, res) => {
  try {
    const prod = await Product.findById(req.params.pid).lean();
    if (!prod) return res.status(404).send('Producto no encontrado');
    res.render('productDetail', { product: prod });
  } catch {
    res.status(400).send('Id inválido');
  }
});

// Vista del carrito
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.render('cart', { cart });
  } catch {
    res.status(400).send('Id inválido');
  }
});

module.exports = router;
