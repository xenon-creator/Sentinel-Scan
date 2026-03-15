from fastapi import APIRouter, HTTPException, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.asset import AssetRequest, AssetResponse, AssetDocument
from backend.db.mongodb import get_db
router = APIRouter(prefix='/assets', tags=['assets'])

@router.post('', response_model=AssetResponse, status_code=201)
async def register_asset(asset_request: AssetRequest, db: AsyncIOMotorDatabase=Depends(get_db)):
    asset_doc = AssetDocument(hostname=asset_request.hostname, ip_address=asset_request.ip_address, asset_type=asset_request.asset_type.value, criticality=asset_request.criticality.value, tags=asset_request.tags, metadata=asset_request.metadata)
    if asset_doc.ip_address:
        existing = await db.assets.find_one({'ip_address': asset_doc.ip_address})
        if existing:
            raise HTTPException(status_code=409, detail=f'Asset with IP {asset_doc.ip_address} already exists')
    await db.assets.insert_one(asset_doc.model_dump())
    return AssetResponse(asset_id=asset_doc.asset_id, hostname=asset_doc.hostname, ip_address=asset_doc.ip_address, asset_type=asset_request.asset_type, criticality=asset_request.criticality, tags=asset_doc.tags, created_at=asset_doc.created_at)

@router.get('', response_model=List[AssetResponse])
async def list_assets(limit: int=100, offset: int=0, db: AsyncIOMotorDatabase=Depends(get_db)):
    cursor = db.assets.find().sort('created_at', -1).skip(offset).limit(limit)
    assets = await cursor.to_list(length=limit)
    return [AssetResponse(asset_id=asset['asset_id'], hostname=asset.get('hostname'), ip_address=asset.get('ip_address'), asset_type=asset['asset_type'], criticality=asset['criticality'], tags=asset.get('tags', []), vulnerability_count=asset.get('vulnerability_count', 0), last_scanned=asset.get('last_scanned'), risk_score=asset.get('risk_score'), created_at=asset['created_at']) for asset in assets]

@router.get('/{asset_id}', response_model=AssetResponse)
async def get_asset(asset_id: str, db: AsyncIOMotorDatabase=Depends(get_db)):
    asset = await db.assets.find_one({'asset_id': asset_id})
    if not asset:
        raise HTTPException(status_code=404, detail='Asset not found')
    return AssetResponse(asset_id=asset['asset_id'], hostname=asset.get('hostname'), ip_address=asset.get('ip_address'), asset_type=asset['asset_type'], criticality=asset['criticality'], tags=asset.get('tags', []), vulnerability_count=asset.get('vulnerability_count', 0), last_scanned=asset.get('last_scanned'), risk_score=asset.get('risk_score'), created_at=asset['created_at'])

@router.delete('/{asset_id}')
async def delete_asset(asset_id: str, db: AsyncIOMotorDatabase=Depends(get_db)):
    result = await db.assets.delete_one({'asset_id': asset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Asset not found')
    return {'message': 'Asset deleted successfully', 'asset_id': asset_id}