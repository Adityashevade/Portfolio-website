Áimport asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pprint import pprint

async def main():
    uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(uri)
    db = client.scout_db
    collection = db.vulnerability_overrides
    
    print("--- Checking Vulnerability Overrides ---")
    count = await collection.count_documents({})
    print(f"Total Overrides Found: {count}")
    
    cursor = collection.find({})
    async for document in cursor:
        pprint(document)

if __name__ == "__main__":
    asyncio.run(main())
Á*cascade082.file:///C:/SCOUTNEW/scout_db/list_overrides.py