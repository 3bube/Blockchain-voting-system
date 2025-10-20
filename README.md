Authored by Amarachi Austin-Okoh

# Secure Blockchain Voting with IoT-Enabled Resilience – My Contributions

 This project delivers a blockchain-based voting system that ensures comprehensive electoral security (availability, backup, auditing, confidentiality, immutability) in Nigeria’s unstable power context, leveraging my IoT firmware expertise.

Co-developed with [Ebubechukwu Gabriel], who built the Node.js voting app and deployed Ethereum smart contracts. My firmware complemented his web app for a scalable solution.

##My Contributions
I spearheaded the firmware and IoT components, focusing on:
- **IoT Power Monitoring**: Developed ESP32 and ZMPT101B code (`esp32_firmware.py`) for real-time power monitoring, ensuring **availability** with 2-4s detection 
- **MQTT Integration**: Configured `voting/system/power/status` topic for **auditing**, 
- **System Resilience**: Integrated MongoDB for **backup** (zero data loss) and supported Ethereum for **confidentiality**/**immutability**
- **Testing**: Led tests validating all pillars,


- **Files**
can be found in folders titled esp_codes.


- **Contact**: [austinokoh2004@gmail.com] | GitHub: [amaraaustin]
