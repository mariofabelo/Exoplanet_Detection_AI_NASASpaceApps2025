# Exoplanet Model Visualizer

A full-stack application that combines a Next.js frontend with a Hugging Face Space backend to visualize machine learning model performance metrics.

Trained model on combined Kepler, K2 and TESS datasets

### Datasets
Kepler: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative
K2: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=k2pandc
TESS: https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=TOI

## Project Structure

```
/project
├── frontend/ (Next.js)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── .env
└── huggingface-space/
    ├── app.py
    ├── requirements.txt
    ├── example_dataset.csv
    └── README.md
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
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   NEXT_PUBLIC_HF_SPACE_URL=https://huggingface.co/spaces/your-username/exoplanet-model/api/predict
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### 2. Hugging Face Space Setup

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose:
   - **Name**: `exoplanet-model`
   - **SDK**: Gradio
   - **Runtime**: Python
   - **Visibility**: Public (for API access)
4. Upload the files from the `huggingface-space/` directory:
   - `app.py`
   - `requirements.txt`
   - `README.md`
   - `example_dataset.csv`
   - `model.pkl` (your trained model file)

5. Update the `NEXT_PUBLIC_HF_SPACE_URL` in your `.env.local` with your actual Space URL

## Features

- **File Upload**: Upload CSV datasets through a clean web interface
- **Model Inference**: Send data to Hugging Face Space for processing
- **Metrics Visualization**: Display model performance metrics in both tabular and chart format
- **Responsive Design**: Modern UI with Tailwind CSS
- **Real-time Feedback**: Loading states and error handling

## Usage

1. Open the application in your browser (usually `http://localhost:3000`)
2. Upload a CSV file with your dataset (must include a 'target' column)
3. Click "Run Model" to send the data to your Hugging Face Space
4. View the performance metrics displayed in both numerical and visual formats

## API Integration

The frontend communicates with the Hugging Face Space via HTTP POST requests to the `/api/predict` endpoint. The Space processes the uploaded CSV file and returns JSON-formatted metrics.
Used https://huggingface.co/spaces/mariofabelo/AI_Exoplanet_Detection_Mario_copy for python backend and sent output data to frontend through FastAPI

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Python, Gradio, scikit-learn, pandas, FastAPI
- **Deployment**: Hugging Face Spaces, Vercel (for frontend)

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
