import pytest
from pathlib import Path
from src.parsers.pdf_parser import PDFParser

def test_pdf_parser_initialization():
    parser = PDFParser()
    assert parser.supported_extensions == {'.pdf'}

def test_unsupported_file_type():
    parser = PDFParser()
    with pytest.raises(ValueError):
        parser.extract_text("test.txt")

# Add more tests as needed 