#!/usr/bin/env python3
"""
YouTube Video Q&A using RAG (Retrieval-Augmented Generation)
This is the RIGHT approach for your use case - much better than fine-tuning!
"""

import os
from perf import test_cuda, test_memory
from transformers import pipeline
from rag import YouTubeQARAG

SIMPLE_MODEL = "gemma:2b" # good with RAI, too simple
VERBOSE_MODEL = "deepseek-r1:8b" # very expressive, horrible with RAI
CUSTOM_MODEL = "" # https://ollama.com/search?c=thinking

def answer_question(question, qa_system):
    print(f"\n❓ Question: {question}")
    print("Thinking...")
    answer = qa_system.answer_question("mkbhd_smartglassess", question)
    print(f"💡 Answer: {answer}")
    print("-" * 40)

def main():
    qa_system = YouTubeQARAG(SIMPLE_MODEL)
    test_cuda()
    test_memory()
    transcript_path = os.path.join(os.path.dirname(__file__), "transcript.txt")
    with open(transcript_path, "r", encoding="utf-8") as f:
        sample_transcript = f.read()
    
    qa_system.add_video_transcript("mkbhd_smartglassess", sample_transcript)
    
    icebreaker_questions = [
        "What is this video about?",
        "What was your favorite part of the video?",
        "What was the most interesting thing about the video to you?"
    ]
    
    print("\n" + "="*60)
    print("🎥 YouTube Video Q&A Demo")
    print("="*60)
    
    for question in icebreaker_questions:
        answer_question(question, qa_system)

    while True:
        question = input("🧠 What else do you want to know about the video? 'v' for verbose model, 's' for simple model, 'c' for custom.\n")
        if question == "done":
            question = input("Shutting down...")
            print("\n"*10)
            break
        elif question == "s":
            qa_system.set_model(SIMPLE_MODEL)
            print("Now using model:", SIMPLE_MODEL)
        elif question == "v":
            qa_system.set_model(VERBOSE_MODEL)
            print("Now using model:", VERBOSE_MODEL)
        else:
            answer_question(question, qa_system)

if __name__ == "__main__":
    main()
