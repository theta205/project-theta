import chromadb
import json
import os

def main():
    chroma_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/chroma_db'))
    client = chromadb.PersistentClient(path=chroma_db_path)
    try:
        collections = client.list_collections()
        names = [col.name for col in collections]
        print(json.dumps({"collections": names}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
