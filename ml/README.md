# WebGuard AI — ML Model Training Pipeline

> **Current status:** The WebGuard AI backend currently uses a **feature-based rule predictor** — a deterministic, hand-weighted model. It is NOT a trained ML classifier. No training accuracy, precision, recall, or F1 score is claimed.

This README documents how a real ML model could be trained and integrated in the future.

---

## Training Pipeline

```
Labeled URL Dataset
        ↓
Feature Extraction  (backend/services/urlAnalyzer.js logic, replicated in Python)
        ↓
Feature Normalization (backend/services/featureVector.js — same 18-feature order)
        ↓
Train / Validation / Test Split  (e.g. 70 / 15 / 15)
        ↓
Model Training
        ↓
Evaluation (precision, recall, F1, AUC-ROC)
        ↓
Model Export (ONNX / joblib / JSON weights)
        ↓
Backend Inference (replace _featureBasedPredict() in mlRiskEngine.js)
```

---

## Feature Vector (18 features — fixed order)

| Index | Feature                  | Type    | Normalization          |
|-------|--------------------------|---------|------------------------|
| 0     | urlLength                | numeric | / 200                  |
| 1     | hostnameLength           | numeric | / 75                   |
| 2     | pathLength               | numeric | / 100                  |
| 3     | queryLength              | numeric | / 100                  |
| 4     | subdomainCount           | numeric | / 6                    |
| 5     | isHttps                  | binary  | 0 / 1                  |
| 6     | usesIpAddress            | binary  | 0 / 1                  |
| 7     | hasAtSymbol              | binary  | 0 / 1                  |
| 8     | hasPunycode              | binary  | 0 / 1                  |
| 9     | isShortenedUrl           | binary  | 0 / 1                  |
| 10    | suspiciousKeywordCount   | numeric | / 8                    |
| 11    | specialCharCount         | numeric | / 20                   |
| 12    | suspiciousPort           | binary  | 0 / 1                  |
| 13    | digitRatio               | numeric | already [0,1]          |
| 14    | hyphenCount              | numeric | / 6                    |
| 15    | isHighRiskTld            | binary  | 0 / 1                  |
| 16    | hasBrandImpersonation    | binary  | 0 / 1                  |
| 17    | hasDoubleSlashPath       | binary  | 0 / 1                  |

> **Important:** Any trained model MUST use this exact feature ordering and normalization. The `buildFeatureVector()` function in `backend/services/featureVector.js` is the canonical implementation.

---

## Suggested Datasets

| Dataset | URL | Notes |
|---------|-----|-------|
| PhiUSIIL Phishing URL | [Kaggle](https://www.kaggle.com/datasets/harisudhan411/phishing-and-legitimate-urls) | Large, labeled |
| ISCX URL 2016 | [UNB](https://www.unb.ca/cic/datasets/url-2016.html) | Academic |
| OpenPhish | [openphish.com](https://openphish.com) | Live feed |
| Phishtank | [phishtank.org](https://phishtank.org) | Verified phishing |

> Do NOT auto-download any dataset. Review licensing before use.

---

## Suggested Algorithms

| Algorithm           | Notes                                                                 |
|---------------------|-----------------------------------------------------------------------|
| Logistic Regression | Fast, interpretable, good baseline                                    |
| Random Forest       | Handles non-linear patterns, robust to outliers                       |
| Gradient Boosting   | (XGBoost / LightGBM) — typically best performance on tabular features |
| Neural Network      | Can be exported to ONNX for Node.js inference                         |

---

## Integration Path

### Option A — Python microservice (recommended)

1. Train and export model as a FastAPI / Flask service.
2. Replace `_featureBasedPredict()` in `mlRiskEngine.js` with an HTTP call to the Python service.
3. Keep the same `predictRisk(features)` interface — the rest of the pipeline is unchanged.

### Option B — ONNX model in Node.js

1. Export model to ONNX format from Python (`sklearn-onnx`, `torch.onnx`).
2. Load with [`onnxruntime-node`](https://www.npmjs.com/package/onnxruntime-node).
3. Call from `_featureBasedPredict()`.

### Option C — Exported JSON weights (Logistic Regression only)

1. Export coefficient array and intercept from scikit-learn.
2. Implement the linear sigmoid in `_featureBasedPredict()` — no external library needed.

---

## Evaluation Requirements

Before claiming any model metrics, you MUST:

- [ ] Split your dataset into train/test (never test on training data)
- [ ] Measure: Precision, Recall, F1-score, AUC-ROC
- [ ] Test on URLs not seen during training
- [ ] Document class imbalance handling (phishing URLs are typically rarer)
- [ ] Record model version, dataset version, and training date

Only expose real metrics in the UI. Do NOT fabricate numbers.

---

## Current Status

| Component                      | Status           |
|-------------------------------|------------------|
| Feature vector (18 features)   | ✅ Implemented   |
| Normalization                  | ✅ Implemented   |
| Feature-based predictor        | ✅ Hand-weighted  |
| Real trained ML model          | ❌ Not yet trained|
| Python training script         | ❌ Not yet created|
| ONNX export                    | ❌ Not yet created|
