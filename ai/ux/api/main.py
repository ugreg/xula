from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from diffusers import StableDiffusionPipeline
from transformers import pipeline
import ollama
import torch

app = FastAPI()

origins = [
    'http://localhost',
    'http://localhost:5173'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.post('/api/img')
async def img():
    model_id = 'sd-legacy/stable-diffusion-v1-5'
    pipe = StableDiffusionPipeline.from_pretrained(model_id)
    pipe = pipe.to('cpu')

    prompt = '2 kitty cats in a pool'
    image = pipe(prompt).images[0]
    image.save('img.png')

@app.post('/api/chat')
async def chat(request: Request):
    data = await request.json()
    user_prompt = data.get('prompt')
    print(f'Inferencing prompt: {user_prompt}')

    model_id = 'gpt-oss:20b'
    response = ollama.generate(model=model_id, prompt=user_prompt)
    llm_response = str(response['response'])
    print(llm_response)

    return llm_response

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
