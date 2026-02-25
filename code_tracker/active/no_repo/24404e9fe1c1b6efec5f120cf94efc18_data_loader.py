§import json
import os
import logging

class DataLoader:
    """
    Service to load vulnerability data from a large JSON file.
    
    This loader is designed to be safe for large files by:
    1. Looking for 'scout_db.vulnerabilities2.json' in the parent directory.
    2. Reading only the first 50MB of the file.
    3. Parsing the truncated content as a valid JSON snippet.
    
    This ensures we have real data to display without crashing the system due to memory usage.
    """
    
    def __init__(self):
        self.vulnerabilities = []
        self._load_data()

    def _load_data(self):
        # Path is relative to src/scout_db/services/ -> ../../../scout_db.vulnerabilities2.json
        # Or more simply: C:\SCOUTNEW\scout_db.vulnerabilities2.json
        
        # Determine the root scout_db directory
        # Current file is in: .../src/scout_db/services/data_loader.py
        # We want: .../scout_db.vulnerabilities2.json (in the C:\SCOUTNEW root)
        
        # Hardcoded check for robustness in this environment
        possible_paths = [
             r"C:\SCOUTNEW\scout_db.vulnerabilities.json",
             r"../../scout_db.vulnerabilities.json",
             r"../../../scout_db.vulnerabilities.json",
             "scout_db.vulnerabilities.json"
        ]
        
        file_path = None
        for path in possible_paths:
            if os.path.exists(path):
                file_path = path
                break
        
        if not file_path:
            print("DataLoader: Data file not found. Using empty set.")
            return

        print(f"DataLoader: Loading data from {file_path}")
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                # Read first 50MB
                chunk = f.read(50 * 1024 * 1024) 
                
                # Check if it starts with [
                if not chunk.strip().startswith("["):
                    print("DataLoader: File does not start with a JSON array.")
                    return
                
                # Try to find the last complete object closing
                # We look for "},"
                last_comma_brace = chunk.rfind("},")
                
                if last_comma_brace != -1:
                    # Slice up to the brace
                    valid_json_snippet = chunk[:last_comma_brace+1] + "]"
                else:
                    # Maybe it's just one object or short file
                    # Try to just append ] if it doesn't end with it
                    if not chunk.strip().endswith("]"):
                         valid_json_snippet = chunk + "]"
                    else:
                         valid_json_snippet = chunk

                try:
                    self.vulnerabilities = json.loads(valid_json_snippet)
                    print(f"DataLoader: Successfully loaded {len(self.vulnerabilities)} vulnerabilities.")
                except json.JSONDecodeError as e:
                    print(f"DataLoader: JSON parsing failed: {e}")
                    # Fallback: Try a smaller chunk if 50MB was too messy
                    
        except Exception as e:
            print(f"DataLoader: Error reading file: {e}")

    def get_all(self):
        return self.vulnerabilities

    def search(self, query=None):
        if not query:
            return self.vulnerabilities
        
        query = query.lower()
        results = []
        for vuln in self.vulnerabilities:
            # Simple text search
            if query in str(vuln).lower():
                results.append(vuln)
        return results

data_loader = DataLoader()
§ *cascade082Afile:///c:/SCOUTNEW/scout_db/src/scout_db/services/data_loader.py