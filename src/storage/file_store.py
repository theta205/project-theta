import json
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

class FileStore:
    def __init__(self, storage_path: str | Path):
        """
        Initialize the file store.
        
        Args:
            storage_path: Path where processed files will be stored
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def save_processed_content(self, content: Dict[str, Any], class_name: str) -> Path:
        """
        Save processed content to a JSON file.
        
        Args:
            content: Dictionary containing the processed content
            class_name: Name of the class/course
            
        Returns:
            Path to the saved file
        """
        # Create class directory if it doesn't exist
        class_dir = self.storage_path / class_name
        class_dir.mkdir(exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{content['filename']}_{timestamp}.json"
        
        # Save the content
        file_path = class_dir / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=2)
            
        return file_path 