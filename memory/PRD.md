# The Beat 515 - Online Radio Station App PRD

## Overview
**The Beat 515** is a full-stack mobile and web application for a Top 40 radio station with the tagline **"Proud. Loud. Local."**

## Tech Stack
- **Frontend**: React Native (Expo SDK 54) with expo-router
- **Backend**: FastAPI (Python) with MongoDB
- **Auth**: JWT-based custom authentication

## User Roles
| Role | Access |
|------|--------|
| Admin | Full control: manage users, content, settings, now playing |
| DJ / On-Air Talent | Manage shows, update now playing, manage requests |
| News Editor | Create/edit news articles |
| Listener | Browse content, make song requests, chat |

## Features
### Core
- **Live Streaming Player**: Play/pause radio stream with Now Playing display
- **Song Request Line**: Combined form + live chat experience
- **News Feed**: Categorized articles (music, events, local, contests)
- **Show Profiles**: DJ shows with schedules
- **Admin Dashboard**: Stats overview, user management, content creation, request management

### Authentication
- Email/password registration and login
- JWT access tokens (24hr) + refresh tokens (7 days)
- Role-based access control
- Brute force protection (5 attempts = 15 min lockout)

## Design
- Dark neon theme (#09090b base)
- Hot Pink (#FF007F) primary
- Cyan (#00F0FF) secondary
- Yellow (#FFF000) live badges
- Glassmorphic card surfaces

## API Endpoints
- Auth: /api/auth/login, /register, /logout, /me, /refresh
- News: /api/news (CRUD)
- Requests: /api/requests + /api/requests/chat
- Shows: /api/shows
- Now Playing: /api/now-playing
- Admin: /api/admin/users, /api/admin/stats
- Stream: /api/stream-config

## Seeded Data
- 3 user accounts (admin, dj, editor)
- 4 sample news articles
- 2 DJ shows
- Default now playing track
