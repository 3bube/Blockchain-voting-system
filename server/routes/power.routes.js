import express from "express";
import {
  savePowerStatus,
  getPowerStatus,
  getPowerStatusHistory,
  getAllDevices
} from "../controllers/power.controller.js";
const router = express.Router();

// Power status endpoints
router.post("/power-status", savePowerStatus);
router.get("/power-status", (req, res) => {
  // Set main-system as the default device_id
  req.params.device_id = "main-system";
  getPowerStatus(req, res);
});
router.get("/power-status/:device_id", getPowerStatus);

// Power status history endpoints for auditing
router.get("/power-status/history", (req, res) => {
  // Set main-system as the default device_id
  req.params.device_id = "main-system";
  getPowerStatusHistory(req, res);
});
router.get("/power-status/:device_id/history", getPowerStatusHistory);
router.get("/power-status-devices", getAllDevices);

export default router;
