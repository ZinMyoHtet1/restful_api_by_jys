import express from "express";

import mailerController from "../Controllers/Mailer.controller.js";

const router = express.Router();

router.get("/", mailerController.get);

router.post("/", mailerController.post);

export default router;
