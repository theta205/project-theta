import sys
import traceback

def debug_log(msg):
    print(f"[DEBUG] {msg}", file=sys.stderr)
    sys.stderr.flush()

debug_log("test_embeddings.py started")

try:
    debug_log("Starting imports...")
    import argparse
    import json
    import chromadb
    from typing import List, Dict
    import os
    debug_log("Imports done")

    # Initialize persistent ChromaDB client
    try:
        # Always use backend chroma_db directory
        chroma_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/chroma_db'))
        chroma_client = chromadb.PersistentClient(path=chroma_db_path)
        debug_log(f"ChromaDB client initialized at {chroma_db_path}")
    except Exception as e:
        debug_log(f"ChromaDB client init failed: {e}")
        print(json.dumps({
            "error": "Failed to initialize ChromaDB client",
            "details": str(e),
            "traceback": traceback.format_exc()
        }))
        sys.exit(1)

    def search_similar_chunks(query: str, collection_name: str = "documents", n_results: int = 5, topic: str = None) -> List[Dict]:
        debug_log(f"search_similar_chunks called with query='{query}', collection='{collection_name}', n_results={n_results}, topic={topic}")
        # [DEBUG] If embedding/uploading was performed here, log the collection:
        # debug_log(f"Uploading/embedding into ChromaDB collection: {collection_name}")
        try:
            debug_log(f"Getting or creating collection: {collection_name}")
            collection = chroma_client.get_or_create_collection(name=collection_name)
            debug_log(f"Collection '{collection_name}' retrieved or created")
            # Debug: Print collection count and a sample of docs
            try:
                doc_count = collection.count()
                debug_log(f"Collection count: {doc_count}")
                if doc_count > 0:
                    all_docs = collection.get()
                    sample_count = min(3, len(all_docs['ids']))
                    for i in range(sample_count):
                        debug_log(f"Sample doc {i}: text={all_docs['documents'][i][:80]}... metadata={all_docs['metadatas'][i]}")
            except Exception as e:
                debug_log(f"Error retrieving collection docs for debug: {e}")
        except Exception as e:
            debug_log(f"Failed to get collection: {e}")
            print(json.dumps({
                "error": "Failed to get ChromaDB collection",
                "details": str(e),
                "traceback": traceback.format_exc()
            }))
            sys.exit(1)
        try:
            debug_log("Querying collection...")
            query_kwargs = {
                "query_texts": [query],
                "n_results": n_results
            }
            if topic:
                debug_log(f"Applying metadata filter for topic: {topic}")
                query_kwargs["where"] = {"topic": topic}
            results = collection.query(**query_kwargs)
            debug_log("Collection queried successfully")
            # If there are no documents, return an empty list
            if not results['documents'] or not results['documents'][0]:
                print(json.dumps([]))
                return
        except Exception as e:
            debug_log(f"Failed to query collection: {e}")
            print(json.dumps({
                "error": "Failed to query ChromaDB collection",
                "details": str(e),
                "traceback": traceback.format_exc()
            }))
            sys.exit(1)
        formatted_results = []
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                "text": results['documents'][0][i],
                "filename": results['metadatas'][0][i]['filename'],
                "class": results['metadatas'][0][i]['class'],
                "topic": results['metadatas'][0][i]['topic'],
                "similarity_score": 1 - (results['distances'][0][i] / 2)
            })
        return formatted_results

    def main():
        try:
            parser = argparse.ArgumentParser()
            parser.add_argument('--query', required=True, help='Search query')
            parser.add_argument('--collection', default='documents', help='ChromaDB collection name')
            parser.add_argument('--n-results', type=int, default=5, help='Number of results to return')
            parser.add_argument('--topic', default=None, help='Optional topic filter for metadata')
            args = parser.parse_args()

            results = search_similar_chunks(
                query=args.query,
                collection_name=args.collection,
                n_results=args.n_results
            )
            print(json.dumps(results))
        except Exception as e:
            print(json.dumps({
                "error": "Search failed",
                "details": str(e),
                "traceback": traceback.format_exc()
            }))
            sys.exit(1)

    if __name__ == "__main__":
        main()

except Exception as e:
    print(json.dumps({
        "error": "Script failed to start",
        "details": str(e),
        "traceback": traceback.format_exc()
    }))
    sys.exit(1)

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