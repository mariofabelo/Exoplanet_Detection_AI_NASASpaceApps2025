// Configuration for the Exoplanet Detection App
export const config = {
  // Hugging Face Space URL - update this to your actual space URL
  HF_SPACE_URL: process.env.NEXT_PUBLIC_HF_SPACE_URL || 
    'https://mariofabelo-ai-exoplanet-detection-mario-copy.hf.space',
  
  // API endpoints - now using FastAPI endpoints directly
  API_ENDPOINTS: {
    PREDICT: '/predict',
    HEALTH: '/'
  }
};
