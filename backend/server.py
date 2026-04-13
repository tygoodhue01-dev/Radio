from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import secrets
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_roles(*roles):
    async def checker(request: Request):
        user = await get_current_user(request)
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker

# Pydantic Models
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class NewsCreate(BaseModel):
    title: str
    content: str
    summary: str = ""
    image_url: str = ""
    category: str = "general"

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    published: Optional[bool] = None

class SongRequestCreate(BaseModel):
    song_title: str
    artist: str = ""
    message: str = ""

class ChatMessageCreate(BaseModel):
    message: str

class ShowCreate(BaseModel):
    name: str
    description: str = ""
    dj_id: str = ""
    schedule: str = ""
    image_url: str = ""

class NowPlayingUpdate(BaseModel):
    song_title: str
    artist: str = ""
    album: str = ""

class UserRoleUpdate(BaseModel):
    role: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

# App setup
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== AUTH ENDPOINTS ====================
@api_router.post("/auth/register")
async def register(req: RegisterRequest):
    email = req.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": email,
        "password_hash": hash_password(req.password),
        "name": req.name.strip(),
        "role": "listener",
        "bio": "",
        "avatar_url": "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    access_token = create_access_token(user_id, email, "listener")
    refresh_token = create_refresh_token(user_id)
    user_doc.pop("password_hash")
    user_doc.pop("_id", None)
    return {"user": user_doc, "access_token": access_token, "refresh_token": refresh_token}

