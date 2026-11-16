export const ACADEMIC_METRICS = {
  gmm: {
    model: "Gaussian Mixture Model (GMM)",
    accuracy: 0.6286,
    precision: 0.5504,
    recall: 0.9722,
    f1_score: 0.7029,
    roc_auc: 0.6678,
    threshold: -1.2862,
    confusion_matrix: {
      tn: 3446,
      fp: 6533,
      fn: 229,
      tp: 7999
    }
  },
  kmeans: {
    model: "K-Means Clustering",
    accuracy: 0.6099,
    precision: 0.5386,
    recall: 0.9541,
    f1_score: 0.6885,
    roc_auc: 0.5886,
    threshold: 0.5476,
    confusion_matrix: {
      tn: 3314,
      fp: 6665,
      fn: 378,
      tp: 7850
    }
  },
  dataset: {
    name: "CICIDS2017 Intrusion Benchmark",
    raw_files: 8,
    total_records: 72826,
    normal_records: 39915,
    attack_records: 32911,
    test_split: 18207,
    pca_variance: 84.17
  }
};

