import os
import chromadb

# Try both possible paths for the chroma_db directory
possible_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend/chroma_db')),
    os.path.abspath(os.path.join(os.path.dirname(__file__), './chroma_db'))
]

chroma_db_path = None
for path in possible_paths:
    if os.path.exists(path):
        chroma_db_path = path
        break

if not chroma_db_path:
    raise RuntimeError('Could not find chroma_db directory in expected locations.')

client = chromadb.PersistentClient(path=chroma_db_path)

collections = client.list_collections()

print('Collections in ChromaDB:')
for col in collections:
    print(f'- {col.name}')

# Prompt for user/collection
user_input = input('\nEnter user ID (just Clerk ID, e.g. 2xhRoOWJHpx5VZGJAOr0tEZU0Fh) or full collection name: ').strip()
if user_input in [col.name for col in collections]:
    collection_name = user_input
else:
    collection_name = f'user_{user_input}'

if collection_name not in [col.name for col in collections]:
    print(f'Collection {collection_name} not found.')
    exit(1)

collection = client.get_collection(name=collection_name)

# Query all documents (chunks) in the collection
try:
    results = collection.get()
    docs = results.get('documents', [])
    metadatas = results.get('metadatas', [])
    ids = results.get('ids', [])
    print(f'\nChunks in collection {collection_name}:')
    for i, doc in enumerate(docs):
        meta = metadatas[i] if i < len(metadatas) else {}
        print(f'---\nChunk #{i+1} (ID: {ids[i] if i < len(ids) else "N/A"}):')
        print(f'Text: {doc[:100]}...')
        print(f'Metadata: {meta}')
except Exception as e:
    print(f'Error retrieving chunks: {e}')
