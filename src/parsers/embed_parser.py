import os
import json
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()
client = OpenAI()

# Initialize persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path="chroma_db")

def load_parsed_files(directory: str = "processed") -> List[Dict]:
    """Load all parsed JSON files from the processed directory."""
    print(f"Looking for files in: {os.path.abspath(directory)}")
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")
        return []
    
    parsed_data = []
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            file_path = os.path.join(directory, filename)
            print(f"Found file: {file_path}")
            with open(file_path, 'r') as f:
                data = json.load(f)
                parsed_data.append(data)
    return parsed_data

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
    
    return chunks

def prepare_chunks(parsed_data: List[Dict]) -> List[Dict]:
    """Prepare chunks with metadata from parsed files."""
    chunks = []
    for data in parsed_data:
        # Create chunks from the text
        text_chunks = chunk_text(data['text'])
        
        # Create chunk objects with metadata
        for i, chunk in enumerate(text_chunks):
            chunk_obj = {
                'text': chunk,
                'filename': data['filename'],
                'class': data.get('class', ''),
                'topic': data.get('topic', ''),
                'chunk_index': i,
                'total_chunks': len(text_chunks)
            }
            chunks.append(chunk_obj)
    
    return chunks

def save_to_chroma(chunks: List[Dict], collection_name: str = "documents"):
    """Save chunks to ChromaDB collection."""
    # Get or create collection
    collection = chroma_client.get_or_create_collection(name=collection_name)
    
    # Prepare documents, ids, and metadatas
    documents = [chunk['text'] for chunk in chunks]
    ids = [f"{chunk['filename']}_{chunk['chunk_index']}" for chunk in chunks]
    metadatas = [{
        'filename': chunk['filename'],
        'class': chunk['class'],
        'topic': chunk['topic'],
        'chunk_index': chunk['chunk_index'],
        'total_chunks': chunk['total_chunks']
    } for chunk in chunks]
    
    # Add documents to collection
    collection.upsert(
        documents=documents,
        ids=ids,
        metadatas=metadatas
    )
    
    print(f"✅ Added {len(chunks)} chunks to ChromaDB collection: {collection_name}")

def main():
    try:
        # Load parsed files
        parsed_data = load_parsed_files()
        print(f"✅ Loaded {len(parsed_data)} parsed files")
        
        if len(parsed_data) == 0:
            print("No parsed files found, skipping embedding process")
            return
        
        # Prepare chunks with metadata
        chunks = prepare_chunks(parsed_data)
        print(f"✅ Created {len(chunks)} chunks")
        
        if len(chunks) == 0:
            print("No chunks created, skipping embedding process")
            return
        
        # Save to ChromaDB
        print("Saving to ChromaDB...")
        save_to_chroma(chunks)
        print("✅ Chunks saved to ChromaDB")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise e

if __name__ == "__main__":
    main() 