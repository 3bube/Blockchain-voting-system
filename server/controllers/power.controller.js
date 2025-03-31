import PowerStatus from "../models/power.models.js";

export const savePowerStatus = async (req, res) => {
  try {
    const { device_id, status, timestamp } = req.body;
    const newStatus = new PowerStatus({ device_id, status, timestamp });
    await newStatus.save();
    res.status(201).json({ message: "Power status saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPowerStatus = async (req, res) => {
  try {
    const { device_id } = req.params;
    const powerStatus = await PowerStatus.findOne({ device_id }).select(
      "status -_id"
    );
    res.status(200).json({ status: powerStatus ? powerStatus.status : null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
