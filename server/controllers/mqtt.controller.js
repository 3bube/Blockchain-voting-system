import mqtt from "mqtt";

class MqttController {
  constructor() {
    this.mqttOptions = {
      host: "cdacdd88136b4999a94c6947c602812b.s1.eu.hivemq.cloud",
      port: 8883,
      protocol: "mqtts", // secure
      username: "Test_connection",
      password: "Test*Connection1",
    };

    this.topics = {
      voltage: "esp32/voltage",
      powerCut: "esp32/power_cut_alert",
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

    return this;
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
    console.log("topic", topic);
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
