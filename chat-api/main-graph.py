from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from graph import Neo4jConnection, generate_weighted_diet_plan
from diet import generate_diet_plan
import uvicorn

app = FastAPI()

# Initialize Neo4j connection
conn = Neo4jConnection(uri="bolt://localhost:7687", user="Leukemia", password="12345678")
try:
    conn.query("MATCH (n) RETURN n LIMIT 1")
    print("Connection to Neo4j established successfully.")
except Exception as e:
    print(f"Failed to connect to Neo4j: {e}")

class DietPlanRequest(BaseModel):
    email: str
    age: int
    allergies: str
    bmi: float
    currentDietPlan: str
    region: str

class DietPlanResponse(BaseModel):
    diet_plan: str
    weighted_plan: List[List[str]] 

@app.post("/generate-diet-plan", response_model=DietPlanResponse)
async def generate_diet_plan_endpoint(request: DietPlanRequest):
    try:
        weighted_plan = generate_weighted_diet_plan(conn, request.email)
        detailed_plan = generate_diet_plan(weighted_plan, request.age,request.allergies,request.currentDietPlan,request.bmi,request.region)
        print('detailed_plan :',detailed_plan)
        return {"diet_plan": detailed_plan, "weighted_plan": weighted_plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
