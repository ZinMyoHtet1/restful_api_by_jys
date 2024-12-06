import createError from "http-errors";
import Product from "../Models/Product.model.js";
import { productSchemaValidation } from "../Helpers/validation_schema.js";

Object.prototype.isEmpty = (object) =>
  !Object.keys(object).length && object.constructor === Object;

export default {
  getProducts: async (req, res, next) => {
    try {
      const products = await Product.find();
      res.send(products);
    } catch (error) {
      next(error);
    }
  },

  getProductById: async (req, res, next) => {
    try {
      const productId = req.params.id;
      if (!productId) throw createError.BadRequest();
      await Product.findOne({ _id: productId })
        .then((foundProduct) => res.send(foundProduct))
        .catch((error) => {
          throw createError.InternalServerError(error.message);
        });
    } catch (error) {
      next(error);
    }
  },

  postProduct: async (req, res, next) => {
    try {
      // const product = req.body;
      // if (Object.isEmpty(product)) throw createError.BadRequest();
      const result = await productSchemaValidation
        .validateAsync(req.body)
        .catch((err) => {
          throw createError.BadRequest(err.message);
        });

      const isExisted = await Product.findOne({ name: result.name });

      if (isExisted)
        throw createError.Conflict(`${result.name} has already uploaded.`);

      const savedProduct = await Product.create(result).catch((err) => {
        throw createError.InternalServerError(err.message);
      });

      res.send(savedProduct);
    } catch (error) {
      next(error);
    }
    // console.log(req.body);
  },

  deleteProduct: async (req, res, next) => {
    try {
      const productId = req.params.id;
      if (!productId) throw createError.BadRequest();

      await Product.deleteOne({ _id: productId })
        .then((result) => {
          res.send(result);
        })
        .catch((err) => {
          throw createError.InternalServerError(err.message);
        });
    } catch (err) {
      next(err);
    }
  },
};
