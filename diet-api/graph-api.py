from fastapi import FastAPI
from pydantic import BaseModel
from neo4j import GraphDatabase
import random
import math

app = FastAPI()

# Neo4j connection class
class Neo4jConnection:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def close(self):
        self.driver.close()

    def query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return result.data()

# Connect to Neo4j
conn = Neo4jConnection(uri="bolt://localhost:7687", user="lukemia", password="12345678")

# Pydantic model for requests
class TasteUpdateRequest(BaseModel):
    user_id: str
    taste_category: str
    review_score: float

class DietPlanRequest(BaseModel):
    user_id: str

# Route to create user and taste relationships
# @app.post("/create_user_taste/")
# def create_user_taste_graph(user_id: str):
#     create_user_query = """
#     MERGE (u:User {id: $user_id})
#     WITH u
#     FOREACH (taste IN ['sweet', 'sour', 'bitter', 'umami'] | 
#         MERGE (t:Taste {name: taste})
#         MERGE (u)-[:LIKES {weight: 0}]->(t)
#     )
#     """
#     conn.query(create_user_query, parameters={"user_id": user_id})
#     return {"status": "User taste graph created"}

# Route to update taste weights
@app.post("/update_taste_weight/")
def update_taste_weight(request: TasteUpdateRequest):
    weight_change = request.review_score - 2.5  # Neutral score is 2.5
    update_weight_query = """
    MATCH (u:User {id: $user_id})-[r:LIKES]->(t:Taste {name: $taste_category})
    SET r.weight = r.weight + $weight_change
    """
    conn.query(update_weight_query, parameters={
        "user_id": request.user_id, 
        "taste_category": request.taste_category, 
        "weight_change": weight_change
    })
    return {"status": "Taste weight updated"}

# Route to generate a weighted diet plan
@app.post("/generate_diet_plan/")
def generate_weighted_diet_plan(request: DietPlanRequest):
    query = """
    MATCH (u:User {id: $user_id})-[r:LIKES]->(t:Taste)
    RETURN t.name AS taste, r.weight AS weight
    """
    result = conn.query(query, parameters={"user_id": request.user_id})

    # Normalize weights and calculate total weight
    tastes = [(item['taste'], max(1, item['weight'])) for item in result]
    total_weight = sum([taste[1] for taste in tastes])

    # Determine the number of appearances each taste should have over 21 meals
    total_meals = 21
    taste_appearances = {}
    remaining_meals = total_meals

    for taste, weight in tastes:
        appearances = math.floor((weight / total_weight) * total_meals)
        taste_appearances[taste] = appearances
        remaining_meals -= appearances

    weighted_tastes = sorted(tastes, key=lambda x: x[1], reverse=True)
    i = 0
    while remaining_meals > 0:
        taste = weighted_tastes[i % len(weighted_tastes)][0]
        taste_appearances[taste] += 1
        remaining_meals -= 1
        i += 1

    # Create a meal plan from the taste preferences
    taste_pool = []
    for taste, count in taste_appearances.items():
        taste_pool.extend([taste] * count)

    random.shuffle(taste_pool)
    weekly_plan = []

    for day in range(7):  # 7 days of meals
        daily_plan = []
        available_tastes = set(taste_pool)

        for _ in range(3):  # 3 meals per day (breakfast, lunch, dinner)
            if not available_tastes:
                available_tastes = set(taste_pool)

            taste = random.choice(list(available_tastes))
            available_tastes.remove(taste)
            taste_pool.remove(taste)

            daily_plan.append(taste)

        weekly_plan.append(daily_plan)

    return {"diet_plan": weekly_plan}
