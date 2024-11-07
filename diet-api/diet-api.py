from fastapi import FastAPI
from pydantic import BaseModel
from langchain import PromptTemplate, LLMChain
from langchain.schema import HumanMessage, SystemMessage

app = FastAPI()

# Define the input schema
class DietRequest(BaseModel):
    age: int
    day1: list
    day2: list
    day3: list
    day4: list
    day5: list
    day6: list
    day7: list

# Template for the diet generation
template = '''
You are a "Indian" diet planning assistant for children. Make sure that the food that u generate are babies friendly and provide only Indian dishes. Based on the following taste preferences for each day, create a detailed and nutritionally balanced meal plan (breakfast, lunch, and dinner) for each day with actually edible healthy food names as per the requested flavours. The plan should include specific food items that match the taste combinations provided. You must use real foods that are suitable for children and ensure that the meal is "simple and practical". 
the output should not contain any taste name explicitly, avoid non-vegetarian/hard to digest food items and make the foods easy to eat for a {age} year old child.
Here’s an example format of what is expected for Day 1:
- Breakfast: Soft moong dal khichdi (lentil and rice porridge) with mashed carrots and a small dollop of ghee.
- Lunch: Mildly spiced grilled chicken (shredded for easy chewing) with mashed sweet potatoes and soft-cooked spinach (pureed or finely chopped).
- Dinner: Paneer (cottage cheese) cubes sautéed in a little ghee, served with mashed pumpkin and soft, steamed green beans.

Now generate a complete meal plan with a list of actual food names for each day, providing **actual foods** for each meal in the above format.

Day 1: {day1}
Day 2: {day2}
Day 3: {day3}
Day 4: {day4}
Day 5: {day5}
Day 6: {day6}
Day 7: {day7}
'''

# Setup the LLM and the chain
def create_chain():
    # Use the pre-configured language model
    from langchain_groq import ChatGroq
    llm = ChatGroq(
        groq_api_key='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',
        model_name='llama3-70b-8192'
    )
    prompt = PromptTemplate(
        input_variables=["age", "day1", "day2", "day3", "day4", "day5", "day6", "day7"],
        template=template
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain

# Define the FastAPI endpoint
@app.post("/generate_diet/")
async def generate_diet(request: DietRequest):
    chain = create_chain()
    # Generate the diet plan based on the input
    diet = chain.run({
        "age": request.age,
        "day1": request.day1,
        "day2": request.day2,
        "day3": request.day3,
        "day4": request.day4,
        "day5": request.day5,
        "day6": request.day6,
        "day7": request.day7
    })
    
    return {"diet_plan": diet}
