export const PRESET_FLOWS = [
  {
    name: "Normal HTTPS Browsing",
    description: "Standard encrypted TLS web traffic over port 443 with normal packet pacing and balanced payload.",
    category: "BENIGN",
    values: {
      "Destination Port": 443,
      "Flow Duration": 119196472,
      "Total Fwd Packets": 34,
      "Total Backward Packets": 31,
      "Total Length of Fwd Packets": 1399,
      "Total Length of Bwd Packets": 25555,
      "Flow Bytes/s": 226.13,
      "Flow Packets/s": 0.55,
      "Packet Length Mean": 408.39,
      "Average Packet Size": 414.68
    }
  },
  {
    name: "DDoS SYN Flood Attack",
    description: "Volumetric distributed denial of service attack saturating port 80 with high packet rates and low payloads.",
    category: "DDoS",
    values: {
      "Destination Port": 80,
      "Flow Duration": 45000000,
      "Total Fwd Packets": 250,
      "Total Backward Packets": 0,
      "Total Length of Fwd Packets": 15000,
      "Total Length of Bwd Packets": 0,
      "Flow Bytes/s": 333333.33,
      "Flow Packets/s": 5555.55,
      "Packet Length Mean": 60.0,
      "Average Packet Size": 60.0
    }
  },
  {
    name: "DoS Hulk Web Attack",
    description: "Application-layer HTTP request flood exhausting web server workers with anomalous payload volumes.",
    category: "DoS Hulk",
    values: {
      "Destination Port": 80,
      "Flow Duration": 97581823,
      "Total Fwd Packets": 7,
      "Total Backward Packets": 5,
      "Total Length of Fwd Packets": 324,
      "Total Length of Bwd Packets": 11595,
      "Flow Bytes/s": 122.14,
      "Flow Packets/s": 0.12,
      "Packet Length Mean": 916.85,
      "Average Packet Size": 993.25
    }
  },
  {
    name: "PortScan Reconnaissance Probe",
    description: "Zero-latency single-packet connection probes scanning open TCP ports across target subnets.",
    category: "PortScan",
    values: {
      "Destination Port": 8080,
      "Flow Duration": 85,
      "Total Fwd Packets": 1,
      "Total Backward Packets": 1,
      "Total Length of Fwd Packets": 0,
      "Total Length of Bwd Packets": 0,
      "Flow Bytes/s": 0.0,
      "Flow Packets/s": 23529.41,
      "Packet Length Mean": 0.0,
      "Average Packet Size": 0.0
    }
  },
  {
    name: "SSH-Patator Brute Force",
    description: "Automated credential dictionary attack making rapid iterative handshakes on SSH port 22.",
    category: "SSH-Patator",
    values: {
      "Destination Port": 22,
      "Flow Duration": 80,
      "Total Fwd Packets": 1,
      "Total Backward Packets": 1,
      "Total Length of Fwd Packets": 0,
      "Total Length of Bwd Packets": 0,
      "Flow Bytes/s": 0.0,
      "Flow Packets/s": 25000.0,
      "Packet Length Mean": 0.0,
      "Average Packet Size": 0.0
    }
  },
  {
    name: "Normal DNS Resolution",
    description: "Legitimate short-duration UDP/TCP domain name lookup queries over port 53.",
    category: "BENIGN",
    values: {
      "Destination Port": 53,
      "Flow Duration": 31328,
      "Total Fwd Packets": 2,
      "Total Backward Packets": 2,
      "Total Length of Fwd Packets": 68,
      "Total Length of Bwd Packets": 240,
      "Flow Bytes/s": 9831.46,
      "Flow Packets/s": 127.68,
      "Packet Length Mean": 68.4,
      "Average Packet Size": 85.5
    }
  }
];

