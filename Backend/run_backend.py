import uvicorn
import os
import sys

# Get the Backend directory (where this script is located)
backend_dir = os.path.dirname(os.path.abspath(__file__))
# Get the project root (one level up)
project_root = os.path.dirname(backend_dir)

# Add both to path for absolute and relative imports
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

if __name__ == "__main__":
    print("🚀 Starting HomeBuddy Backend on http://127.0.0.1:8000")
    print("Note: Ensure your .env file is configured correctly in the project root.")
    
    # Run from the perspective of the project root to keep relative paths consistent
    os.chdir(project_root)
    uvicorn.run("Backend.main:app", host="127.0.0.1", port=8000, reload=True)
