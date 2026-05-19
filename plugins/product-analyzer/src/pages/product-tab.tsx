import { useEffect, useState, useMemo } from "react";
import { getSDK } from "../../../sdk";
import { toProductAnalysis } from "../domain";
import {
  descriptionQualityLabel,
  categoryAccuracyLabel,
  priceAssessmentLabel,
  qualityBadgeClass,
  accuracyBadgeClass,
  priceBadgeClass,
} from "../domain";
import type { ProductAnalysis } from "../domain";

export default function ProductTab() {
  const sdk = useMemo(() => (typeof window !== "undefined" ? getSDK() : null), []);
  const productId = sdk?.thisPlugin.productId ?? "";

  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!sdk) return;
    if (!productId) {
      setError("Product ID is missing. This tab must be opened from a product detail page.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const token = await sdk!.hostApp.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const permissions = (payload.permissions ?? []) as string[];
            setCanEdit(permissions.includes("EDIT"));
          } catch { /* invalid token */ }
        }

        const objects = await sdk!.thisPlugin.objects.listByEntity("PRODUCT", productId);
        if (objects.length > 0) {
          setAnalysis(toProductAnalysis(objects[0]));
        }
      } catch {
        setError("Failed to load existing analysis.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [productId, sdk]);

  async function handleAnalyze() {
    if (!sdk) return;
    setError(null);
    setAnalyzing(true);

    try {
      const token = await sdk.hostApp.getToken();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Analysis failed.");
      }

      const result = (await response.json()) as {
        descriptionQuality: string;
        descriptionFeedback: string;
        categoryAccuracy: string;
        categoryFeedback: string;
        priceAssessment: string;
        priceFeedback: string;
        overallScore: number;
        recommendations: string[];
      };

      setAnalysis({
        objectId: productId,
        descriptionQuality: result.descriptionQuality as ProductAnalysis["descriptionQuality"],
        descriptionFeedback: result.descriptionFeedback,
        categoryAccuracy: result.categoryAccuracy as ProductAnalysis["categoryAccuracy"],
        categoryFeedback: result.categoryFeedback,
        priceAssessment: result.priceAssessment as ProductAnalysis["priceAssessment"],
        priceFeedback: result.priceFeedback,
        overallScore: result.overallScore,
        recommendations: result.recommendations,
      });
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Network error. Check your connection and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      }
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return <div className="tc-plugin" style={{ padding: "1rem" }}>Loading...</div>;
  }

  return (
    <div className="tc-plugin" style={{ padding: "1.5rem" }}>
      <h3 style={{ margin: "0 0 1rem" }}>AI Product Analysis</h3>

      {error && <p className="tc-error">{error}</p>}

      {analysis && (
        <div style={{ marginBottom: "1rem" }}>
          <div className="tc-card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
            <div className="tc-flex" style={{ alignItems: "center", marginBottom: "0.5rem" }}>
              <strong>Overall Score</strong>
              <span style={{ fontSize: "1.5rem", fontWeight: 700, marginLeft: "auto" }}>
                {analysis.overallScore}/10
              </span>
            </div>
          </div>

          <div className="tc-card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
            <div className="tc-flex" style={{ alignItems: "center", marginBottom: "0.5rem" }}>
              <strong>Description Quality</strong>
              <span className={qualityBadgeClass(analysis.descriptionQuality)} style={{ marginLeft: "auto" }}>
                {descriptionQualityLabel(analysis.descriptionQuality)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>{analysis.descriptionFeedback}</p>
          </div>

          <div className="tc-card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
            <div className="tc-flex" style={{ alignItems: "center", marginBottom: "0.5rem" }}>
              <strong>Category Accuracy</strong>
              <span className={accuracyBadgeClass(analysis.categoryAccuracy)} style={{ marginLeft: "auto" }}>
                {categoryAccuracyLabel(analysis.categoryAccuracy)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>{analysis.categoryFeedback}</p>
          </div>

          <div className="tc-card" style={{ padding: "1rem", marginBottom: "0.75rem" }}>
            <div className="tc-flex" style={{ alignItems: "center", marginBottom: "0.5rem" }}>
              <strong>Price Assessment</strong>
              <span className={priceBadgeClass(analysis.priceAssessment)} style={{ marginLeft: "auto" }}>
                {priceAssessmentLabel(analysis.priceAssessment)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>{analysis.priceFeedback}</p>
          </div>

          {analysis.recommendations.length > 0 && (
            <div className="tc-card" style={{ padding: "1rem" }}>
              <strong style={{ display: "block", marginBottom: "0.5rem" }}>Recommendations</strong>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {analysis.recommendations.map((r, i) => (
                  <li key={i} style={{ fontSize: "13px", marginBottom: "0.25rem" }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {canEdit && (
        <button
          className="tc-primary-button"
          onClick={() => void handleAnalyze()}
          disabled={analyzing}
        >
          {analyzing ? "Analyzing..." : analysis ? "Re-analyze" : "Analyze Product"}
        </button>
      )}
    </div>
  );
}
