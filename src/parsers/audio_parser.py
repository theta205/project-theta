import whisper
from pathlib import Path
from typing import Dict

class AudioParser:
    def __init__(self, model_size: str = "small"):
        """
        Initialize the audio parser with a specific Whisper model.
        
        Args:
            model_size: Size of the Whisper model to use ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.model = whisper.load_model(model_size)
        self.supported_extensions = {'.mp3', '.wav', '.m4a', '.ogg'}

    def transcribe(self, file_path: str | Path) -> Dict[str, str]:
        """
        Transcribe audio file to text using Whisper.
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            Dict containing transcribed text and metadata
        """
        if not isinstance(file_path, Path):
            file_path = Path(file_path)
            
        if file_path.suffix.lower() not in self.supported_extensions:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")
            
        try:
            result = self.model.transcribe(str(file_path))
            
            return {
                "text": result["text"],
                "filename": file_path.name,
                "file_type": "audio",
                "language": result.get("language", "unknown")
            }
            
        except Exception as e:
            raise Exception(f"Error processing audio file {file_path}: {str(e)}") 