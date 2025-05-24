import pymupdf  # Updated import
from pathlib import Path
from typing import Dict, Optional

class PDFParser:
    def __init__(self):
        self.supported_extensions = {'.pdf'}

    def extract_text(self, file_path: str | Path) -> Dict[str, str]:
        """
        Extract text from a PDF file.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Dict containing extracted text and metadata
        """
        if not isinstance(file_path, Path):
            file_path = Path(file_path)
            
        if file_path.suffix.lower() not in self.supported_extensions:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")
            
        try:
            doc = pymupdf.open(file_path)  # Updated to use pymupdf.open
            text_content = []
            
            for page_num, page in enumerate(doc):
                text = page.get_text()
                text_content.append(text)
                
            return {
                "text": "\n".join(text_content),
                "num_pages": len(doc),
                "filename": file_path.name,
                "file_type": "pdf"
            }
            
        except Exception as e:
            raise Exception(f"Error processing PDF {file_path}: {str(e)}") 