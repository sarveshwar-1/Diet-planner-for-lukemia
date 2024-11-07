import uvicorn 
from fastapi  import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from functions import (
    load_document, clean, sentencizer, chunker, join_sentences, embedding,
    list_converter, db, search_result, chat
)
import os

app = FastAPI()

class QueryRequest(BaseModel):
    query: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print('Loading')
    global collection
    collection = create_collection('/Users/sarveshwar/Documents/Semester-3/fundamentals of AI/Project/DPL/docs/lukemia.pdf','Lukemia')
    

def create_collection(file_path,collection_name):
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist")
        return None
    data  = load_document(file_path)
    if data is None:
        print(f"Warning: Failed to load document: {file_path}")
        return None
    print(f"Creating collection for: {collection_name}")
    final_data = clean(data)
    sentencizer(final_data)
    chunker(final_data,12)
    final_chunked_data = join_sentences(final_data)
    embedding(final_chunked_data)
    documents, embeddings, ids = list_converter(final_chunked_data)
    return db(documents,embeddings,ids,collection_name)

@app.post("/query")
async def get_response(request:QueryRequest):
    query = request.query
    context_str = await search_result(query,collection,3)
    print(f'context: {context_str}')
    print('Predicting')
    response = chat.predict(query=query, context_str=context_str['documents'])
    print('Done')
    print(response)
    print(type(response))
    return {"response":response}

if __name__ == "__main__":
    uvicorn.run(app,host="0.0.0.0",port=8006)