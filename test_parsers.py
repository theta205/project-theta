from src.parsers.pdf_parser import PDFParser
from src.parsers.audio_parser import AudioParser
from src.storage.file_store import FileStore
from pathlib import Path

def test_pdf_parsing():
    print("\n=== Testing PDF Parser ===")
    parser = PDFParser()
    
    # Get the first PDF file from data/raw
    raw_dir = Path("data/raw")
    pdf_files = list(raw_dir.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDF files found in data/raw directory")
        print("Please add a PDF file to data/raw to test the parser")
        return
    
    # Test with the first PDF file found
    pdf_file = pdf_files[0]
    print(f"Testing with file: {pdf_file}")
    
    try:
        result = parser.extract_text(pdf_file)
        print("\nExtracted text preview (first 500 characters):")
        print("-" * 50)
        print(result["text"][:500])
        print("-" * 50)
        print(f"\nTotal pages: {result['num_pages']}")
        return result
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return None

def test_audio_parsing():
    print("\n=== Testing Audio Parser ===")
    parser = AudioParser()
    
    # Get the first audio file from data/raw
    raw_dir = Path("data/raw")
    audio_files = list(raw_dir.glob("*.mp3")) + list(raw_dir.glob("*.wav"))
    
    if not audio_files:
        print("No audio files found in data/raw directory")
        print("Please add an MP3 or WAV file to data/raw to test the parser")
        return
    
    # Test with the first audio file found
    audio_file = audio_files[0]
    print(f"Testing with file: {audio_file}")
    
    try:
        result = parser.transcribe(audio_file)
        print("\nTranscribed text preview (first 500 characters):")
        print("-" * 50)
        print(result["text"][:500])
        print("-" * 50)
        print(f"\nDetected language: {result['language']}")
        return result
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        return None

def main():
    print("Starting parser tests...")
    
    # Test PDF parsing
    pdf_result = test_pdf_parsing()
    
    # Test audio parsing
    audio_result = test_audio_parsing()
    
    # If we have results, save them
    if pdf_result or audio_result:
        store = FileStore("data/processed")
        
        if pdf_result:
            store.save_processed_content(pdf_result, "test_class")
            print("\nPDF results saved to data/processed/test_class/")
        
        if audio_result:
            store.save_processed_content(audio_result, "test_class")
            print("Audio results saved to data/processed/test_class/")

if __name__ == "__main__":
    main() 