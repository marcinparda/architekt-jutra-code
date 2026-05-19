enum DescriptionQuality {
  GOOD
  NEEDS_IMPROVEMENT
  POOR
}

enum CategoryAccuracy {
  CORRECT
  QUESTIONABLE
  INCORRECT
}

enum PriceAssessment {
  FAIR
  SLIGHTLY_HIGH
  SIGNIFICANTLY_HIGH
  SLIGHTLY_LOW
  SIGNIFICANTLY_LOW
}

class ProductAnalysis {
  descriptionQuality DescriptionQuality
  descriptionFeedback string
  categoryAccuracy CategoryAccuracy
  categoryFeedback string
  priceAssessment PriceAssessment
  priceFeedback string
  overallScore int @description("Score from 1 to 10")
  recommendations string[]
}

function AnalyzeProduct(
  productName: string,
  productDescription: string,
  categoryName: string,
  price: float
) -> ProductAnalysis {
  client LlmProvider
  prompt #"
    You are a product quality analyst. Analyze the following product listing and provide structured feedback.

    Product Name: {{ productName }}
    Product Description: {{ productDescription }}
    Assigned Category: {{ categoryName }}
    Price: ${{ price }}

    Evaluate:
    1. Description quality — Is it clear, informative, and free of errors? Rate as GOOD, NEEDS_IMPROVEMENT, or POOR. Provide brief feedback.
    2. Category accuracy — Does the category match the product? Rate as CORRECT, QUESTIONABLE, or INCORRECT. Provide brief feedback.
    3. Price assessment — Based on the product name and description, does the price seem fair for the market? Rate as FAIR, SLIGHTLY_HIGH, SIGNIFICANTLY_HIGH, SLIGHTLY_LOW, or SIGNIFICANTLY_LOW. Provide brief feedback.
    4. Overall score from 1 (very poor listing) to 10 (excellent listing).
    5. A short list of actionable recommendations to improve the listing.

    {{ ctx.output_format }}
  "#
}
