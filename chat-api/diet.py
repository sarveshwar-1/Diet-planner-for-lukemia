import os
from groq import Groq
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

llm = ChatGroq(
    groq_api_key='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',
    model_name='llama3-70b-8192'
)

def get_template():
    return '''
    You are a diet planning assistant for leukemia patients. Your task is to create a detailed and nutritionally balanced meal plan (breakfast, lunch, and dinner) for each day of the week. This plan is tailored to an individual with the following characteristics:
    
    - Age: {age} years
    - BMI: {bmi}
    - Region: {region}
    - Allergies: {allergies} (please avoid these items)
    - Current Diet Plan: {currentDietPlan} (use this as a baseline and adapt where necessary for leukemia)

    The meal plan should:
    - Provide essential nutrients to support the patient's health and immune system.
    - Use simple, practical foods that are easy to digest, low in processed ingredients, and suitable for someone undergoing leukemia treatment.
    - Include only vegetarian options to ensure ease of digestion.
    - Avoid any food items known to interfere with common leukemia treatments or medications.
    
    Here’s an example format of the expected daily plan for Day 1:

    Breakfast: Oatmeal made with almond milk, topped with banana slices and a sprinkle of cinnamon.
    Lunch: Quinoa salad with chopped cucumbers, tomatoes, bell peppers, and a drizzle of olive oil and lemon juice.
    Dinner: Steamed broccoli, baked sweet potato, and a side of lentil dal.

    Now, create a complete weekly meal plan with specific foods for each meal, formatted as follows:

    Day 1: 
        Breakfast: [item]
        Lunch: [item]
        Dinner: [item]
    
    Day 2:
        ...

    Avoid these food items in the meal plan:
    - Raw/Undercooked Meats & Fish - Sushi, rare meats (infection risk).
    - Unpasteurized Dairy - Raw milk, cheese (Listeria risk).
    - Raw Eggs - Homemade mayo, hollandaise (Salmonella risk).
    - Unwashed/Unpeeled Produce - Leafy greens, berries (bacterial risk).
    - Sugary Processed Foods - Candy, sodas (weakens immunity).
    - Mold-Ripened/Blue Cheeses - Brie, Roquefort (bacterial risk).
    - Cold Deli Meats & Smoked Seafood - Only eat if reheated (Listeria risk).
    - Alcohol & Excess Caffeine - Affects immune health and hydration.
    - High-Fiber Foods During Diarrhea - Raw veggies, whole grains (hard to digest).
    - Grapefruit & Certain Citrus - Interferes with some chemotherapy drugs.

    Here’s the weekly meal plan reference:

    Day 1: {day1}
    Day 2: {day2}
    Day 3: {day3}
    Day 4: {day4}
    Day 5: {day5}
    Day 6: {day6}
    Day 7: {day7}

'''

    
        

def generate_diet_plan(diet_plan, age, allergies, currentDietPlan, bmi, region):
    try:
        print('type of diet_plan inside gen diet plan :\n',type(diet_plan))
        print('len of diet_plan inside gen diet plan :\n',len(diet_plan))
        print('day 1',diet_plan[0])
        template = get_template()

        prompt = PromptTemplate(
            input_variables=["day1", "day2", "day3", "day4", "day5", "day6", "day7", "age", "allergies", "currentDietPlan", "bmi", "region"],
            template=template
        )
        
        conversation = LLMChain(
            llm=llm,
            prompt=prompt,
            verbose=False
        )
        
        return conversation.predict(
            day1=diet_plan[0],
            day2=diet_plan[1],
            day3=diet_plan[2],
            day4=diet_plan[3],
            day5=diet_plan[4],
            day6=diet_plan[5],
            day7=diet_plan[6],
            age=age,
            allergies=allergies,
            currentDietPlan=currentDietPlan,
            bmi=bmi,
            region=region
        )
    except Exception as e:
        print(f"An error occurred: {e}")