const fs = require("fs");
const path = require("path");

class ProductManager {
    static rutaDatos = path.join(__dirname, "../data/products.json");

    static async getProducts() {
        if (fs.existsSync(this.rutaDatos)) {
            return JSON.parse(await fs.promises.readFile(this.rutaDatos, "utf-8"));
        } else {
            return [];
        }
    }

    static async getProductById(id) {
        const productos = await this.getProducts();
        return productos.find(p => p.id == id) || null;
    }

    static async addProduct(data) {
        const productos = await this.getProducts();
        const id = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;

        const nuevoProducto = {
            id,
            title: data.title,
            description: data.description,
            code: data.code,
            price: data.price,
            status: data.status ?? true,
            stock: data.stock,
            category: data.category,
            thumbnails: data.thumbnails || []
        };

        productos.push(nuevoProducto);
        await fs.promises.writeFile(this.rutaDatos, JSON.stringify(productos, null, 2));
        return nuevoProducto;
    }

    static async updateProduct(id, data) {
        const productos = await this.getProducts();
        const index = productos.findIndex(p => p.id == id);
        if (index === -1) return null;

        productos[index] = { ...productos[index], ...data, id: productos[index].id };
        await fs.promises.writeFile(this.rutaDatos, JSON.stringify(productos, null, 2));
        return productos[index];
    }

    static async deleteProduct(id) {
        const productos = await this.getProducts();
        const nuevos = productos.filter(p => p.id != id);
        await fs.promises.writeFile(this.rutaDatos, JSON.stringify(nuevos, null, 2));
        return true;
    }
}

module.exports = { ProductManager };
