#!/bin/bash

echo "🚀 Setting up Exoplanet Model Visualizer..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create .env.local file in the frontend directory with your environment variables"
echo "2. Set up your Hugging Face Space with the files from huggingface-space/ directory"
echo "3. Update NEXT_PUBLIC_HF_SPACE_URL in .env.local with your Space URL"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🌐 Your app will be available at http://localhost:3000"
