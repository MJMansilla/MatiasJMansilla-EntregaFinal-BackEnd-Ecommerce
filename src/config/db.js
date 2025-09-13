const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { dbName: 'ecommerce' });
    console.log('[Mongo] Connected');
  } catch (err) {
    console.error('[Mongo] Error:', err.message);
    process.exit(1); // evita que el server quede “vivo” si falla la DB
  }
}

module.exports = { connectDB };
