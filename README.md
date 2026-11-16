# AegisGMM — Gaussian Mixture Model Network Anomaly Detection System
> **Unit 3 Machine Learning Mini-Project | Behavioral Intrusion & Anomaly Detection on CICIDS2017**

---

## 1. Project Overview & The Problem Solved

Traditional Intrusion Detection Systems (IDS) rely on static, signature-based rule engines. While effective for known CVE exploits, signature engines are fundamentally blind to **zero-day attacks, modified payloads, and polymorphic volumetric floods**.

This project implements an **unsupervised, density-based Network Anomaly Detection System** utilizing a **Gaussian Mixture Model (GMM)** trained with the **Expectation-Maximization (EM)** algorithm on the benchmark **CICIDS2017** network flow dataset.

### Key Machine Learning Design:
1. **Unsupervised Density Estimation**: Trained **strictly on normal (BENIGN) network traffic** ($X_{\text{fit}} = 23,949$ flows). The model learns the empirical probability distribution $p(x)$ of legitimate network communications without exposure to attack labels.
2. **Leakage-Free Preprocessing**: `StandardScaler` and a 4-component `PCA` are fitted exclusively on benign training flows, conserving **84.17% of total variance** while projecting 10-dimensional telemetry down to orthogonal latent components.
3. **Optimized Thresholding ($\tau = -1.2862$)**: The negative log-likelihood score $-\ln p(z) = -\text{score\_samples}(z)$ is evaluated against a validation threshold optimized to maximize $F_1$-score. Any flow with a score exceeding $-1.2862$ is flagged as an anomaly.
4. **Benchmark Verification**: Evaluated on an independent, held-out test split of **18,207 flows** (8,228 attacks across DDoS, DoS Hulk, PortScan, SSH-Patator, Botnets, and Web Attacks), achieving an outstanding **97.22% attack recall rate** (7,999 of 8,228 attacks detected).

---

## 2. Actual Notebook Performance Benchmark

| Evaluation Metric | **GMM (Primary Model)** | **K-Means (Baseline)** | Academic Interpretation |
|---|---|---|---|
| **Recall (Attack Capture)** | **97.22%** | 95.41% | Out of 8,228 actual attacks, GMM captures 7,999. In security, minimizing False Negatives is paramount. |
| **Precision** | **55.04%** | 53.86% | Probability that a flagged alert is a true intrusion. |
| **F1-Score** | **0.7029** | 0.6885 | Harmonic mean of precision and recall. |
| **Accuracy** | **62.86%** | 60.99% | Overall classification accuracy across balanced test split. |
| **ROC-AUC** | **0.6678** | 0.5886 | Ranking capability across continuous anomaly scores. |
| **Optimal Threshold ($\tau$)** | **-1.2862** | 0.5476 | Negative log-likelihood cut-off calibrated on validation set. |

### GMM Test Confusion Matrix (18,207 Flows):
- **True Negatives (Normal traffic passed)**: $3,446$
- **False Positives (Benign alerts flagged for triage)**: $6,533$
- **False Negatives (Missed attacks)**: **Only 229** (2.78% bypass rate)
- **True Positives (Intrusions stopped)**: **7,999**

---

## 3. 10 Network Flow Features Analyzed

| Feature | Unit | Semantic Description |
|---|---|---|
| `Destination Port` | Port # | Targeted network service port (e.g. 80 HTTP, 443 HTTPS, 22 SSH, 53 DNS) |
| `Flow Duration` | $\mu\text{s}$ | Microseconds elapsed between the first and last packet in the bidirectional flow |
| `Total Fwd Packets` | Packets | Count of packets transmitted from source to destination |
| `Total Backward Packets` | Packets | Count of response packets returned from destination to source |
| `Total Length of Fwd Packets` | Bytes | Cumulative payload volume transmitted in the forward direction |
| `Total Length of Bwd Packets` | Bytes | Cumulative payload volume returned in the reverse direction |
| `Flow Bytes/s` | Bytes/s | Byte transmission throughput rate across the flow duration |
| `Flow Packets/s` | Pkts/s | Packet transmission frequency per second |
| `Packet Length Mean` | Bytes | Mean payload size of individual packets |
| `Average Packet Size` | Bytes | Normalized mean packet size including packet headers |

---

## 4. Application Architecture

