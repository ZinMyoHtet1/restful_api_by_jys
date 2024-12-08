import express from "express";
import authController from "../Controllers/Auth.controller.js";

const route = express.Router();

route.post("/register", authController.register);

route.post("/login", authController.login);

route.get("/refresh-token", authController.refresh_token);

route.delete("/logout", authController.logout);

route.post("/forget-password", authController.forgetPassword);

route.post("/verify-otp", authController.verifyOTP);

export default route;
