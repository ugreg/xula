import os
from openai import AzureOpenAI

endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")  
key = os.getenv("AZURE_OPENAI_API_KEY")  
model_name = "gpt-4o"  
api_version = "2024-02-01"  

# Create the client
client = AzureOpenAI(
    azure_endpoint=endpoint,
    api_version=api_version,
    api_key=key
)

# Make a chat completion request
completion = client.chat.completions.create(
    model=model_name,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is AI?"},
    ],
)

print(completion.choices[0].message.content) # Display the model's response
