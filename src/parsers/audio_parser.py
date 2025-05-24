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
            
            # Clean up segments and filter out high no_speech_prob segments
            clean_segments = []
            filtered_text = []
            
            for segment in result.get("segments", []):
                # Only include segments with no_speech_prob < 0.95
                if segment["no_speech_prob"] < 0.95:
                    clean_segments.append({
                        "start": segment["start"],
                        "end": segment["end"],
                        "text": segment["text"].strip(),
                        "avg_logprob": segment["avg_logprob"],
                        "no_speech_prob": segment["no_speech_prob"]
                    })
                    filtered_text.append(segment["text"].strip())
            
            return {
                "text": " ".join(filtered_text),  # Reconstruct text from filtered segments
                "filename": file_path.name,
                "file_type": "audio",
                "language": result.get("language", "unknown"),
                "segments": clean_segments,
                "duration": result.get("duration", 0)
            }
            
        except Exception as e:
            raise Exception(f"Error processing audio file {file_path}: {str(e)}") 