const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
class CartManager {
  static async create() {
    return Cart.create({ products: [] });
  }
  static async getById(cid) {
    return Cart.findById(cid).populate("products.product").lean();
  }
  static async replaceAll(cid, arr) {
    const ids = arr.map((p) => p.product);
    const found = await Product.find({ _id: { $in: ids } }, "_id");
    if (found.length !== ids.length)
      throw new Error("Algunos product IDs no existen");
    const norm = arr.map((p) => ({
      product: p.product,
      quantity: Math.max(Number(p.quantity) || 1, 1),
    }));
    return Cart.findByIdAndUpdate(
      cid,
      { products: norm },
      { new: true }
    ).populate("products.product");
  }
  static async setQuantity(cid, pid, qty) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;
    const q = Math.max(Number(qty) || 1, 1);
    const idx = cart.products.findIndex(
      (p) => String(p.product) === String(pid)
    );
    if (idx === -1) cart.products.push({ product: pid, quantity: q });
    else cart.products[idx].quantity = q;
    await cart.save();
    return cart.populate("products.product");
  }
  static async removeProduct(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;
    cart.products = cart.products.filter(
      (p) => String(p.product) !== String(pid)
    );
    await cart.save();
    return cart;
  }
  static async clear(cid) {
    return Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
  }
}
module.exports = CartManager;
