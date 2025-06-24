import PowerStatus from "../models/power.models.js";

/**
 * Save a new power status entry for auditing purposes
 * Each status change creates a new document in the database
 */
export const savePowerStatus = async (req, res) => {
  try {
    const { device_id = "main-system", status, timestamp, metadata } = req.body;
    
    // Create a new status entry for audit purposes
    const newStatus = new PowerStatus({
      device_id, // Will use the provided device_id or default to "main-system" from schema
      status,
      timestamp: timestamp || Date.now(),
      metadata: metadata || {}
    });
    
    await newStatus.save();
    res.status(201).json({
      message: "Power status saved successfully",
      powerStatus: newStatus
    });
  } catch (error) {
    console.error("Error saving power status:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get the latest power status for a specific device
 */
export const getPowerStatus = async (req, res) => {
  try {
    const { device_id = "main-system" } = req.params;
    
    // Get the most recent status for the device
    const powerStatus = await PowerStatus.findOne({ device_id })
      .sort({ timestamp: -1 })
      .select("-__v");
      
    if (!powerStatus) {
      return res.status(404).json({ message: "No power status found for this device" });
    }
    
    res.status(200).json(powerStatus);
  } catch (error) {
    console.error("Error retrieving power status:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get power status history for a specific device
 */
export const getPowerStatusHistory = async (req, res) => {
  try {
    const { device_id } = req.params;
    const { limit = 50, skip = 0, startDate, endDate } = req.query;
    
    // Build query
    const query = { device_id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    // Get power status history with pagination
    const history = await PowerStatus.find(query)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .select("-__v");
      
    // Get total count for pagination
    const total = await PowerStatus.countDocuments(query);
    
    res.status(200).json({
      history,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: total > (Number(skip) + Number(limit))
      }
    });
  } catch (error) {
    console.error("Error retrieving power status history:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all device IDs that have power status records
 */
export const getAllDevices = async (req, res) => {
  try {
    // Get unique device IDs
    const devices = await PowerStatus.distinct("device_id");
    res.status(200).json({ devices });
  } catch (error) {
    console.error("Error retrieving devices:", error);
    res.status(500).json({ error: error.message });
  }
};
