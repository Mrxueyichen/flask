# game/models.py
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['gamedb']
players_collection = db['players']

def init_db():
    # 可以在这里创建索引等
    players_collection.create_index([('name', 1)], unique=True)

init_db()
