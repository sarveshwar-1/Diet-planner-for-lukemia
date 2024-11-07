# PedoPal/main.py
from fastapi import FastAPI
from auth import router as auth_router
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of domains that can communicate with the API
    allow_credentials=True,
    allow_methods=["*"],  # HTTP methods to allow, e.g., GET, POST, etc.
    allow_headers=["*"],  # HTTP headers to allow
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to PedoPal API"}

if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0", port=8000)