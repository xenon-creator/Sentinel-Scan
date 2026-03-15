from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from backend.config import settings


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls):
        cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
        cls.db = cls.client[settings.MONGODB_DB_NAME]
        await cls.create_indexes()
        print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")

    @classmethod
    async def disconnect(cls):
        if cls.client is not None:
            cls.client.close()
            print("✅ Disconnected from MongoDB")

    @classmethod
    async def create_indexes(cls):
        if cls.db is None:
            return
        await cls.db.scans.create_index("scan_id", unique=True)
        await cls.db.scans.create_index("created_at")
        await cls.db.scans.create_index("status")
        await cls.db.scans.create_index([("created_at", -1)])
        await cls.db.findings.create_index("finding_id", unique=True)
        await cls.db.findings.create_index("scan_id")
        await cls.db.findings.create_index("severity")
        await cls.db.findings.create_index("cve_id")
        await cls.db.findings.create_index([("scan_id", 1), ("severity", -1)])
        await cls.db.assets.create_index("asset_id", unique=True)
        await cls.db.assets.create_index("ip_address", unique=True, sparse=True)
        await cls.db.assets.create_index("hostname")
        await cls.db.threat_intel.create_index("ioc_value")
        await cls.db.threat_intel.create_index("ioc_type")
        await cls.db.threat_intel.create_index("last_seen")
        print("✅ Database indexes created")

    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        if cls.db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return cls.db


async def get_db() -> AsyncIOMotorDatabase:
    return MongoDB.get_database()
