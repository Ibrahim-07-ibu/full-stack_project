import sys
import os

# Get the path to the project root
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(root_path, "Backend")

# Add both root and Backend to sys.path
if root_path not in sys.path:
    sys.path.append(root_path)
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Important: Must import 'app' as 'app' for Vercel to auto-detect it
try:
    from Backend.main import app
except ImportError:
    # Fallback to direct import if path structure varies
    from main import app