```
uit 3/
├── backend/
│   ├── app.py                      # FastAPI server with all REST endpoints + static frontend mounting
│   ├── model_pipeline.py           # Scikit-learn inference pipeline (Scaler -> PCA -> GMM -> KMeans)
│   ├── train_or_load_pipeline.py   # Dataset calibration & artifact generator
│   ├── export_from_colab.py        # Companion snippet for exporting directly from Google Colab
│   ├── requirements.txt            # Python dependencies (fastapi, uvicorn, scikit-learn, etc.)
│   └── model_artifacts/
│       ├── pipeline.joblib         # Serialized Scaler, PCA, GMM, KMeans, & thresholds
│       ├── sample_flows.json       # 500 test set flows for the interactive explorer
│       └── scatter_points.json     # 2D PCA latent coordinates for cluster lab
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # SOC header with live status indicators
│   │   │   ├── FlowInspector.jsx   # Live single-flow telemetry inference & presets
│   │   │   ├── FlowExplorer.jsx    # Interactive Colab Step 13 flow slider
│   │   │   ├── BatchAnalyzer.jsx   # CSV flow log upload & triage report
│   │   │   ├── ClusterLab.jsx      # Recharts 2D PCA cluster space & threshold tuner
│   │   │   └── ModelMethodology.jsx# Academic comparison matrix & confusion matrix
│   │   ├── data/
│   │   │   ├── presets.js          # Realistic benign and attack scenarios
│   │   │   └── academicMetrics.js  # Notebook evaluation scores
│   │   ├── App.jsx                 # Unified SOC dashboard layout
│   │   ├── main.jsx
│   │   └── index.css               # Dark cyber industrial telemetry theme
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── dist/                       # Production pre-built frontend bundle
└── README.md                       # Comprehensive guide & demonstration manual
```

---

## 5. How to Run the Application on macOS

### Prerequisites:
- Python 3.10+ (installed at `/Library/Frameworks/Python.framework/Versions/3.12/bin/python3` or Homebrew)
- Node.js 18+ and npm (installed at `/opt/homebrew/bin/node`)

---

### Option A: Quick Single-Command Launch (Backend + Pre-Built Frontend)

The FastAPI backend automatically serves the pre-built React frontend at the root URL:

```bash
cd "/Users/hemrajbhirud/Documents/uit 3/backend"
"./venv/bin/python" -m uvicorn app:app --host 127.0.0.1 --port 8000
```
Open your browser to: **`http://127.0.0.1:8000`**

---

### Option B: Full-Stack Development Mode (With Hot Reloading)

**Terminal 1 — Start the Python FastAPI Backend:**
```bash
cd "/Users/hemrajbhirud/Documents/uit 3/backend"
"./venv/bin/python" -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Start the Vite React Frontend:**
```bash
cd "/Users/hemrajbhirud/Documents/uit 3/frontend"
npm run dev
```
Open your browser to: **`http://localhost:5173`**

---

## 6. Faculty Demonstration Script (Step-by-Step)

Follow this 5-minute guide during your presentation to faculty:

### Step 1: Explain the Unsupervised Problem Framing
- Open the application at `http://127.0.0.1:8000`.
- Highlight the **Header Status Pills**: `RECALL: 97.22%` and `THRESHOLD: -1.2862`.
- *Talk Track*: "Faculty members, supervised intrusion detection models overfit to known signatures and fail against novel zero-day attacks. In this project, we train a Gaussian Mixture Model strictly on normal benign traffic. By modeling normal network geometry, any flow exhibiting unusually low probability density is flagged as an anomaly."

### Step 2: Live Flow Inspector (Tab 1)
- Click the **"Normal HTTPS Browsing"** preset pill at the top:
  - Click **"EXECUTE TELEMETRY ANOMALY INFERENCE"**.
  - Point out the **BENIGN** emerald badge, **LOW** threat level, and negative log-likelihood score well below $-1.2862$.
- Next, click the **"DDoS SYN Flood Attack"** preset pill:
  - Click **"EXECUTE TELEMETRY ANOMALY INFERENCE"**.
  - Point out the instant **ANOMALOUS INTRUSION DETECTED** crimson alert, **CRITICAL** threat level, **99.9%** confidence, and heuristic classification: `DDoS / High-Rate SYN Flood`.
  - Show the 4D PCA coordinate readouts ($PC_1, PC_2, PC_3, PC_4$).

### Step 3: Interactive Dataset Explorer (Tab 2 — Colab Step 13 Recreation)
- Navigate to the **Dataset Explorer** tab.
- Drag the **Flow ID slider** across different records.
- Demonstrate how the system displays the ground truth label from CICIDS2017 side-by-side with GMM and K-Means predictions.
- Click **"Transfer Flow #X into Live Inspector"** to show seamless state integration across tabs.

### Step 4: Batch CSV Triage (Tab 3)
- Navigate to the **Batch CSV Analyzer** tab.
- Click **"Load Demo 60-Flow Incident Log"**.
- Review the summary metrics: Anomaly Rate (%), Target Destination Port distribution chart, and the scrollable flow triage table.
- Click the download icon to demonstrate the generated CSV incident report.

### Step 5: PCA Latent Space & Threshold Simulator (Tab 4)
- Navigate to the **PCA Latent Space** tab.
- Show the 2D scatter plot ($PC_1$ vs $PC_2$) demonstrating how normal traffic clusters tightly while attack traffic scatters into low-density space.
- Move the **Threshold Tuning Simulator** slider to explain the trade-off between Recall and Precision that was optimized in Colab Step 11.

### Step 6: Academic Benchmark & Confusion Matrix (Tab 5)
- Navigate to the **Academic Benchmark** tab.
- Show the exact comparison matrix and Confusion Matrix from Colab Cell 19:
  - **97.22% Attack Recall** (7,999 attacks caught out of 8,228).
  - Emphasize that GMM outperforms K-Means across Recall, F1, and ROC-AUC because full covariance matrices model multi-modal, non-spherical traffic clusters.

