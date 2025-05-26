import os
import faiss
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI()

# Example: replace with your actual chunks
def load_chunks(path="chunks.txt"):
    with open(path, "r") as f:
        return [line.strip() for line in f if line.strip()]

def embed_texts(chunks):
    vectors = []
    for chunk in chunks:
        resp = client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk
        )
        vectors.append(resp.data[0].embedding)
    return np.array(vectors).astype("float32")

def build_faiss_index(vectors):
    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(vectors)
    return index

def save_index(index, chunks, path="rag_index"):
    faiss.write_index(index, f"{path}.index")
    with open(f"{path}.txt", "w") as f:
        for chunk in chunks:
            f.write(chunk + "\n")

if __name__ == "__main__":
    chunks = load_chunks()  # One chunk per line
    vectors = embed_texts(chunks)
    index = build_faiss_index(vectors)
    save_index(index, chunks)
    print("✅ Index built and saved.")