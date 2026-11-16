"""
export_from_colab.py
Paste this cell at the end of your Google Colab notebook to directly export
the trained StandardScaler, PCA, GMM, KMeans, and test flows for local deployment.
"""

export_code = '''
import joblib
import json

# Ensure models and thresholds are defined from your notebook cells
artifacts = {
    "scaler": scaler,
    "pca": pca,
    "gmm": gmm,
    "kmeans": kmeans,
    "features": features,
    "gmm_threshold": float(best_threshold),
    "kmeans_threshold": float(best_k_threshold),
    "pca_variance_retained": float(sum(pca.explained_variance_ratio_) * 100),
    "metrics": {
        "gmm_accuracy": float(accuracy_score(y_test, gmm_predictions)),
        "gmm_precision": float(precision_score(y_test, gmm_predictions, zero_division=0)),
        "gmm_recall": float(recall_score(y_test, gmm_predictions)),
        "gmm_f1": float(f1_score(y_test, gmm_predictions)),
        "gmm_roc_auc": float(roc_auc_score(y_test, test_scores))
    }
}

joblib.dump(artifacts, "pipeline.joblib")
print("Exported pipeline.joblib successfully! Download it and place it in backend/model_artifacts/")
'''

if __name__ == "__main__":
    print("Colab Export Snippet:")
    print(export_code)

