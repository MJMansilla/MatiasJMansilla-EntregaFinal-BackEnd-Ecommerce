const Product = require("../models/product.model");
class ProductManager {
  static async count(filter = {}) {
    return Product.countDocuments(filter);
  }
  static async getProducts(
    filter = {},
    { sort = {}, skip = 0, limit = 10 } = {}
  ) {
    return Product.find(filter).sort(sort).skip(skip).limit(limit).lean();
  }
  static async getById(id) {
    return Product.findById(id).lean();
  }
  static async create(data) {
    const required = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];
    for (const k of required) {
      if (data[k] === undefined || data[k] === "")
        throw new Error(`Campo requerido faltante: ${k}`);
    }
    return Product.create({
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      status: data.status !== undefined ? !!data.status : true,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
    });
  }
  static async update(id, data) {
    const u = { ...data };
    if (u.price !== undefined) u.price = Number(u.price);
    if (u.stock !== undefined) u.stock = Number(u.stock);
    return Product.findByIdAndUpdate(id, u, { new: true });
  }
  static async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}
module.exports = ProductManager;
