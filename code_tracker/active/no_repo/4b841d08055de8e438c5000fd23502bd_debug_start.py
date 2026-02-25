µimport sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

print("Python Executable:", sys.executable)
print("Current Directory:", os.getcwd())
print("Path:", sys.path)

try:
    print("Attempting to import scout_db.main...")
    from scout_db.main import app
    print("SUCCESS: scout_db.main imported successfully!")
except ImportError as e:
    print(f"ERROR: ImportError: {e}")
except ModuleNotFoundError as e:
    print(f"ERROR: ModuleNotFoundError: {e}")
except Exception as e:
    print(f"ERROR: Exception: {e}")
µ*cascade082/file:///c:/SCOUTNEW/scout_db/src/debug_start.py