import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export default class CartManager {
  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart.toObject();
  }

  async getByIdPopulated(id) {
    const cart = await Cart.findById(id).populate("products.product").lean();
    if (!cart) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }
    return cart;
  }

  async addProduct(cid, pid, quantity = 1) {
    if (quantity <= 0) {
      const err = new Error("La cantidad debe ser mayor a 0");
      err.status = 400;
      throw err;
    }
    const prod = await Product.findById(pid);
    if (!prod) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      throw err;
    }
    const cart = await Cart.findById(cid);
    if (!cart) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }
    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx >= 0) {
      cart.products[idx].quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }
    await cart.save();
    return (await cart.populate("products.product")).toObject();
  }

  async removeProduct(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }
    cart.products = cart.products.filter((p) => p.product.toString() !== pid);
    await cart.save();
    return (await cart.populate("products.product")).toObject();
  }

  async replaceProducts(cid, productsArray) {
    if (!Array.isArray(productsArray)) {
      const err = new Error("El cuerpo debe contener un arreglo de productos");
      err.status = 400;
      throw err;
    }
    for (const item of productsArray) {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        const err = new Error(
          'Cada item debe tener "product" y "quantity" > 0'
        );
        err.status = 400;
        throw err;
      }
      const exists = await Product.exists({ _id: item.product });
      if (!exists) {
        const err = new Error(`Producto inexistente: ${item.product}`);
        err.status = 404;
        throw err;
      }
    }
    const cart = await Cart.findById(cid);
    if (!cart) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }
    cart.products = productsArray.map((it) => ({
      product: it.product,
      quantity: it.quantity,
    }));
    await cart.save();
    return (await cart.populate("products.product")).toObject();
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (!quantity || quantity <= 0) {
      const err = new Error("La cantidad debe ser mayor a 0");
      err.status = 400;
      throw err;
    }
    const cart = await Cart.findById(cid);
    if (!cart) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }
    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx < 0) {
      const err = new Error("El producto no está en el carrito");
      err.status = 404;
      throw err;
    }
    cart.products[idx].quantity = quantity;
    await cart.save();
    return (await cart.populate("products.product")).toObject();
  }

  async emptyCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }
    cart.products = [];
    await cart.save();
    return (await cart.populate("products.product")).toObject();
  }
}
