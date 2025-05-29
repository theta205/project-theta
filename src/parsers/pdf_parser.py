from pdf_utils import extract_text_from_pdf
import sys
import json
from pathlib import Path


def main():
    if len(sys.argv) != 2:
        print("Usage: python pdf_parser.py <pdf_file_path>")
        sys.exit(1)
    file_path = sys.argv[1]
    try:
        result = extract_text_from_pdf(file_path)
        # Print the result as JSON to stdout
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main() 