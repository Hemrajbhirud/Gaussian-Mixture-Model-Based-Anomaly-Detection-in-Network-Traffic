"""
model_pipeline.py
Fast, production-grade inference service wrapping the trained StandardScaler,
PCA, GMM, and K-Means models.
"""

import os
import joblib
import numpy as np
import pandas as pd

FEATURES = [
    "Destination Port",
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Packet Length Mean",
    "Average Packet Size"
]

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "model_artifacts")
PIPELINE_PATH = os.path.join(ARTIFACTS_DIR, "pipeline.joblib")


class NetworkAnomalyPipeline:
    def __init__(self, artifact_path=PIPELINE_PATH):
        if not os.path.exists(artifact_path):
            raise FileNotFoundError(f"Model artifact not found at {artifact_path}. Run train_or_load_pipeline.py first.")
        
        bundle = joblib.load(artifact_path)
        self.scaler = bundle["scaler"]
        self.pca = bundle["pca"]
        self.gmm = bundle["gmm"]
        self.kmeans = bundle["kmeans"]
        self.features = bundle.get("features", FEATURES)
        self.gmm_threshold = bundle.get("gmm_threshold", -1.2862)
        self.kmeans_threshold = bundle.get("kmeans_threshold", 0.5476)
        self.pca_variance = bundle.get("pca_variance_retained", 84.17)
        self.metrics = bundle.get("metrics", {})

    def _prepare_vector(self, data: dict) -> pd.DataFrame:
        """Extracts and validates feature vector from dictionary with named columns."""
        vector = []
        for feat in self.features:
            # Flexible mapping for lowercase/underscore key variants
            val = None
            key_variants = [
                feat,
                feat.lower(),
                feat.lower().replace(" ", "_").replace("/", "_per_"),
                feat.lower().replace(" ", "_")
            ]
            for k in key_variants:
                if k in data:
                    val = data[k]
                    break
            
            if val is None:
                val = 0.0
            try:
                val = float(val)
                if np.isnan(val) or np.isinf(val):
                    val = 0.0
            except (ValueError, TypeError):
                val = 0.0
            vector.append(val)
        return pd.DataFrame([vector], columns=self.features)

    def classify_attack_profile(self, dest_port: int, duration: float, pkts_s: float, bytes_s: float, avg_pkt_size: float) -> str:
        """Infers probable attack signature heuristics for cybersecurity contextualization."""
        if pkts_s > 10000 or (dest_port == 80 and pkts_s > 1500 and avg_pkt_size < 100):
            return "DDoS / High-Rate SYN Flood"
        elif duration < 1000 and pkts_s > 5000 and (dest_port > 1024 or dest_port in [21, 22, 23, 80, 443]):
            return "PortScan / Stealth Reconnaissance Probe"
        elif dest_port == 22 and duration < 5000:
            return "SSH-Patator / Authentication Brute Force"
        elif dest_port in [80, 443, 8080] and avg_pkt_size > 700:
            return "DoS Hulk / Application-Layer Flood"
        elif dest_port == 21:
            return "FTP-Patator / Credential Stuffing"
        else:
            return "Behavioral Anomaly / Zero-Day Deviation"

    def predict_single(self, flow_data: dict) -> dict:
        """Performs full end-to-end inference on a single network flow."""
        raw_df = self._prepare_vector(flow_data)
        raw_vec = raw_df.values
        
        # 1. Scale
        scaled_vec = self.scaler.transform(raw_df)
        
        # 2. PCA projection to 4 dimensions
        z = self.pca.transform(scaled_vec)
        
        # 3. GMM negative log-likelihood score
        # Lower log-likelihood means more unusual traffic -> higher -score_samples
        gmm_score = float(-self.gmm.score_samples(z)[0])
        is_gmm_anomaly = bool(gmm_score > self.gmm_threshold)
        
        # 4. K-Means distance to nearest cluster
        kmeans_dist = float(self.kmeans.transform(z).min(axis=1)[0])
        is_kmeans_anomaly = bool(kmeans_dist > self.kmeans_threshold)
        
        # Threshold margin
        margin = gmm_score - self.gmm_threshold
        
        # Confidence score (normalized sigmoid)
        # Margin > 0 means attack, margin < 0 means benign
        prob_attack = 1.0 / (1.0 + np.exp(-1.5 * margin))
        confidence = float(prob_attack if is_gmm_anomaly else (1.0 - prob_attack)) * 100.0
        
        # Threat Level
        if not is_gmm_anomaly:
            threat_level = "LOW" if margin < -2.0 else "GUARDED"
            verdict = "BENIGN"
            attack_type = "Normal Traffic"
        else:
            threat_level = "CRITICAL" if margin > 5.0 else ("HIGH" if margin > 2.0 else "ELEVATED")
            verdict = "ANOMALY / ATTACK"
            dest_port = int(raw_vec[0, 0])
            duration = float(raw_vec[0, 1])
            pkts_s = float(raw_vec[0, 7])
            bytes_s = float(raw_vec[0, 6])
            avg_pkt = float(raw_vec[0, 9])
            attack_type = self.classify_attack_profile(dest_port, duration, pkts_s, bytes_s, avg_pkt)
            
        return {
            "verdict": verdict,
            "is_anomaly": is_gmm_anomaly,
            "threat_level": threat_level,
            "attack_profile": attack_type,
            "gmm": {
                "score": round(gmm_score, 4),
                "threshold": round(self.gmm_threshold, 4),
                "margin": round(margin, 4),
                "prediction": "ATTACK" if is_gmm_anomaly else "NORMAL"
            },
            "kmeans": {
                "distance": round(kmeans_dist, 4),
                "threshold": round(self.kmeans_threshold, 4),
                "prediction": "ATTACK" if is_kmeans_anomaly else "NORMAL"
            },
            "confidence_pct": round(confidence, 1),
            "pca_coordinates": {
                "pc1": round(float(z[0, 0]), 4),
                "pc2": round(float(z[0, 1]), 4),
                "pc3": round(float(z[0, 2]), 4),
                "pc4": round(float(z[0, 3]), 4)
            },
            "model_agreement": (is_gmm_anomaly == is_kmeans_anomaly),
            "telemetry_summary": {
                "destination_port": int(raw_vec[0, 0]),
                "flow_duration_ms": round(float(raw_vec[0, 1]) / 1000.0, 2),
                "total_packets": int(raw_vec[0, 2] + raw_vec[0, 3]),
                "flow_rate_pkts_s": round(float(raw_vec[0, 7]), 2)
            }
        }

    def predict_batch(self, df: pd.DataFrame) -> dict:
        """Performs vectorized inference on batch flow dataframes."""
        # Align features
        for f in self.features:
            if f not in df.columns:
                df[f] = 0.0
            df[f] = pd.to_numeric(df[f], errors="coerce").fillna(0.0)

        X = df[self.features].values
        X_scaled = self.scaler.transform(X)
        Z = self.pca.transform(X_scaled)
        
        gmm_scores = -self.gmm.score_samples(Z)
        gmm_anomalies = (gmm_scores > self.gmm_threshold).astype(int)
        
        kmeans_dists = self.kmeans.transform(Z).min(axis=1)
        kmeans_anomalies = (kmeans_dists > self.kmeans_threshold).astype(int)

        total_flows = len(df)
        anomaly_count = int(np.sum(gmm_anomalies))
        anomaly_rate = round((anomaly_count / total_flows) * 100.0, 2) if total_flows > 0 else 0.0

        # Port distribution breakdown
        port_series = df["Destination Port"].astype(int)
        port_counts = port_series.value_counts().head(6).to_dict()

        flows_result = []
        for i in range(min(total_flows, 100)):
            is_anom = bool(gmm_anomalies[i] == 1)
            flows_result.append({
                "index": i,
                "destination_port": int(df.iloc[i]["Destination Port"]),
                "flow_duration": float(df.iloc[i]["Flow Duration"]),
                "total_fwd_packets": float(df.iloc[i]["Total Fwd Packets"]),
                "total_bwd_packets": float(df.iloc[i]["Total Backward Packets"]),
                "gmm_score": round(float(gmm_scores[i]), 4),
                "verdict": "ATTACK" if is_anom else "NORMAL",
                "kmeans_distance": round(float(kmeans_dists[i]), 4),
                "pc1": round(float(Z[i, 0]), 3),
                "pc2": round(float(Z[i, 1]), 3)
            })

        return {
            "total_flows": total_flows,
            "anomaly_count": anomaly_count,
            "normal_count": total_flows - anomaly_count,
            "anomaly_rate_pct": anomaly_rate,
            "gmm_threshold": self.gmm_threshold,
            "top_ports": port_counts,
            "sample_results": flows_result
        }


# Singleton instance
_pipeline_instance = None

def get_pipeline():
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = NetworkAnomalyPipeline()
    return _pipeline_instance
