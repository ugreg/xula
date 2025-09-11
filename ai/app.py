import ollama

response = ollama.generate(model='gemma:2b', prompt='How are camera lenses made?')
print(response['response'])
