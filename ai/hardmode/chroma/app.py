from chromadb import Client

client = Client()
embedding_function = client.create_embedding_function("sentence-transformers/all-MiniLM-L6-v2")

