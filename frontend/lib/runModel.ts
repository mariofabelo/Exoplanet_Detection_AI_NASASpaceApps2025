export interface PredictionResult {
  user_id?: string;
  kepoi_name?: string;
  pl_name?: string;
  row_index?: number;
  prediction: number;
  confidence: number;
  prediction_label: string;
}

export interface ModelResults {
  predictions: PredictionResult[];
  total_samples: number;
  candidate_count: number;
  confirmed_count: number;
  runtime_seconds: number;
  model_info: {
    model_type: string;
    pre_trained: boolean;
  };
  error?: string;
}

import { config } from './config';

export async function runModelOnDataset(file: File, idColumnName?: string): Promise<ModelResults> {
  const formData = new FormData();
  formData.append("file", file);
  if (idColumnName) {
    formData.append("id_column", idColumnName);
  }

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
 * @returns CSV string with identifier, prediction, prediction_label, and confidence columns
 */
export function predictionsToCSV(predictions: PredictionResult[]): string {
  const headers = "identifier,prediction,prediction_label,confidence\n";
  const rows = predictions.map(pred => {
    // Try different ID fields in order of preference
    const identifier = pred.user_id || pred.kepoi_name || pred.pl_name || `row_${pred.row_index || 0}`;
    return `${identifier},${pred.prediction},${pred.prediction_label},${pred.confidence.toFixed(4)}`;
  }).join("\n");
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
