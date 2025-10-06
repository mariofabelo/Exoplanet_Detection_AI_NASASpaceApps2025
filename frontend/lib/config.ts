// Configuration for the Exoplanet Detection App
export const config = {
  // Hugging Face Space URL - update this to your actual space URL
  // If NEXT_PUBLIC_HF_SPACE_URL already includes /predict, use it as-is
  // Otherwise, append /predict to the base URL
  get HF_SPACE_URL() {
    const envUrl = process.env.NEXT_PUBLIC_HF_SPACE_URL;
    const baseUrl = envUrl || 'https://mariofabelo-ai-exoplanet-detection-mario-copy.hf.space';
    
    // If the URL already ends with /predict, use it as-is
    if (baseUrl.endsWith('/predict')) {
      return baseUrl;
    }
    
    // Otherwise, append /predict
    return `${baseUrl}/predict`;
  },
  
  // API endpoints - now using FastAPI endpoints directly
  API_ENDPOINTS: {
    PREDICT: '', // Empty because we handle the full URL in HF_SPACE_URL
    HEALTH: '/'
  }
};
