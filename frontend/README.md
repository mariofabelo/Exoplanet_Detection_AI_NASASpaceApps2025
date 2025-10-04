# Exoplanet Detection Frontend

A NextJS application that provides a beautiful, interactive interface for the AI Exoplanet Detection model hosted on Hugging Face Spaces.

## Features

- **Interactive File Upload**: Upload Kepler CSV datasets for analysis
- **Performance Metrics Visualization**: 
  - Bar charts showing accuracy, precision, recall, specificity, and F1 scores
  - Pie chart showing prediction accuracy breakdown
  - Runtime information
- **Prediction Results Table**: 
  - Detailed view of individual predictions
  - Color-coded status indicators (Correct/Incorrect)
  - Kepler object names and classification results
- **Tabbed Interface**: Switch between metrics overview and detailed predictions
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_HF_SPACE_URL=https://your-huggingface-space-url.hf.space
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## API Integration

The frontend connects to your Hugging Face Space's FastAPI endpoint at `/predict`. The API expects:

- **Input**: CSV file upload via FormData
- **Output**: JSON response with:
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

## File Structure

```
frontend/
├── app/
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # App layout
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # Reusable UI components
├── lib/
│   ├── runModel.ts       # API integration logic
│   ├── config.ts         # Configuration settings
│   └── utils.ts          # Utility functions
└── package.json
```

## Technologies Used

- **NextJS 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization library
- **Radix UI**: Accessible component primitives

## Deployment

The frontend can be deployed to any platform that supports NextJS:

- **Vercel**: Recommended for easy deployment
- **Netlify**: Alternative deployment option
- **Docker**: Containerized deployment

Make sure to set the `NEXT_PUBLIC_HF_SPACE_URL` environment variable in your deployment platform.
