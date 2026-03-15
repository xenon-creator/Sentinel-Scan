from motor.motor_asyncio import AsyncIOMotorClient
from dashboard.config.settings import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect(cls):
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        cls.db = cls.client[settings.MONGODB_DB_NAME]
        print(f'Connected to MongoDB: {settings.MONGODB_DB_NAME}')

    @classmethod
    async def disconnect(cls):
        if cls.client:
            cls.client.close()
            print('Disconnected from MongoDB')

async def get_db():
    return MongoDB.db