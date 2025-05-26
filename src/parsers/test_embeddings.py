import argparse
import json
import chromadb
from typing import List, Dict
import sys

# Initialize persistent ChromaDB client
chroma_client = chromadb.PersistentClient(path="chroma_db")

def search_similar_chunks(query: str, collection_name: str = "documents", n_results: int = 5) -> List[Dict]:
    """Search for similar chunks using ChromaDB."""
    # Get collection
    collection = chroma_client.get_collection(name=collection_name)
    
    # Query the collection
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    # Format results
    formatted_results = []
    for i in range(len(results['documents'][0])):
        formatted_results.append({
            "text": results['documents'][0][i],
            "filename": results['metadatas'][0][i]['filename'],
            "class": results['metadatas'][0][i]['class'],
            "topic": results['metadatas'][0][i]['topic'],
            "similarity_score": 1 - (results['distances'][0][i] / 2)  # Convert distance to similarity score
        })
    
    return formatted_results

def main():
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser()
        parser.add_argument('--query', required=True, help='Search query')
        parser.add_argument('--collection', default='documents', help='ChromaDB collection name')
        parser.add_argument('--n-results', type=int, default=5, help='Number of results to return')
        args = parser.parse_args()

        # Search for similar chunks
        results = search_similar_chunks(
            query=args.query,
            collection_name=args.collection,
            n_results=args.n_results
        )
        
        # Print results as JSON
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({
            "error": "Search failed",
            "details": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main() 