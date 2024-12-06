import express from "express";
import createError from "http-errors";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./Routes/Auth.route.js";
import productRoutes from "./Routes/Product.route.js";

import morgan from "morgan";
import "./Helpers/mongoose_init.js";
import { verifyAccessToken } from "./Helpers/jwt_helper.js";
import "./Helpers/redis_init.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", async (req, res) => {
  console.log(req.url, req.method);
  res.send("Response from API");
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);

app.use(async (req, res, next) => {
  //   const error = new Error("Not Found");
  //   error.status = 404;
  //   next(error);

  next(createError.NotFound("This route does not exist."));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Your server is running on port 3000")
);
