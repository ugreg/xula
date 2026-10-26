import ollama

print('🧠 Thinking...')
prompt = 'What are the top 3 ways for me to get better at Computer Science?'
response = ollama.generate(model='gemma:2b', prompt=prompt)
print(response['response'])
