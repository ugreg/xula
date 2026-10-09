from chromadb import Client, EmbeddingFunction, ChromaIndex
from sentence_transformers import SentenceTransformer
import pandas as pd

chroma_client = Client()
chroma_table = ChromaIndex(client)
string_to_vectors = client.create_embedding_function("sentence-transformers/all-MiniLM-L6-v2")

cookbook = pd.read_csv('recipes.csv')
texts = cookbook['description'].tolist()
embeddings = string_to_vectors(texts)

index.add_embeddings(embeddings, texts, cookbook['id'].tolist())

query_text = "A high protein filling meal with 3 different food groups"
query_embedding = string_to_vectors([query_text])
results = chroma_table.search(query_embedding)

for result in results:
    recipe_id = result['id']
    similarity = result['similarity']
    print(f"Recipe ID: {recipe_id}, Similarity: {similarity:.4f}")
