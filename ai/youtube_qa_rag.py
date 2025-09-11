#!/usr/bin/env python3
"""
YouTube Video Q&A using RAG (Retrieval-Augmented Generation)
This is the RIGHT approach for your use case - much better than fine-tuning!
"""

import os
from typing import List, Dict
import ollama
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from perf import test_cuda, test_memory

class YouTubeQARAG:
    def __init__(self, model_name="deepseek-r1:8b"):
        self.model_name = model_name
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.transcripts = {} 
        self.embeddings = {}  
        self.chunks = {}      
        
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
                    "temperature": 0.2,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            )
            return response['response']
        except Exception as e:
            return f"❌ Error generating response: {str(e)}"
    
    
    def get_video_info(self, video_id: str) -> Dict:
        if video_id not in self.transcripts:
            return {"error": "Video not found"}
        
        return {
            "video_id": video_id,
            "transcript_length": len(self.transcripts[video_id]),
            "chunks": len(self.chunks[video_id]),
            "first_chunk_preview": self.chunks[video_id][0][:100] + "..." if self.chunks[video_id] else ""
        }

def answer_question(question, qa_system):
    print(f"\n❓ Question: {question}")
    answer = qa_system.answer_question("ml_basics_001", question)
    print(f"💡 Answer: {answer}")
    print("-" * 40)

def video_stats(qa_system):
    print(f"\n📊 Video Information:")
    info = qa_system.get_video_info("ml_basics_001")
    for key, value in info.items():
        print(f"   {key}: {value}")

def main():
    qa_system = YouTubeQARAG()

    test_cuda()
    test_memory()
    video_stats(qa_system)    
    
    transcript_path = os.path.join(os.path.dirname(__file__), "data.txt")
    with open(transcript_path, "r", encoding="utf-8") as f:
        sample_transcript = f.read()
    
    qa_system.add_video_transcript("ml_basics_001", sample_transcript)
    
    icebreaker_questions = [
        "Is Tik Tok mentioned in the video?",
        "How many times i the word job mentioned in the video?",
        "What cities are mentioned?",
    ]
    
    print("\n" + "="*60)
    print("🎥 YouTube Video Q&A Demo")
    print("="*60)
    
    for question in icebreaker_questions:
        answer_question(question, qa_system)
    
    while True:
        question = input("What do you want to know about the video? ")
        answer_question(question, qa_system)

if __name__ == "__main__":
    main()
