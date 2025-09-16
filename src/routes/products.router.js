const express = require("express");
const router = express.Router();
const ProductManager = require("../dao/ProductManager");
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query, category, status } = req.query;
    const lim = Math.max(parseInt(limit) || 10, 1);
    const pg = Math.max(parseInt(page) || 1, 1);
    let filter = {};
    if (category) filter.category = category;
    if (status !== undefined) filter.status = String(status) === "true";
    if (query) {
      const [k, v] = String(query).split(":");
      if (k && v !== undefined) {
        if (k === "category") filter.category = v;
        if (k === "status") filter.status = String(v) === "true";
      }
    }
    let sortObj = {};
    if (sort === "asc") sortObj.price = 1;
    else if (sort === "desc") sortObj.price = -1;
    const total = await ProductManager.count(filter);
    const totalPages = Math.max(Math.ceil(total / lim), 1);
    const validPage = Math.min(pg, totalPages);
    const payload = await ProductManager.getProducts(filter, {
      sort: sortObj,
      skip: (validPage - 1) * lim,
      limit: lim,
    });
    const hasPrevPage = validPage > 1;
    const hasNextPage = validPage < totalPages;
    const base = "/api/products";
    const q = new URLSearchParams();
    q.set("limit", lim);
    if (sort) q.set("sort", sort);
    if (query) q.set("query", query);
    if (category) q.set("category", category);
    if (status !== undefined) q.set("status", status);
    const prevLink = hasPrevPage
      ? `${base}?${new URLSearchParams({
          ...Object.fromEntries(q),
          page: validPage - 1,
        })}`
      : null;
    const nextLink = hasNextPage
      ? `${base}?${new URLSearchParams({
          ...Object.fromEntries(q),
          page: validPage + 1,
        })}`
      : null;
    res.json({
      status: "success",
      payload,
      totalPages,
      prevPage: hasPrevPage ? validPage - 1 : null,
      nextPage: hasNextPage ? validPage + 1 : null,
      page: validPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (e) {
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
});
router.get("/:pid", async (req, res) => {
  try {
    const p = await ProductManager.getById(req.params.pid);
    if (!p)
      return res.status(404).json({ status: "error", error: "Not found" });
    res.json({ status: "success", payload: p });
  } catch {
    res.status(400).json({ status: "error", error: "Invalid id" });
  }
});
router.post("/", async (req, res) => {
  try {
    const d = await ProductManager.create(req.body);
    res.status(201).json({ status: "success", payload: d });
  } catch (e) {
    res.status(400).json({ status: "error", error: e.message });
  }
});
router.put("/:pid", async (req, res) => {
  try {
    const d = await ProductManager.update(req.params.pid, req.body);
    if (!d)
      return res.status(404).json({ status: "error", error: "Not found" });
    res.json({ status: "success", payload: d });
  } catch {
    res.status(400).json({ status: "error", error: "Invalid id" });
  }
});
router.delete("/:pid", async (req, res) => {
  try {
    const r = await ProductManager.delete(req.params.pid);
    if (!r)
      return res.status(404).json({ status: "error", error: "Not found" });
    res.json({ status: "success" });
  } catch {
    res.status(400).json({ status: "error", error: "Invalid id" });
  }
});
module.exports = router;
