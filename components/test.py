from pymongo import MongoClient

# Establish a connection to the MongoDB server
try:
    client = MongoClient("mongodb://localhost:27017/")  # Adjust the connection string as necessary
    print("Connected successfully to MongoDB!")
except Exception as e:
    print(f"Could not connect to MongoDB: {e}")

# Create or switch to a database
db = client["test_database"]  # You can name your database whatever you like

# Create or switch to a collection
collection = db["test_collection"]  # You can name your collection whatever you like

# Create a simple document to insert
document = {
    "name": "John Doee",
    "age": 30,
    "city": "New York"
}

# Insert the document into the collection
try:
    result = collection.insert_one(document)
    print(f"Document inserted with _id: {result.inserted_id}")
except Exception as e:
    print(f"Error inserting document: {e}")