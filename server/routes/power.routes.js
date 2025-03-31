import express from "express";
import {
  savePowerStatus,
  getPowerStatus,
} from "../controllers/power.controller.js";
const router = express.Router();

router.post("/power-status", savePowerStatus);
router.get("/power-status/:device_id", getPowerStatus);

export default router;