@api_router.post("/auth/login")
async def login(req: LoginRequest, request: Request):
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    
    # Check brute force
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("locked_until"):
        locked = attempt["locked_until"]
        if isinstance(locked, str):
            locked = datetime.fromisoformat(locked)
        if locked.tzinfo is None:
            locked = locked.replace(tzinfo=timezone.utc)
        if locked > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(req.password, user["password_hash"]):
        # Track failed attempt
        if attempt:
            attempts = attempt.get("attempts", 0) + 1
            update = {"$set": {"attempts": attempts, "last_attempt": datetime.now(timezone.utc).isoformat()}}
            if attempts >= 5:
                update["$set"]["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
            await db.login_attempts.update_one({"identifier": identifier}, update)
        else:
            await db.login_attempts.insert_one({
                "identifier": identifier, "attempts": 1,
                "last_attempt": datetime.now(timezone.utc).isoformat()
            })
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear attempts on success
    await db.login_attempts.delete_many({"identifier": identifier})
    
    access_token = create_access_token(user["user_id"], email, user["role"])
    refresh_token = create_refresh_token(user["user_id"])
    user.pop("password_hash", None)
    return {"user": user, "access_token": access_token, "refresh_token": refresh_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request):
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access_token = create_access_token(user["user_id"], user["email"], user["role"])
        return {"access_token": access_token}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.post("/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

# ==================== NEWS ENDPOINTS ====================
@api_router.get("/news")
async def list_news(category: str = "", limit: int = 20):
    query = {"published": True}
    if category:
        query["category"] = category
    articles = await db.news.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return articles

@api_router.get("/news/{news_id}")
async def get_news(news_id: str):
    article = await db.news.find_one({"news_id": news_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@api_router.post("/news")
async def create_news(req: NewsCreate, user: dict = Depends(require_roles("admin", "editor"))):
    news_doc = {
        "news_id": f"news_{uuid.uuid4().hex[:12]}",
        "title": req.title,
        "content": req.content,
        "summary": req.summary or req.content[:150],
        "image_url": req.image_url,
        "category": req.category,
        "author_id": user["user_id"],
        "author_name": user["name"],
        "published": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.news.insert_one(news_doc)
    news_doc.pop("_id", None)
    return news_doc

@api_router.put("/news/{news_id}")
async def update_news(news_id: str, req: NewsUpdate, user: dict = Depends(require_roles("admin", "editor"))):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.news.update_one({"news_id": news_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    article = await db.news.find_one({"news_id": news_id}, {"_id": 0})
    return article

@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, user: dict = Depends(require_roles("admin", "editor"))):
    result = await db.news.delete_one({"news_id": news_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Deleted"}

# ==================== SONG REQUEST ENDPOINTS ====================
@api_router.get("/requests")
async def list_requests(status: str = "", limit: int = 50):
    query = {}
    if status:
        query["status"] = status
    requests = await db.song_requests.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return requests

@api_router.post("/requests")
async def create_request(req: SongRequestCreate, user: dict = Depends(get_current_user)):
    request_doc = {
        "request_id": f"req_{uuid.uuid4().hex[:12]}",
        "song_title": req.song_title,
        "artist": req.artist,
        "message": req.message,
        "user_id": user["user_id"],
        "user_name": user["name"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.song_requests.insert_one(request_doc)
    request_doc.pop("_id", None)
    
    # Auto-create chat message
    chat_doc = {
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "user_name": user["name"],
        "user_role": user["role"],
        "message": f"🎵 Requested: {req.song_title}" + (f" by {req.artist}" if req.artist else "") + (f" - \"{req.message}\"" if req.message else ""),
        "type": "request",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.request_chat.insert_one(chat_doc)
    
    return request_doc

@api_router.put("/requests/{request_id}/status")
async def update_request_status(request_id: str, status: str, user: dict = Depends(require_roles("admin", "dj"))):
    result = await db.song_requests.update_one(
        {"request_id": request_id},
        {"$set": {"status": status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": f"Status updated to {status}"}

@api_router.get("/requests/chat")
async def get_chat(limit: int = 50):
    messages = await db.request_chat.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return list(reversed(messages))

@api_router.post("/requests/chat")
async def send_chat(req: ChatMessageCreate, user: dict = Depends(get_current_user)):
    chat_doc = {
        "message_id": f"msg_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "user_name": user["name"],
        "user_role": user["role"],
        "message": req.message,
        "type": "chat",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.request_chat.insert_one(chat_doc)
    chat_doc.pop("_id", None)
    return chat_doc

# ==================== SHOWS ENDPOINTS ====================
@api_router.get("/shows")
async def list_shows():
    shows = await db.shows.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return shows

@api_router.get("/shows/{show_id}")
async def get_show(show_id: str):
    show = await db.shows.find_one({"show_id": show_id}, {"_id": 0})
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return show

@api_router.post("/shows")
async def create_show(req: ShowCreate, user: dict = Depends(require_roles("admin", "dj"))):
    show_doc = {
        "show_id": f"show_{uuid.uuid4().hex[:12]}",
        "name": req.name,
        "description": req.description,
        "dj_id": req.dj_id or user["user_id"],
        "dj_name": user["name"],
        "schedule": req.schedule,
        "image_url": req.image_url,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.shows.insert_one(show_doc)
    show_doc.pop("_id", None)
    return show_doc

# ==================== NOW PLAYING ENDPOINT ====================
@api_router.get("/now-playing")
async def get_now_playing():
    np = await db.now_playing.find_one({"active": True}, {"_id": 0})
    if not np:
        return {
            "song_title": "The Beat 515",
            "artist": "Live Radio",
            "album": "",
            "dj_name": "AutoDJ",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
    return np

@api_router.put("/now-playing")
async def update_now_playing(req: NowPlayingUpdate, user: dict = Depends(require_roles("admin", "dj"))):
    np_doc = {
        "song_title": req.song_title,
        "artist": req.artist,
        "album": req.album,
        "dj_name": user["name"],
        "active": True,
        "started_at": datetime.now(timezone.utc).isoformat()
    }
    await db.now_playing.update_one({"active": True}, {"$set": np_doc}, upsert=True)
    return np_doc

# ==================== DJ PROFILES ====================
@api_router.get("/djs")
async def list_djs():
    djs = await db.users.find({"role": "dj"}, {"_id": 0, "password_hash": 0}).to_list(50)
    return djs

@api_router.get("/djs/{user_id}")
async def get_dj(user_id: str):
    dj = await db.users.find_one({"user_id": user_id, "role": "dj"}, {"_id": 0, "password_hash": 0})
    if not dj:
        raise HTTPException(status_code=404, detail="DJ not found")
    shows = await db.shows.find({"dj_id": user_id}, {"_id": 0}).to_list(20)
    return {**dj, "shows": shows}

# ==================== ADMIN ENDPOINTS ====================
@api_router.get("/admin/users")
async def list_users(user: dict = Depends(require_roles("admin"))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, req: UserRoleUpdate, user: dict = Depends(require_roles("admin"))):
    if req.role not in ["admin", "dj", "editor", "listener"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    result = await db.users.update_one({"user_id": user_id}, {"$set": {"role": req.role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"Role updated to {req.role}"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(require_roles("admin"))):
    if user_id == user["user_id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

# ==================== PROFILE ====================
@api_router.put("/profile")
async def update_profile(req: ProfileUpdate, user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in req.dict().items() if v is not None}
    if update_data:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": update_data})
    updated = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    return updated

# ==================== STREAM CONFIG ====================
@api_router.get("/stream-config")
async def get_stream_config():
    config = await db.stream_config.find_one({"active": True}, {"_id": 0})
    if not config:
        return {
            "stream_url": "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
            "station_name": "The Beat 515",
            "tagline": "Proud. Loud. Local."
        }
    return config

# ==================== STATS (ADMIN) ====================
@api_router.get("/admin/stats")
async def get_stats(user: dict = Depends(require_roles("admin"))):
    total_users = await db.users.count_documents({})
    total_news = await db.news.count_documents({})
    total_requests = await db.song_requests.count_documents({})
    pending_requests = await db.song_requests.count_documents({"status": "pending"})
    total_shows = await db.shows.count_documents({})
    return {
        "total_users": total_users,
        "total_news": total_news,
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "total_shows": total_shows
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== SEED DATA ====================
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.news.create_index("news_id", unique=True)
    await db.song_requests.create_index("request_id", unique=True)
    await db.shows.create_index("show_id", unique=True)
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@thebeat515.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Beat515Admin!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Station Admin",
            "role": "admin",
            "bio": "The Beat 515 Station Administrator",
            "avatar_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin user seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
    
    # Seed sample DJ
    dj_email = "dj@thebeat515.com"
    existing_dj = await db.users.find_one({"email": dj_email})
    if not existing_dj:
        dj_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": dj_id,
            "email": dj_email,
            "password_hash": hash_password("DJBeat515!"),
            "name": "DJ Pulse",
            "role": "dj",
            "bio": "Spinning the hottest tracks every weeknight! Your favorite Top 40 DJ.",
            "avatar_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        # Seed shows for DJ
        await db.shows.insert_one({
            "show_id": f"show_{uuid.uuid4().hex[:12]}",
            "name": "The Evening Pulse",
            "description": "The hottest Top 40 hits to get your evening started right. Call in with your requests!",
            "dj_id": dj_id,
            "dj_name": "DJ Pulse",
            "schedule": "Mon-Fri 6PM-10PM",
            "image_url": "https://images.unsplash.com/photo-1765894103984-91ff695bbbaf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxyYWRpbyUyMERKJTIwaG9zdGluZ3xlbnwwfHx8fDE3NzYwNzA2MzB8MA&ixlib=rb-4.1.0&q=85",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        await db.shows.insert_one({
            "show_id": f"show_{uuid.uuid4().hex[:12]}",
            "name": "Weekend Warm-Up",
            "description": "Getting the weekend started with the biggest bangers. Non-stop hits from noon to 4!",
            "dj_id": dj_id,
            "dj_name": "DJ Pulse",
            "schedule": "Sat-Sun 12PM-4PM",
            "image_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("DJ user and shows seeded")
    
    # Seed editor
    editor_email = "news@thebeat515.com"
    existing_editor = await db.users.find_one({"email": editor_email})
    if not existing_editor:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": editor_email,
            "password_hash": hash_password("News515!"),
            "name": "Sarah Chen",
            "role": "editor",
            "bio": "Music journalist and entertainment news editor at The Beat 515.",
            "avatar_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Editor user seeded")
    
    # Seed sample news
    news_count = await db.news.count_documents({})
    if news_count == 0:
        sample_news = [
            {
                "news_id": f"news_{uuid.uuid4().hex[:12]}",
                "title": "Summer Music Festival Returns to Downtown",
                "content": "The annual Summer Sounds Festival is back and bigger than ever! This year's lineup features headliners from across the country, with local acts opening each day. The three-day event will transform the downtown area into a music lover's paradise with multiple stages, food vendors, and interactive art installations. Tickets go on sale next Friday at 10 AM.",
                "summary": "The annual Summer Sounds Festival returns with a star-studded lineup and three days of non-stop music.",
                "image_url": "https://images.unsplash.com/photo-1773385404894-104116c1ef31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2QlMjBuZW9ufGVufDB8fHx8MTc3NjA3MDY0M3ww&ixlib=rb-4.1.0&q=85",
                "category": "events",
                "author_id": "system",
                "author_name": "The Beat 515 News",
                "published": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "news_id": f"news_{uuid.uuid4().hex[:12]}",
                "title": "Top 10 Hits This Week on The Beat 515",
                "content": "Check out this week's hottest tracks dominating the airwaves! From chart-topping pop anthems to viral hits, here's what's been lighting up the request line. Number one for the third consecutive week is the summer anthem everyone can't stop singing. Our DJs have been spinning these non-stop, and listeners are loving every beat.",
                "summary": "This week's hottest tracks and chart-toppers on The Beat 515 playlist.",
                "image_url": "https://images.unsplash.com/photo-1724185773486-0b39642e607e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMG5lb24lMjBzb3VuZHdhdmV8ZW58MHx8fHwxNzc2MDcwNjQzfDA&ixlib=rb-4.1.0&q=85",
                "category": "music",
                "author_id": "system",
                "author_name": "The Beat 515 News",
                "published": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                "updated_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
            },
            {
                "news_id": f"news_{uuid.uuid4().hex[:12]}",
                "title": "Local Artist Spotlight: Rising Stars from the 515",
                "content": "The Beat 515 is proud to showcase local talent from the Des Moines metro area. This month we're featuring three up-and-coming artists who are making waves in the local music scene. From indie pop to hip-hop, these artists represent the best of what our community has to offer. Tune in every Sunday at 8 PM for our Local Spotlight hour.",
                "summary": "Highlighting local artists making waves in the 515 music scene.",
                "image_url": "https://static.prod-images.emergentagent.com/jobs/b1349ab8-20f7-48b5-b900-fc668397ebb1/images/8d660514dfc2116f64218cda821c96160d24b08bbcff48a69d80d36dbaa8b6ce.png",
                "category": "local",
                "author_id": "system",
                "author_name": "The Beat 515 News",
                "published": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
                "updated_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
            },
            {
                "news_id": f"news_{uuid.uuid4().hex[:12]}",
                "title": "Contest Alert: Win Backstage Passes!",
                "content": "The Beat 515 is giving away VIP backstage passes to the biggest concert of the year! Listen for the cue-to-call and be caller number 5 to win. You and a friend will get to meet the artists, enjoy premium viewing areas, and take home exclusive merchandise. Contest runs all week during the morning show. Good luck!",
                "summary": "Win VIP backstage passes by listening for the cue-to-call this week!",
                "image_url": "",
                "category": "contests",
                "author_id": "system",
                "author_name": "The Beat 515 News",
                "published": True,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
                "updated_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
            }
        ]
        await db.news.insert_many(sample_news)
        logger.info("Sample news seeded")
    
    # Seed now playing
    np = await db.now_playing.find_one({"active": True})
    if not np:
        await db.now_playing.insert_one({
            "song_title": "Blinding Lights",
            "artist": "The Weeknd",
            "album": "After Hours",
            "dj_name": "AutoDJ",
            "active": True,
            "started_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Seed stream config
    sc = await db.stream_config.find_one({"active": True})
    if not sc:
        await db.stream_config.insert_one({
            "stream_url": "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
            "station_name": "The Beat 515",
            "tagline": "Proud. Loud. Local.",
            "active": True
        })
    
    logger.info("The Beat 515 backend started successfully!")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
