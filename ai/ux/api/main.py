from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

# from fastapi import FastAPI, Request
# import requests

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

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    user_prompt = data.get("prompt")
    print(f"Received message: {user_prompt}")
    response = {"reply": f"You said: {user_prompt}"}
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
