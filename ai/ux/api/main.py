from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from diffusers import StableDiffusionPipeline
from transformers import pipeline
import torch


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/img")
async def img():
    model_id = "sd-legacy/stable-diffusion-v1-5"
    pipe = StableDiffusionPipeline.from_pretrained(model_id)
    pipe = pipe.to("cpu")

    prompt = "a photo of an astronaut riding a horse on mars"
    image = pipe(prompt).images[0]
    image.save("astronaut_rides_horse.png")

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    user_prompt = data.get("prompt")
    print(f"Received message: {user_prompt}")
    task = "text-generation"
    pipe = pipeline(task, model="bert-large-uncased-whole-word-masking-finetuned-squad")
    response = pipe(user_prompt)
    print(response)
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
