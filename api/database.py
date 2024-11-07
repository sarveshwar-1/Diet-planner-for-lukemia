# PedoPal/database.py
from pymongo import MongoClient

MONGO_DETAILS = "mongodb://localhost:27017/"

client = MongoClient(MONGO_DETAILS)

database = client.pediapal
users_collection = database.get_collection("users")