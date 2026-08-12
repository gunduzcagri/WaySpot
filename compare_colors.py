import re
import os
import difflib

md_file = 'wayspot_3_palet_aydinlik_karanlik_prompt.md'

if not os.path.exists(md_file):
    print(f"File not found: {md_file}")
    exit(1)

with open(md_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Matches markdown like: **Dosya:** `WaySpotMobile/src/theme/colors.js`
pattern = re.compile(r'\*\*Dosya:\*\*\s*`([^`]+)`.*?\n```[a-z]*\n(.*?)```', re.DOTALL)
matches = pattern.findall(content)

print(f"--- Checking {md_file} ({len(matches)} files) ---")

for filepath, expected_content in matches:
    filepath = filepath.strip()
    expected_content = expected_content.strip()
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            actual_content = f.read().strip()
            
        if actual_content != expected_content:
            print(f"\nMISMATCH: {filepath}")
            expected_lines = expected_content.splitlines(keepends=True)
            actual_lines = actual_content.splitlines(keepends=True)
            diff = difflib.unified_diff(expected_lines, actual_lines, fromfile='expected', tofile='actual', n=2)
            for line in diff:
                print(line, end='')
    else:
        print(f"\nMISSING: {filepath}")

print("\nCheck finished.")
