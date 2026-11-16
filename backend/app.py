"""
app.py
Production FastAPI backend for AegisGMM Network Anomaly Detection System.
"""

import os
import io
import json
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from model_pipeline import get_pipeline, FEATURES, ARTIFACTS_DIR

app = FastAPI(
    title="AegisGMM - Network Anomaly Detection API",
    description="Unsupervised Gaussian Mixture Model & PCA telemetric intrusion detection API (CICIDS2017)",
    version="1.0.0"
)

# CORS middleware for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = get_pipeline()


class NetworkFlowInput(BaseModel):
    destination_port: int = Field(..., alias="Destination Port", description="Target port (e.g. 80, 443, 22, 53)")
    flow_duration: float = Field(..., alias="Flow Duration", description="Total flow duration in microseconds")
    total_fwd_packets: float = Field(..., alias="Total Fwd Packets", description="Count of forward packets")
    total_bwd_packets: float = Field(..., alias="Total Backward Packets", description="Count of backward packets")
    total_len_fwd_packets: float = Field(..., alias="Total Length of Fwd Packets", description="Total payload length of forward packets")
    total_len_bwd_packets: float = Field(..., alias="Total Length of Bwd Packets", description="Total payload length of backward packets")
    flow_bytes_per_sec: float = Field(..., alias="Flow Bytes/s", description="Flow throughput in bytes/second")
    flow_pkts_per_sec: float = Field(..., alias="Flow Packets/s", description="Packet rate in packets/second")
    packet_length_mean: float = Field(..., alias="Packet Length Mean", description="Mean length of packet payload")
    average_packet_size: float = Field(..., alias="Average Packet Size", description="Average packet size across the flow")

    class Config:
        populate_by_name = True


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AegisGMM Network Telemetry Engine",
        "model_loaded": True,
        "primary_model": "Gaussian Mixture Model (EM, n=3, full covariance)",
        "baseline_model": "K-Means Clustering (n=3)",
        "gmm_threshold": pipeline.gmm_threshold,
        "kmeans_threshold": pipeline.kmeans_threshold,
        "pca_variance_retained": pipeline.pca_variance,
        "features": pipeline.features
    }


@app.post("/api/predict")
def predict_flow(flow: Dict[str, Any]):
    try:
        result = pipeline.predict_single(flow)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


@app.post("/api/predict/batch")
def predict_batch_json(flows: List[Dict[str, Any]]):
    try:
        df = pd.DataFrame(flows)
        summary = pipeline.predict_batch(df)
        return {"success": True, "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Batch prediction error: {str(e)}")


@app.post("/api/predict/upload-csv")
async def upload_csv_flow_log(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV flow logs are supported.")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        # Strip potential leading/trailing whitespace in column names
        df.columns = df.columns.str.strip()
        summary = pipeline.predict_batch(df)
        return {
            "success": True,
            "filename": file.filename,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")


@app.get("/api/flows")
def get_sample_test_flows(limit: int = 500, category: Optional[str] = None):
    sample_path = os.path.join(ARTIFACTS_DIR, "sample_flows.json")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample flows file not found.")
    
    with open(sample_path, "r") as f:
        flows = json.load(f)

    if category:
        flows = [f for f in flows if category.lower() in f.get("actual_label", "").lower()]

    return {
        "total_available": len(flows),
        "flows": flows[:limit]
    }


@app.get("/api/metrics")
def get_academic_metrics():
    return {
        "success": True,
        "metrics": pipeline.metrics
    }


@app.get("/api/cluster-points")
def get_pca_cluster_points():
    scatter_path = os.path.join(ARTIFACTS_DIR, "scatter_points.json")
    if not os.path.exists(scatter_path):
        raise HTTPException(status_code=404, detail="Scatter points not found.")
    
    with open(scatter_path, "r") as f:
        points = json.load(f)
    return {"success": True, "points": points}


# Serve built frontend if dist exists
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
