import WebSocket, { WebSocketServer } from 'ws';
import MqttController from './mqtt.controller.js';
import http from 'http';

class WebSocketController {
  constructor() {
    this.wss = null;
    this.clients = new Set();
    this.port = process.env.WS_PORT || 8080;
  }

  initialize(server) {
    // Create WebSocket server
    try {
      console.log('Initializing WebSocket server...');
      this.wss = new WebSocketServer({ 
        server,
        // Allow all origins
        verifyClient: () => true
      });
      
      console.log(`WebSocket server successfully initialized`);

      // Handle new connections
      this.wss.on('connection', (ws, req) => {
        // Log connection information
        console.log(`New WebSocket client connected from ${req.socket.remoteAddress}`);
        this.clients.add(ws);

      // Send initial power status after a short delay to ensure connection is established
      setTimeout(() => {
        console.log('Sending initial power status to new client');
        this.sendPowerStatus(ws);
      }, 500);

      // Handle client disconnection
      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // Handle WebSocket server errors
    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
    
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
    }

    // Set up MQTT listeners for power status updates
    this.setupMqttListeners();
  }

  setupMqttListeners() {
    // Listen for power status updates from MQTT
    MqttController.onMessage('power/status', (message) => {
      try {
        const data = JSON.parse(message);
        this.broadcastPowerStatus(data);
      } catch (error) {
        console.error('Error parsing MQTT power status message:', error);
      }
    });

    // Listen for voltage updates
    MqttController.onMessage('esp32/voltage', (message) => {
      try {
        const voltage = parseFloat(message);
        const powerStatus = {
          voltage: voltage,
          timestamp: new Date().toISOString()
        };
        this.broadcastPowerStatus(powerStatus);
      } catch (error) {
        console.error('Error parsing voltage message:', error);
      }
    });

    // Listen for power cut alerts
    MqttController.onMessage('esp32/power_cut_alert', (message) => {
      try {
        const isPowerCut = message === 'true';
        const powerStatus = {
          powered: !isPowerCut,
          powerCut: isPowerCut,
          timestamp: new Date().toISOString(),
          message: isPowerCut 
            ? 'System is in offline mode. Votes will be stored locally and synced when power is restored.'
            : 'System is online and connected to blockchain'
        };
        this.broadcastPowerStatus(powerStatus);
      } catch (error) {
        console.error('Error parsing power cut alert message:', error);
      }
    });
  }

  // Send power status to a specific client
  sendPowerStatus(ws) {
    if (ws.readyState === WebSocket.OPEN) {
      const mqttData = MqttController.getLatestData();
      console.log('Sending power status to client, MQTT data:', mqttData);
      const powerStatus = {
        type: 'power_status',
        payload: {
          powered: !mqttData.powerCut || mqttData.powerCut !== 'true',
          voltage: mqttData.voltage ? parseFloat(mqttData.voltage) : null,
          powerCut: mqttData.powerCut === 'true',
          timestamp: new Date().toISOString(),
          message: mqttData.powerCut === 'true' 
            ? 'System is in offline mode. Votes will be stored locally and synced when power is restored.'
            : 'System is online and connected to blockchain'
        }
      };
      try {
        ws.send(JSON.stringify(powerStatus));
        console.log('Power status sent successfully');
      } catch (error) {
        console.error('Error sending power status to client:', error);
      }
    } else {
      console.log('WebSocket not ready, state:', ws.readyState);
    }
  }

  // Broadcast power status to all connected clients
  broadcastPowerStatus(statusData) {
    const message = {
      type: 'power_status',
      payload: {
        ...statusData,
        timestamp: statusData.timestamp || new Date().toISOString()
      }
    };

    this.broadcast(message);
  }

  // Broadcast a message to all connected clients
  broadcast(message) {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  // Create HTTP server and initialize WebSocket server
  createServer() {
    const server = http.createServer();
    this.initialize(server);
    
    server.listen(this.port, () => {
      console.log(`WebSocket HTTP server listening on port ${this.port}`);
    });
    
    return server;
  }
}

export default new WebSocketController();
