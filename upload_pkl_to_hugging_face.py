import os
from huggingface_hub import HfApi
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the API with your Hugging Face token
token = os.getenv("HF_TOKEN")
if not token:
    raise ValueError("HF_TOKEN not found. Please set it in your .env file or environment variables.")

api = HfApi(token=token)

# Create the repository if it doesn't exist
repo_id = "mariofabelo/rf_model"
print(f"Creating repository {repo_id}...")
try:
    api.create_repo(
        repo_id=repo_id,
        repo_type="model",
        exist_ok=True  # This will not error if repo already exists
    )
    print("Repository created successfully!")
except Exception as e:
    print(f"Repository creation info: {e}")

# Upload the model file
print("Uploading model to Hugging Face...")
api.upload_file(
    path_or_fileobj="/Users/mariofabelo/Downloads/NASA Space Apps Hackathon/web/rf_model.pkl",
    path_in_repo="rf_model.pkl",
    repo_id=repo_id,
    repo_type="model",
)
print("Upload completed successfully!")