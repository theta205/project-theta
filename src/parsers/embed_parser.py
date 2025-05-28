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
# Initialize persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path="chroma_db")

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
            print(f"[CLEANUP] Skipping file_id={file_id} - missing or empty 'text' field")
            skipped_count += 1
            continue
        user_id = data.get('user_id', 'default_user')
        print(f"[EMBED DEBUG] Processing chunk for user_id: {user_id}")
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
                'file_id': data.get('file_id', 'UNKNOWN'),
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
        if chunks:
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
            print(f"[DEBUG] Uploading/embedding into ChromaDB collection: {collection_name}")
            collection.upsert(
                documents=documents,
                ids=ids,
                metadatas=metadatas
            )
            print(f"✅ Added {len(chunks)} chunks to ChromaDB collection: {collection_name}")
        else:
            print(f"[WARNING] No documents to upsert for user {user_id}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Embed parsed file data into ChromaDB.")
    parser.add_argument('--input', type=str, default=None, help='Path to parsed JSON file. If not provided, reads from stdin.')
    args = parser.parse_args()

    try:
        # Read parsed data from file or stdin
        if args.input:
            with open(args.input, 'r', encoding='utf-8') as f:
                parsed_data = json.load(f)
        else:
            parsed_data = json.load(sys.stdin)
        print(f"✅ Loaded {len(parsed_data)} parsed files from {'file' if args.input else 'stdin'}")

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