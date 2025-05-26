import os
import json
import chromadb
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict
import tempfile
from ..utils.aws_utils import AWSManager

load_dotenv()
client = OpenAI()
aws_manager = AWSManager()

# Initialize persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path="chroma_db")

def load_parsed_files() -> List[Dict]:
    """Load all parsed files from DynamoDB."""
    print("Loading files from DynamoDB...")
    files = aws_manager.list_all_files()
    print(f"✅ Loaded {len(files)} files from DynamoDB")
    return files

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

def prepare_chunks(parsed_data: List[Dict]) -> Dict[str, List[Dict]]:
    """Prepare chunks with metadata from parsed files, grouped by user_id."""
    user_chunks = {}
    
    for data in parsed_data:
        user_id = data.get('user_id', 'default_user')
        if user_id not in user_chunks:
            user_chunks[user_id] = []
            
        # Create chunks from the text
        text_chunks = chunk_text(data['text'])
        
        # Create chunk objects with metadata
        for i, chunk in enumerate(text_chunks):
            chunk_obj = {
                'text': chunk,
                'filename': data['filename'],
                'file_id': data['file_id'],
                'class': data.get('class', ''),
                'topic': data.get('topic', ''),
                'chunk_index': i,
                'total_chunks': len(text_chunks),
                's3_key': data.get('s3_key', ''),
                'user_id': user_id,
                'timestamp': data.get('processed_date', '')
            }
            user_chunks[user_id].append(chunk_obj)
    
    return user_chunks

def save_to_chroma(user_chunks: Dict[str, List[Dict]]):
    """Save chunks to user-specific ChromaDB collections."""
    for user_id, chunks in user_chunks.items():
        collection_name = f"user_{user_id}"
        print(f"Processing collection: {collection_name}")
        
        # Get or create collection
        collection = chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"user_id": user_id}
        )
        
        # Prepare documents, ids, and metadatas
        documents = [chunk['text'] for chunk in chunks]
        ids = [f"{chunk['file_id']}_{chunk['chunk_index']}" for chunk in chunks]
        metadatas = [{
            'filename': chunk['filename'],
            'file_id': chunk['file_id'],
            'class': chunk['class'],
            'topic': chunk['topic'],
            'chunk_index': chunk['chunk_index'],
            'total_chunks': chunk['total_chunks'],
            's3_key': chunk['s3_key'],
            'user_id': chunk['user_id'],
            'timestamp': chunk['timestamp']
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
        # Load parsed files from DynamoDB
        parsed_data = load_parsed_files()
        print(f"✅ Loaded {len(parsed_data)} parsed files")
        
        if len(parsed_data) == 0:
            print("No parsed files found, skipping embedding process")
            return
        
        # Prepare chunks with metadata, grouped by user
        user_chunks = prepare_chunks(parsed_data)
        print(f"✅ Created chunks for {len(user_chunks)} users")
        
        if not user_chunks:
            print("No chunks created, skipping embedding process")
            return
        
        # Save to ChromaDB
        print("Saving to ChromaDB...")
        save_to_chroma(user_chunks)
        print("✅ Chunks saved to ChromaDB")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise e

if __name__ == "__main__":
    main() 