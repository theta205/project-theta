import sys
import json
import chromadb
import os

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No collection name provided"}))
        sys.exit(1)
    collection_name = sys.argv[1]
    chroma_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/chroma_db'))
    client = chromadb.PersistentClient(path=chroma_db_path)
    try:
        collection = client.get_collection(name=collection_name)
        results = collection.get()
        print(json.dumps({
            "chunks": [
                {
                    "id": results["ids"][i] if i < len(results["ids"]) else None,
                    "text": results["documents"][i],
                    "metadata": results["metadatas"][i] if i < len(results["metadatas"]) else {}
                }
                for i in range(len(results["documents"]))
            ]
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
