import type { NextApiRequest, NextApiResponse } from "next";
import { b } from "../../../baml_client";
import { createServerSDK } from "../../../../server-sdk";

interface AnalyzeRequest {
  productId: string | number;
}

interface ErrorResponse {
  error: string;
  details?: string[];
}

interface AnalyzeResponse {
  descriptionQuality: string;
  descriptionFeedback: string;
  categoryAccuracy: string;
  categoryFeedback: string;
  priceAssessment: string;
  priceFeedback: string;
  overallScore: number;
  recommendations: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as Partial<AnalyzeRequest>;
  const productId = body.productId != null ? String(body.productId).trim() : "";

  if (!productId) {
    return res.status(400).json({
      error: "Missing required fields",
      details: ["productId"],
    });
  }

  const sdk = createServerSDK("product-analyzer", undefined, req);

  try {
    const product = (await sdk.hostApp.getProduct(productId)) as {
      name: string;
      description: string;
      price: number;
      category?: { name: string } | null;
    };

    const categoryName = product.category?.name ?? "Unknown";

    const result = await b.AnalyzeProduct(
      product.name,
      product.description,
      categoryName,
      product.price
    );

    const dataToSave = {
      descriptionQuality: result.descriptionQuality,
      descriptionFeedback: result.descriptionFeedback,
      categoryAccuracy: result.categoryAccuracy,
      categoryFeedback: result.categoryFeedback,
      priceAssessment: result.priceAssessment,
      priceFeedback: result.priceFeedback,
      overallScore: result.overallScore,
      recommendations: result.recommendations,
    };

    await sdk.thisPlugin.objects.save("analysis", productId, dataToSave, {
      entityType: "PRODUCT",
      entityId: productId,
    });

    return res.status(200).json(dataToSave);
  } catch (err) {
    console.error("Analysis failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    const statusMatch = message.match(/Host API error (\d+)/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : 500;
    return res.status(status).json({ error: message });
  }
}
