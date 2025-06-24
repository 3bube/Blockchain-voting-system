import mqtt from "mqtt";

class MqttController {
  constructor() {
    this.mqttOptions = {
      host: "2a1d26f5c5c74125b6db11f3b3cc7302.s1.eu.hivemq.cloud",
      port: 8883,
      protocol: "mqtts", // secure
      username: "3bube",
      password: "3Bube@10",
    };

    this.topics = {
      voltage: "esp32/voltage",
      powerCut: "esp32/power_cut_alert",
      status: "esp32/status",
      ups_time_remaining: "esp32/ups_time_remaining",
      ups_charge: "esp32/ups_charge_level",
    };

    this.mqttClient = null;
    this.messageHandlers = new Map();

    // Data storage (could be replaced with database integration)
    this.latestData = {
      voltage: null,
      powerCut: null,
    };
  }

  connect() {
    // Connect to MQTT broker
    this.mqttClient = mqtt.connect(this.mqttOptions);

    // When MQTT is connected
    this.mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Subscribe to topics
      const topicsToSubscribe = Object.values(this.topics);
      this.mqttClient.subscribe(topicsToSubscribe, (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log(`Subscribed to topics: ${topicsToSubscribe.join(", ")}`);
        }
      });
    });

    // Handle incoming messages
    this.mqttClient.on("message", this.handleMessage.bind(this));

    // Handle errors
    this.mqttClient.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });

    // Handle reconnection
    this.mqttClient.on("reconnect", () => {
      console.log("Attempting to reconnect to MQTT broker");
    });

    // Handle disconnection
    this.mqttClient.on("close", () => {
      console.log("Disconnected from MQTT broker");
    });

    // Handle power restore
    this.mqttClient.on("message", this.handlePowerRestore.bind(this));

    return this;
  }

  handlePowerRestore(topic, message) {
    if (topic === this.topics.powerCut && message.toString() === "power_restore") {
      console.log("MQTT: Power restored!");
      this.voteController.systemPowered = true;
      this.voteController.voltage = 230; // Assume normal voltage on restore

      // Sync any pending votes to blockchain after a short delay
      setTimeout(async () => {
        console.log("Attempting to sync pending votes after power restore...");
        try {
          // First check how many pending votes we have
          const Vote = require('../models/vote.models');
          const pendingVotes = await Vote.find({
            $or: [
              { voteId: { $regex: /^pending_/ } },
              { isPending: true },
              { syncedToBlockchain: false, status: "pending" }
            ]
          });
          console.log(`Found ${pendingVotes.length} pending votes before starting sync`);
          pendingVotes.forEach((vote, index) => {
            console.log(`[${index + 1}] ID: ${vote._id}, Title: ${vote.title}, voteId: ${vote.voteId}, isPending: ${vote.isPending}`);
          });
          
          // Now sync them
          const syncResult = await this.voteController.syncPendingVotes();
          console.log("Sync completed with result:", syncResult);

          // Broadcast power status update with sync stats
          this.voteController.broadcastPowerStatus({
            syncComplete: true,
            syncStats: syncResult.stats || {
              votesProcessed: pendingVotes.length,
              ballotsProcessed: 0,
              successfulBallots: 0,
              failedBallots: 0
            }
          });
        } catch (error) {
          console.error("Error during power restore sync:", error);
          this.voteController.broadcastPowerStatus({
            syncComplete: false,
            syncError: error.message
          });
        }
      }, 5000); // Give 5 seconds for systems to stabilize
    }
  }

  handleMessage(topic, message) {
    const msg = message.toString();
    console.log(`MQTT Message Received - Topic: ${topic}, Message: ${msg}`);

    // Store latest data
    if (topic === this.topics.voltage) {
      this.latestData.voltage = msg;
    } else if (topic === this.topics.powerCut) {
      this.latestData.powerCut = msg;
    }

    // Call any registered handlers for this topic
    if (this.messageHandlers.has(topic)) {
      const handlers = this.messageHandlers.get(topic);
      handlers.forEach((handler) => handler(msg));
    }
  }

  // Register a callback for a specific topic
  onMessage(topic, callback) {
    // console.log("topic", topic);
    if (!this.messageHandlers.has(topic)) {
      this.messageHandlers.set(topic, []);
    }
    this.messageHandlers.get(topic).push(callback);
  }

  // Publish a message to a topic
  publish(topic, message) {
    if (!this.mqttClient || !this.mqttClient.connected) {
      console.error("Cannot publish: MQTT client not connected");
      return false;
    }

    this.mqttClient.publish(topic, message);
    return true;
  }

  // Get latest data
  getLatestData() {
    return { ...this.latestData };
  }

  // Disconnect MQTT client
  disconnect() {
    if (this.mqttClient) {
      this.mqttClient.end();
      console.log("MQTT client disconnected");
    }
  }
}

export default new MqttController();
