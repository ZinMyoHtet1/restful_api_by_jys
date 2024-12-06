import express from "express";
import productController from "../Controllers/Product.controller.js";

const route = express.Router();

route.get("/", productController.getProducts);

route.get("/:id", productController.getProductById);

route.post("/", productController.postProduct);

route.delete("/:id", productController.deleteProduct);

export default route;
