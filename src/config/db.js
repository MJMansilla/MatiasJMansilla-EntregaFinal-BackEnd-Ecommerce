const mongoose = require("mongoose");
async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { dbName: "ecommerce" });
    console.log("[Mongo] Conectado");
  } catch (err) {
    console.error("[Mongo] Error de conexión:", err.message);
    process.exit(1);
  }
}
module.exports = { connectDB };
