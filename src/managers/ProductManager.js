import Product from "../models/Product.js";

export default class ProductManager {
  async getPaginated({ limit = 10, page = 1, sort, query, baseUrl = "" }) {
    limit = isNaN(parseInt(limit)) ? 10 : Math.max(1, parseInt(limit));
    page = isNaN(parseInt(page)) ? 1 : Math.max(1, parseInt(page));

    const filter = {};
    if (query) {
      if (query.startsWith("category:")) {
        filter.category = query.split("category:")[1];
      } else if (query.startsWith("status:")) {
        const val = query.split("status:")[1];
        filter.status = val === "true";
      } else {
        filter.category = query;
      }
    }

    let sortOption = {};
    if (sort) {
      if (sort === "asc") sortOption = { price: 1 };
      else if (sort === "desc") sortOption = { price: -1 };
    }

    const result = await Product.paginate(filter, {
      limit,
      page,
      sort: sortOption,
      lean: true,
    });

    // Links de paginación
    const queryParams = (overrides = {}) => {
      const params = new URLSearchParams({
        limit,
        page,
        ...(sort ? { sort } : {}),
        ...(query ? { query } : {}),
        ...overrides,
      });
      return `${baseUrl}?${params.toString()}`;
    };

    return {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? queryParams({ page: result.prevPage })
        : null,
      nextLink: result.hasNextPage
        ? queryParams({ page: result.nextPage })
        : null,
    };
  }

  async getAllLean() {
    return Product.find().lean();
  }

  async getById(id) {
    const p = await Product.findById(id).lean();
    if (!p) throw new Error("Producto no encontrado");
    return p;
  }

  async create(data) {
    const required = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];
    for (const field of required) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        const err = new Error(`Falta el campo requerido: ${field}`);
        err.status = 400;
        throw err;
      }
    }
    if (data.price < 0) {
      const err = new Error("El precio no puede ser negativo");
      err.status = 400;
      throw err;
    }
    if (data.stock < 0) {
      const err = new Error("El stock no puede ser negativo");
      err.status = 400;
      throw err;
    }
    const created = await Product.create(data);
    return created.toObject();
  }

  async update(id, data) {
    if (data?.price !== undefined && data.price < 0) {
      const err = new Error("El precio no puede ser negativo");
      err.status = 400;
      throw err;
    }
    if (data?.stock !== undefined && data.stock < 0) {
      const err = new Error("El stock no puede ser negativo");
      err.status = 400;
      throw err;
    }
    const updated = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async delete(id) {
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      throw err;
    }
    return deleted;
  }
}
