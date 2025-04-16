from fastapi import APIRouter, WebSocket, WebSocketDisconnect , Query
from app.websocket.manager import manager
import logging
from app.websocket.ws_auth import websocket_authenticate_user
import redis.asyncio as aioredis
import redis
import json
import asyncio


logger = logging.getLogger("Stream")
redis_client = redis.Redis(host='localhost', port=6379, db=0)

router = APIRouter()
# REDIS_URL = "redis://localhost:6379"
REDIS_URL = "redis://localhost"

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    user = await websocket_authenticate_user(websocket)
    await manager.connect(websocket, user_id=user.id)
    redis = await aioredis.from_url(REDIS_URL)
    pubsub = redis.pubsub()
    await pubsub.subscribe("broadcast")
    
    try:
        # Task to listen for Redis messages
        async def listen_for_messages():
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        # await websocket.send_json(data)
                    except Exception as e:
                        logger.error(f"Error sending WebSocket message: {e}")

        # Task to handle incoming messages
        async def handle_incoming():
            while True:
                data = await websocket.receive_text()
                logger.info(f"[{user.username}] sent: {data}")
                if not add_data_to_redis(data):
                    logger.error(f"Failed to process data: {data}")

        # Run both tasks concurrently
        await asyncio.gather(
            listen_for_messages(),
            handle_incoming()
        )
        
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"WebSocket disconnected: {user.username}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await pubsub.unsubscribe("broadcast")
        await redis.close()
        try:
            await websocket.close()
        except Exception:
            pass
        logger.info(f"Connection closed for {user.username}")


async def broadcast_ws_message(message_data: dict):
    try:
        redis = await aioredis.from_url(REDIS_URL)
        message_str = json.dumps(message_data)
        await redis.publish("broadcast", message_str)
        await redis.close()
    except Exception as e:
        logger.error(f"Error broadcasting message: {e}")
        raise

def add_data_to_redis(data: str) -> bool:
    try:
        # Clean and parse input
        if isinstance(data, str):
            data = data.strip().replace("'", '"')
        
        data_dict = json.loads(data)
        captcha_id = str(data_dict.get('captcha_id'))  # Ensure string
        
        if not captcha_id:
            logger.error("No captcha_id in data")
            return False
            
        redis_key = f"captcha:{captcha_id}"
        
        # Get existing data
        existing_data = redis_client.get(redis_key)
        if not existing_data:
            logger.error(f"No data for key {redis_key}")
            return False
            
        # Process data
        existing_dict = json.loads(existing_data.decode('utf-8'))
        updated_data = {
            **existing_dict,
            'captcha_text': data_dict.get('captcha_text', 'Captcha Not filled by User '),
            'status': 'completed'
        }
        
        # Save with original TTL
        ttl = redis_client.ttl(redis_key)
        redis_client.setex(
            redis_key,
            ttl if ttl > 0 else 60,
            json.dumps(updated_data)
        )
        
        return True
        
    except (json.JSONDecodeError, redis.RedisError, AttributeError) as e:
        logger.error(f"Redis processing error: {e}")
        return False