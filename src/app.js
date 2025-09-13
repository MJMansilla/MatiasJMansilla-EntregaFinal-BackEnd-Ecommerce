require('dotenv').config();
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { connectDB } = require('./config/db');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.set('case sensitive routing', false);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routers API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Vistas
app.use('/', viewsRouter);

// DB + Server
connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017');
app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
