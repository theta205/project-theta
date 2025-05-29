import os
import subprocess
import sys
from pathlib import Path

def convert_to_pdf(input_path: str, output_dir: str = "."):
    input_path = Path(input_path).resolve()
    output_dir = Path(output_dir).resolve()

    if not input_path.exists():
        print(f"Error: File not found — {input_path}")
        return

    print(f"Converting {input_path.name} to PDF...")

    try:
        result = subprocess.run([
            "libreoffice",
            "--headless",
            "--convert-to", "pdf",
            "--outdir", str(output_dir),
            str(input_path)
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

        output_pdf = output_dir / (input_path.stem + ".pdf")
        if output_pdf.exists():
            print(f"✅ Success: PDF saved to {output_pdf}")
        else:
            print("❌ Conversion failed. Output PDF not found.")
            print(result.stdout.decode(), result.stderr.decode())

    except subprocess.CalledProcessError as e:
        print("❌ LibreOffice conversion error:")
        print(e.stdout.decode(), e.stderr.decode())

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python convert_to_pdf.py <input_file> [output_dir]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_folder = sys.argv[2] if len(sys.argv) > 2 else "."

    convert_to_pdf(input_file, output_folder)
