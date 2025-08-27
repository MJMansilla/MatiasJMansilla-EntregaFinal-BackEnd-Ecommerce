const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

const viewsRouter = require('./routes/views.router');
const productsRouter = require('./routes/products.router');
let cartsRouter;
try {
  cartsRouter = require('./routes/carts.router');
} catch { cartsRouter = null; }

const ProductManager = require('./dao/ProductManager');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routers
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
if (cartsRouter) app.use('/api/carts', cartsRouter);

// HTTP + Socket
const httpServer = app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
const io = new Server(httpServer);

// Socket.io con ProductManager
io.on('connection', async (socket) => {
  // Enviar productos al conectar
  socket.emit('productos', await ProductManager.getProducts());

  // Crear producto
  socket.on('nuevoProducto', async (producto) => {
    try {
      await ProductManager.addProduct(producto);
      io.emit('productos', await ProductManager.getProducts());
    } catch (e) {
      socket.emit('errorProducto', e.message || 'Error al crear producto');
    }
  });

  // Eliminar producto
  socket.on('eliminarProducto', async (id) => {
    await ProductManager.deleteProduct(id);
    io.emit('productos', await ProductManager.getProducts());
  });
});

module.exports = app;
