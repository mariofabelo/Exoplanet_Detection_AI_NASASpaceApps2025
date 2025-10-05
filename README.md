# AI Exoplanet Detection System

![Exoplanets in Deep Space](Exoplanets%20in%20Deep%20Space.png)

A full-stack application that combines a Next.js frontend with a Hugging Face Space backend to detect and classify exoplanets using machine learning models trained on combined Kepler, K2, and TESS datasets.

## Trained Model

Trained model on combined Kepler, K2 and TESS datasets

### Datasets
- **Kepler**: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative
- **K2**: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=k2pandc
- **TESS**: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=TOI

## Project Structure

```
/project
├── frontend/ (Next.js)
│   ├── app/
│   │   ├── page.tsx          # Main application page
│   │   ├── layout.tsx        # App layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   └── ui/               # Reusable UI components
│   │       ├── button.tsx
│   │       └── card.tsx
│   │   ├── runModel.ts       # API integration logic
│   │   ├── config.ts         # Configuration settings
│   │   └── utils.ts          # Utility functions
│   ├── public/
│   │   └── nasa-logo.png
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── next.config.js
├── huggingface-space/
│   ├── app.py
│   ├── requirements.txt
│   ├── example_dataset.csv
│   └── README.md
└── [model files]
    ├── rf_model.pkl
    ├── rf_model2.pkl
    ├── rf_model4.pkl
    ├── scaler.pkl
    ├── scaler2.pkl
    └── scaler4.pkl
```

## Setup Instructions

### 1. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file with your environment variables:
   ```
   NEXT_PUBLIC_HF_SPACE_URL=https://huggingface.co/spaces/mariofabelo/AI_Exoplanet_Detection_Mario_copy/api/predict
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### 2. Backend Integration

Used https://huggingface.co/spaces/mariofabelo/AI_Exoplanet_Detection_Mario_copy for python backend and sent output data to frontend through FastAPI

The backend provides:
- **FastAPI endpoint** at `/api/predict` for model inference
- **CSV file processing** for Kepler, K2, and TESS datasets
- **Model predictions** using trained Random Forest models
- **Performance metrics** calculation and return

## Features

- **Interactive File Upload**: Upload Kepler, K2, and TESS CSV datasets for analysis
- **AI Model Inference**: Send data to Hugging Face Space for exoplanet classification
- **Performance Metrics Visualization**: 
  - Bar charts showing accuracy, precision, recall, specificity, and F1 scores
  - Pie chart showing prediction accuracy breakdown
  - Runtime information display
- **Prediction Results Table**: 
  - Detailed view of individual exoplanet predictions
  - Color-coded status indicators (Correct/Incorrect)
  - Kepler object names and classification results
- **Tabbed Interface**: Switch between metrics overview and detailed predictions
- **Responsive Design**: Modern UI with Tailwind CSS and NASA branding
- **Real-time Feedback**: Loading states and error handling

## Usage

1. Open the application in your browser (usually `http://localhost:3000`)
2. Upload a CSV file with your Kepler, K2, or TESS dataset
3. Click "Run Model" to send the data to the AI Exoplanet Detection backend
4. View the performance metrics and individual exoplanet predictions
5. Switch between "Metrics Overview" and "Detailed Predictions" tabs for different views

## API Integration

The frontend communicates with the Hugging Face Space via HTTP POST requests to the `/api/predict` endpoint. The API expects:

- **Input**: CSV file upload via FormData containing exoplanet data
- **Output**: JSON response with predictions and performance metrics:
  ```json
  {
    "predictions": [
      {
        "kepoi_name": "K00752.01",
        "prediction": 1,
        "actual": 1
      }
    ],
    "test_set": {
      "accuracy": 0.968,
      "precision": 0.960,
      "recall_sensitivity": 0.962,
      "specificity": 0.973,
      "f1": 0.961
    },
    "runtime_seconds": 0.23
  }
  ```

Used https://huggingface.co/spaces/mariofabelo/AI_Exoplanet_Detection_Mario_copy for python backend and sent output data to frontend through FastAPI

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Recharts, Radix UI
- **Backend**: Python, FastAPI, scikit-learn, pandas, Random Forest models
- **Machine Learning**: Trained on combined Kepler, K2, and TESS datasets
- **Deployment**: Hugging Face Spaces (backend), Vercel/Netlify (frontend)

## Development

To make changes to the frontend:

1. Edit files in the `frontend/` directory
2. The development server will hot-reload changes
3. Run `npm run build` to create a production build

To make changes to the backend:

1. Edit files in the `huggingface-space/` directory
2. Upload the updated files to your Hugging Face Space
3. The Space will automatically rebuild

## Troubleshooting

- **Environment Variables**: Make sure all required environment variables are set in `.env.local`
- **CORS Issues**: Hugging Face Spaces handle CORS automatically for API endpoints
- **File Format**: Ensure uploaded CSV files have a 'target' column for classification
- **Model File**: Make sure to upload your trained `model.pkl` file to the Hugging Face Space
