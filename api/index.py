import sys
import os

# Ensure the project root and Backend directory are in sys.path
# This allows 'import Backend' and 'from Backend import main' to work
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from Backend.main import app
except ImportError:
    # Handle environment where Backend might be a sibling
    sys.path.insert(0, os.path.join(project_root, "Backend"))
    from main import app

# Vercel discovers 'app' automatically for FastAPI/Flask
# We don't necessarily need Mangum anymore with the @vercel/python runtime
# but we can leave it as handler if needed.
handler = app
