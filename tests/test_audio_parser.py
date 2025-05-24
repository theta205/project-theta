import pytest
from pathlib import Path
from src.parsers.audio_parser import AudioParser

def test_audio_parser_initialization():
    parser = AudioParser(model_size="small")
    assert parser.supported_extensions == {'.mp3', '.wav', '.m4a', '.ogg'}

def test_unsupported_file_type():
    parser = AudioParser()
    with pytest.raises(ValueError):
        parser.transcribe("test.txt")

# Add more tests as needed 