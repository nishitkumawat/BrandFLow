
from pymongo import MongoClient # type: ignore

class MongoService:
    def __init__(self, db_name="brandflow",  uri="mongodb://localhost:27017/"):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def insert(self, collection,data):
        return self.db[collection].insert_one(data)

    def find_all(self,collection, projection=None,):
        return list( self.db[collection].find({}, projection or {"_id": 0}))

    def find(self,collection, query, projection=None):
        return list( self.db[collection].find(query, projection or {"_id": 0}))

    def update(self,collection, query, update_data):
        return  self.db[collection].update_one(query, {"$set": update_data})

    def delete(self, collection,query):
        return  self.db[collection].delete_one(query)
