å
import json
import os

file_path = r'C:\SCOUTNEW\scout_db.vulnerabilities.json'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

ecosystems = set()

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # data is a list of vulnerabilities
        for vuln in data:
            if 'affected' in vuln:
                for affected in vuln['affected']:
                    if 'ecosystem' in affected:
                        ecosystems.add(affected['ecosystem'])
                    elif 'package' in affected and 'ecosystem' in affected['package']:
                         # Handle case where ecosystem might be nested in package (OSV valid? just in case)
                         ecosystems.add(affected['package']['ecosystem'])

    print("Found ecosystems:")
    for e in sorted(ecosystems):
        print(f"- {e}")

except Exception as e:
    print(f"Error processing file: {e}")
å*cascade082)file:///C:/SCOUTNEW/extract_ecosystems.py