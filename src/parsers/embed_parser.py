import os
import json
import chromadb
from dotenv import load_dotenv
from typing import List, Dict
import tempfile
import sys
import os

# Add the project root to sys.path for absolute imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from src.utils.aws_utils import AWSManager

load_dotenv()
aws_manager = AWSManager()

# Initialize persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path="chroma_db")

def load_parsed_files() -> List[Dict]:
    """Load all parsed files from DynamoDB."""
    print("[DEBUG] Loading files from DynamoDB...")
    files = aws_manager.list_all_files()
    print(f"[DEBUG] Loaded {len(files)} files from DynamoDB")
    for idx, f in enumerate(files):
        file_id = f.get('file_id', f'idx_{idx}')
        has_text = 'text' in f and bool(f['text'])
        print(f"[DEBUG] File {idx}: file_id={file_id} | text present: {has_text} | filename={f.get('filename', '')}")
        if not has_text:
            print(f"    [DEBUG] Skipping/cleaning: {json.dumps(f, indent=2, default=str)}")
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
    valid_count = 0
    skipped_count = 0
    for data in parsed_data:
        file_id = data.get('file_id', 'UNKNOWN')
        # Defensive: Skip records without 'text'
        if 'text' not in data or not isinstance(data['text'], str) or not data['text'].strip():
            print(f"[CLEANUP] Skipping and deleting file_id={file_id} - missing or empty 'text' field")
            skipped_count += 1
            # Attempt to delete from DynamoDB if file_id is available
            if file_id != 'UNKNOWN':
                try:
                    aws_manager.delete_file_by_id(file_id)
                    print(f"[CLEANUP] Deleted file_id={file_id} from DynamoDB.")
                except Exception as e:
                    print(f"[CLEANUP] Failed to delete file_id={file_id} from DynamoDB: {e}")
            continue
        user_id = data.get('user_id', 'default_user')
        if user_id not in user_chunks:
            user_chunks[user_id] = []
        # Create chunks from the text
        text_chunks = chunk_text(data['text'])
        if not text_chunks:
            print(f"[WARNING] No chunks created for file_id={file_id} (text length={len(data['text'])})")
            continue
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
            valid_count += 1
    print(f"[DEBUG] Chunks prepared: valid={valid_count}, skipped={skipped_count}")
    for user_id, chunks in user_chunks.items():
        print(f"[DEBUG] User {user_id} has {len(chunks)} chunks. Sample chunk: {chunks[0]['text'][:120]}...")
    return user_chunks

def save_to_chroma(user_chunks: Dict[str, List[Dict]]):
    """Save chunks to user-specific ChromaDB collections."""
    for user_id, chunks in user_chunks.items():
        collection_name = f"user_{user_id}"
        print(f"[DEBUG] Processing collection: {collection_name}")
        print(f"[DEBUG] Preparing to upsert {len(chunks)} chunks for user {user_id}")
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
        print(f"[DEBUG] Example document: {documents[0][:100]}..." if documents else "[DEBUG] No documents to upsert.")
        # Add documents to collection
        if documents:
            collection.upsert(
                documents=documents,
                ids=ids,
                metadatas=metadatas
            )
            print(f"✅ Added {len(chunks)} chunks to ChromaDB collection: {collection_name}")
        else:
            print(f"[WARNING] No documents to upsert for user {user_id}")

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