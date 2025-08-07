const fs = require("fs");
const path = require("path");

class CartManager {
    static rutaDatos = path.join(__dirname, "../data/carts.json");

    static async getCarts() {
        if (fs.existsSync(this.rutaDatos)) {
            return JSON.parse(await fs.promises.readFile(this.rutaDatos, "utf-8"));
        } else {
            return [];
        }
    }

    static async getCartById(id) {
        const carritos = await this.getCarts();
        return carritos.find(c => c.id == id) || null;
    }

    static async createCart() {
        const carritos = await this.getCarts();
        const id = carritos.length > 0 ? Math.max(...carritos.map(c => c.id)) + 1 : 1;

        const nuevoCarrito = {
            id,
            products: []
        };

        carritos.push(nuevoCarrito);
        await fs.promises.writeFile(this.rutaDatos, JSON.stringify(carritos, null, 2));
        return nuevoCarrito;
    }

    static async addProductToCart(cartId, productId) {
        const carritos = await this.getCarts();
        const index = carritos.findIndex(c => c.id == cartId);
        if (index === -1) return null;

        const carrito = carritos[index];
        const productoExistente = carrito.products.find(p => p.product == productId);

        if (productoExistente) {
            productoExistente.quantity += 1;
        } else {
            carrito.products.push({ product: productId, quantity: 1 });
        }

        await fs.promises.writeFile(this.rutaDatos, JSON.stringify(carritos, null, 2));
        return carrito;
    }
}

module.exports = { CartManager };
