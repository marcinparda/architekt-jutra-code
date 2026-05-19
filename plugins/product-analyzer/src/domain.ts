import type { PluginObject } from "../../sdk";

export type DescriptionQuality = "GOOD" | "NEEDS_IMPROVEMENT" | "POOR";
export type CategoryAccuracy = "CORRECT" | "QUESTIONABLE" | "INCORRECT";
export type PriceAssessment =
  | "FAIR"
  | "SLIGHTLY_HIGH"
  | "SIGNIFICANTLY_HIGH"
  | "SLIGHTLY_LOW"
  | "SIGNIFICANTLY_LOW";

export interface ProductAnalysis {
  objectId: string;
  descriptionQuality: DescriptionQuality;
  descriptionFeedback: string;
  categoryAccuracy: CategoryAccuracy;
  categoryFeedback: string;
  priceAssessment: PriceAssessment;
  priceFeedback: string;
  overallScore: number;
  recommendations: string[];
}

export function toProductAnalysis(obj: PluginObject): ProductAnalysis {
  return {
    objectId: obj.objectId,
    descriptionQuality: obj.data.descriptionQuality as DescriptionQuality,
    descriptionFeedback: obj.data.descriptionFeedback as string,
    categoryAccuracy: obj.data.categoryAccuracy as CategoryAccuracy,
    categoryFeedback: obj.data.categoryFeedback as string,
    priceAssessment: obj.data.priceAssessment as PriceAssessment,
    priceFeedback: obj.data.priceFeedback as string,
    overallScore: obj.data.overallScore as number,
    recommendations: (obj.data.recommendations as string[]) ?? [],
  };
}

export function descriptionQualityLabel(q: DescriptionQuality): string {
  switch (q) {
    case "GOOD": return "Good";
    case "NEEDS_IMPROVEMENT": return "Needs Improvement";
    case "POOR": return "Poor";
  }
}

export function categoryAccuracyLabel(a: CategoryAccuracy): string {
  switch (a) {
    case "CORRECT": return "Correct";
    case "QUESTIONABLE": return "Questionable";
    case "INCORRECT": return "Incorrect";
  }
}

export function priceAssessmentLabel(p: PriceAssessment): string {
  switch (p) {
    case "FAIR": return "Fair";
    case "SLIGHTLY_HIGH": return "Slightly High";
    case "SIGNIFICANTLY_HIGH": return "Significantly High";
    case "SLIGHTLY_LOW": return "Slightly Low";
    case "SIGNIFICANTLY_LOW": return "Significantly Low";
  }
}

export function qualityBadgeClass(q: DescriptionQuality): string {
  switch (q) {
    case "GOOD": return "tc-badge tc-badge--success";
    case "NEEDS_IMPROVEMENT": return "tc-badge tc-badge--warning";
    case "POOR": return "tc-badge tc-badge--danger";
  }
}

export function accuracyBadgeClass(a: CategoryAccuracy): string {
  switch (a) {
    case "CORRECT": return "tc-badge tc-badge--success";
    case "QUESTIONABLE": return "tc-badge tc-badge--warning";
    case "INCORRECT": return "tc-badge tc-badge--danger";
  }
}

export function priceBadgeClass(p: PriceAssessment): string {
  switch (p) {
    case "FAIR": return "tc-badge tc-badge--success";
    case "SLIGHTLY_HIGH":
    case "SLIGHTLY_LOW": return "tc-badge tc-badge--warning";
    case "SIGNIFICANTLY_HIGH":
    case "SIGNIFICANTLY_LOW": return "tc-badge tc-badge--danger";
  }
}
