# PedoPal/main.py
from fastapi import FastAPI
from auth import router as auth_router
import uvicorn

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to PedoPal API"}

if __name__ == "__main__":
    uvicorn.run(app, port=8000)