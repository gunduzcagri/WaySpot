import re
import os
import difflib

with open('WaySpot_Ultra_Detayli_AI_Gelistirme_Rehberi.md', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'\*\*Dosya:\*\*\s*`([^`]+)`.*?\n```[a-z]*\n(.*?)```', re.DOTALL)
matches = pattern.findall(content)

for filepath, expected_content in matches:
    filepath = filepath.strip()
    expected_content = expected_content.strip()
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            actual_content = f.read().strip()
            
        if actual_content != expected_content:
            print(f"--- {filepath} ---")
            expected_lines = expected_content.splitlines(keepends=True)
            actual_lines = actual_content.splitlines(keepends=True)
            diff = difflib.unified_diff(expected_lines, actual_lines, fromfile='expected', tofile='actual')
            for line in diff:
                print(line, end='')
            print("\n")
