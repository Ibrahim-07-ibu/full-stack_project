import os
import sys

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_root = os.path.join(project_root, "Backend")

if project_root not in sys.path:
    sys.path.insert(0, project_root)

if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from Backend.main import app