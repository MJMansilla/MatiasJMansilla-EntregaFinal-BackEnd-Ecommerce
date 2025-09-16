import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const pm = new ProductManager();

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const baseUrl = `${req.baseUrl}`; // '/api/products'
    const result = await pm.getPaginated({ limit, page, sort, query, baseUrl });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res, next) => {
  try {
    const prod = await pm.getById(req.params.pid);
    res.json({ status: "success", payload: prod });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post("/", async (req, res, next) => {
  try {
    const created = await pm.create(req.body);
    res.status(201).json({ status: "success", payload: created });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res, next) => {
  try {
    const updated = await pm.update(req.params.pid, req.body);
    res.json({ status: "success", payload: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res, next) => {
  try {
    const deleted = await pm.delete(req.params.pid);
    res.json({ status: "success", payload: deleted });
  } catch (err) {
    next(err);
  }
});

export default router;
