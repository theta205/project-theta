#!/usr/bin/env python3

import os
import sys
import pypandoc
import subprocess
import json

# Supported extensions for each tool
PYPANDOC_EXTS = {'.docx', '.md', '.txt', '.html', '.odt'}
UNOCONV_EXTS  = {'.pptx', '.ppt', '.doc', '.xls', '.xlsx'}

def convert_with_pypandoc(input_file, output_file):
    try:
        pypandoc.convert_file(input_file, 'pdf', outputfile=output_file)
        print(json.dumps({"status": "success", "output_file": output_file}))
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}))

def convert_with_unoconv(input_file):
    try:
        output_file = os.path.splitext(input_file)[0] + ".pdf"
        subprocess.run(['unoconv', '-f', 'pdf', input_file], check=True)
        print(json.dumps({"status": "success", "output_file": output_file}))
    except subprocess.CalledProcessError as e:
        print(json.dumps({"status": "error", "error": str(e)}))

def convert_file(input_path):
    ext = os.path.splitext(input_path)[1].lower()
    if ext in PYPANDOC_EXTS:
        output_path = os.path.splitext(input_path)[0] + ".pdf"
        convert_with_pypandoc(input_path, output_path)
    elif ext in UNOCONV_EXTS:
        convert_with_unoconv(input_path)
    else:
        print(json.dumps({"status": "error", "error": f"Unsupported file extension: {ext}"}))

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "error": "No input file provided"}))
        return

    input_file = sys.argv[1]
    if os.path.isfile(input_file):
        convert_file(input_file)
    else:
        print(json.dumps({"status": "error", "error": f"File not found: {input_file}"}))

if __name__ == "__main__":
    main()
