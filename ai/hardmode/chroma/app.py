from chromadb import Client, EmbeddingFunction, ChromaIndex
from sentence_transformers import SentenceTransformer
import pandas as pd

# An embedding is a way of representing text or other types of data as numerical vectors.
# Think of it like translating words into numbers that capture their meaning.

chroma_client = Client()
chroma_table = ChromaIndex(client)
embedding_function = client.create_embedding_function("sentence-transformers/all-MiniLM-L6-v2")

cookbook = pd.read_csv('recipes.csv')
texts = cookbook['description'].tolist()
embeddings = embedding_function(texts)

index.add_embeddings(embeddings, texts, cookbook['id'].tolist())

query_text = "A high protein filling meal with 3 different food groups"
query_embedding = embedding_function([query_text])
results = chroma_table.search(query_embedding)

for result in results:
    recipe_id = result['id']
    similarity = result['similarity']
    print(f"Recipe ID: {recipe_id}, Similarity: {similarity:.4f}")
