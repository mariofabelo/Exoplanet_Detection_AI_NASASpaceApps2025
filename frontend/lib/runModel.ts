export interface PredictionResult {
  kepoi_name: string;
  prediction: number;
  actual: number;
}

export interface TestSetMetrics {
  accuracy: number;
  precision: number;
  recall_sensitivity: number;
  specificity: number;
  f1: number;
}

export interface ModelResults {
  predictions: PredictionResult[];
  test_set: TestSetMetrics;
  runtime_seconds: number;
  error?: string;
}

import { config } from './config';

export async function runModelOnDataset(file: File): Promise<ModelResults> {
  const formData = new FormData();
  formData.append("file", file);

  // Use the FastAPI endpoint instead of Gradio
  const apiUrl = `${config.HF_SPACE_URL}${config.API_ENDPOINTS.PREDICT}`;

  const res = await fetch(apiUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to run model: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  
  if (data.error) {
    throw new Error(`Model error: ${data.error}`);
  }

  return data as ModelResults;
}
