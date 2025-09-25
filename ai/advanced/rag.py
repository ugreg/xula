from typing import List
import ollama
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline

class YouTubeQARAG:
    def __init__(self, model_name):
        self.model_name = model_name
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.transcripts = {}
        self.embeddings = {}
        self.chunks = {}

    def set_model(self, new_model_name):
        self.model_name = new_model_name
        
    def add_video_transcript(self, video_id: str, transcript: str, chunk_size: int = 200):
        print(f"Processing transcript for video: {video_id}")
        self.transcripts[video_id] = transcript
        chunks = self._split_into_chunks(transcript, chunk_size)
        self.chunks[video_id] = chunks
        print(f"Creating embeddings for {len(chunks)} chunks...")
        chunk_embeddings = self.embedding_model.encode(chunks)
        self.embeddings[video_id] = chunk_embeddings
        print(f"✅ Video {video_id} processed successfully!")
        
    def _split_into_chunks(self, text: str, chunk_size: int) -> List[str]:
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end].strip()
            if end < len(text):
                for i in range(end, min(end + 100, len(text))):
                    if text[i] in '.!?':
                        end = i + 1
                        break
            chunks.append(chunk)
            start = end - 50 
            
        return chunks
    
    def answer_question(self, video_id: str, question: str, num_relevant_chunks: int = 3) -> str:

        if video_id not in self.transcripts:
            return f"❌ No transcript found for video {video_id}"
        
        question_embedding = self.embedding_model.encode([question])
        
        similarities = cosine_similarity(question_embedding, self.embeddings[video_id])[0]
        top_indices = np.argsort(similarities)[-num_relevant_chunks:][::-1]
        
        relevant_chunks = [self.chunks[video_id][i] for i in top_indices]
        context = "\n\n".join(relevant_chunks)
        
        prompt = f"""Based on the following transcript from a YouTube video, please answer this question:
Question: {question}

Relevant transcript sections:
model{context}

Answer:"""
        
        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.2, # controls the randomness of the generated text. A lower temperature (e.g., 0.2) makes the model more deterministic, leading to more predictable and conservative responses.
                    "top_p": 0.9, # A lower value of top_p (e.g., 0.9) encourages more focused and coherent responses, whereas a higher value (e.g., 1.0) allows for more varied and creative outputs.
                    "max_tokens": 500 #  lower value (e.g., 500) ensures concise response, higher value allows for longer and more detailed responses.
                }
            )
            return response['response']
        except Exception as e:
            return f"❌ Error generating response: {str(e)}"
