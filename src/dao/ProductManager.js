const fs = require("fs");
const path = require("path");

class ProductManager {
  static dataPath = path.join(__dirname, "../data/products.json");

  static async _ensureFile() {
    if (!fs.existsSync(this.dataPath)) {
      await fs.promises.mkdir(path.dirname(this.dataPath), { recursive: true });
      await fs.promises.writeFile(this.dataPath, "[]", "utf-8");
    }
  }

  static async getProducts() {
    await this._ensureFile();
    const raw = await fs.promises.readFile(this.dataPath, "utf-8");
    try { return JSON.parse(raw); } catch { return []; }
  }

  static async getProductById(id) {
    const productos = await this.getProducts();
    return productos.find(p => String(p.id) === String(id)) || null;
  }

  static async addProduct(data) {
    const required = ["title","description","code","price","stock","category"];
    for (const k of required) {
      if (data[k] === undefined || data[k] === null || data[k] === "") {
        throw new Error(`Campo requerido faltante: ${k}`);
      }
    }
    const productos = await this.getProducts();
    const maxId = productos.reduce((m,p)=> Math.max(m, Number(p.id)||0), 0);
    const nuevo = {
      id: maxId + 1,
      status: data.status !== undefined ? !!data.status : true,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
    };
    productos.push(nuevo);
    await fs.promises.writeFile(this.dataPath, JSON.stringify(productos, null, 2));
    return nuevo;
  }

  static async updateProduct(id, data) {
    const productos = await this.getProducts();
    const idx = productos.findIndex(p => String(p.id) == String(id));
    if (idx === -1) return null;
    const current = productos[idx];
    const merged = {
      ...current,
      ...data,
      id: current.id,
      price: data.price !== undefined ? Number(data.price) : current.price,
      stock: data.stock !== undefined ? Number(data.stock) : current.stock,
    };
    productos[idx] = merged;
    await fs.promises.writeFile(this.dataPath, JSON.stringify(productos, null, 2));
    return merged;
  }

  static async deleteProduct(id) {
    const productos = await this.getProducts();
    const nuevos = productos.filter(p => String(p.id) !== String(id));
    await fs.promises.writeFile(this.dataPath, JSON.stringify(nuevos, null, 2));
    return true;
  }
}

module.exports = ProductManager;
