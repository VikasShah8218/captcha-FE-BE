from fastapi import Depends, HTTPException, status
from app.accounts.auth import get_current_user
from app.accounts.models import User
from typing import List, Optional
from fastapi import APIRouter
from .forms import *
import asyncio
import redis
import json
from datetime import datetime
from app.websocket.routes import broadcast_ws_message

router = APIRouter()
REDIS_URL = "redis://127.0.0.1:6379"
redis_client = redis.Redis(host='localhost', port=6379, db=0)
timeout = 60

@router.get("/users", response_model=List[UserForm], dependencies=[Depends(get_current_user)])
async def get_users():
    return await User.all()


@router.post("/captcha", response_model=List[CaptchaForm], dependencies=[Depends(get_current_user)])
async def captcha(data: Optional[CaptchaForm] = None):
    if data is None: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Data not provided")

    print(f"Captcha ID: {data.captcha_id}")

    redis_key = f"captcha:{data.captcha_id}"
    redis_data = {
        'captcha': data.captcha,
        'captcha_id': data.captcha_id,
        'tab_id': data.tab_id,
        'status': 'pending',
        'timestamp': datetime.now().strftime("%I:%M %p"),
    }
    redis_client.setex(redis_key, timeout, json.dumps(redis_data))
    await broadcast_ws_message(redis_data)
    start_time = asyncio.get_event_loop().time()
    
    while (asyncio.get_event_loop().time() - start_time) < timeout:
        stored_data = redis_client.get(redis_key)
        if stored_data:
            stored_data = json.loads(stored_data)
            if stored_data.get('status') == 'completed':
                return [stored_data]
            elif stored_data.get('status') == 'pending':
                print("Still Pending")
        
        await asyncio.sleep(1) 
    print("Timeout reached, no data captured")
    raise HTTPException(
        status_code=status.HTTP_408_REQUEST_TIMEOUT,
        detail="No data captured for this captcha ID within the time limit"
    )

