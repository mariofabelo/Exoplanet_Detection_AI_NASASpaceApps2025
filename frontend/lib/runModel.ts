export interface PredictionResult {
  kepoi_name: string;
  prediction: number;
  actual: number;
  confidence: number;
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

/**
 * Converts prediction results to CSV format for download
 * @param predictions Array of prediction results
 * @returns CSV string with kepoi_name, prediction, actual, and confidence columns
 */
export function predictionsToCSV(predictions: PredictionResult[]): string {
  const headers = "kepoi_name,prediction,actual,confidence\n";
  const rows = predictions.map(pred => `${pred.kepoi_name},${pred.prediction},${pred.actual},${pred.confidence.toFixed(4)}`).join("\n");
  return headers + rows;
}

/**
 * Downloads predictions as a CSV file
 * @param predictions Array of prediction results
 * @param filename Optional filename (defaults to timestamp-based name)
 */
export function downloadPredictionsCSV(predictions: PredictionResult[], filename?: string): void {
  const csvContent = predictionsToCSV(predictions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `exoplanet_predictions_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
