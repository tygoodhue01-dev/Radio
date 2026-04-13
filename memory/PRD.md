# The Beat 515 - Online Radio Station App PRD

## Overview
**The Beat 515** is a full-stack mobile and web application for a Top 40 radio station with the tagline **"Proud. Loud. Local."**

## Tech Stack
- **Frontend**: React Native (Expo SDK 54) with expo-router - works on mobile AND desktop
- **Backend**: FastAPI (Python) with MongoDB
- **Auth**: JWT-based custom authentication

## User Roles
| Role | Access |
|------|--------|
| Admin | Full control: manage users, content, settings, now playing |
| DJ / On-Air Talent | Manage shows, update now playing, manage requests |
| News Editor | Create/edit news articles |
| Listener | Browse content, make song requests, chat, earn rewards |

## Features
### Core
- **Public Homepage** — No login required to browse Now Playing, news, shows
- **Live Streaming Player** — Play/pause radio stream with Now Playing display
- **Song Request Line** — Combined form + live chat experience
- **News Feed** — Categorized articles (music, events, local, contests)
- **Show Profiles** — DJ shows with schedules
- **Listener Rewards** — Points system: +25 daily check-in, +10 requests, +5 chat
- **Admin Dashboard** — Stats, user management, content creation, request management
- **Responsive Design** — Optimized for both mobile AND desktop (centered max-width 960px)

### Authentication
- Email/password registration and login
- JWT access tokens (24hr) + refresh tokens (7 days)
- Role-based access control
- Brute force protection

### Rewards System
- Points: Check-in (+25), Song Request (+10), Chat (+5)
- Rewards catalog: Shoutouts, Priority Requests, Sticker Packs, VIP Badges, Concert Entries, DJ Meet & Greets
- Leaderboard and history tracking
- Redemption with point validation

## Design
- Dark neon theme (#09090b base)
- Hot Pink (#FF007F) primary, Cyan (#00F0FF) secondary, Yellow (#FFF000) live badges
- Responsive: centered max-width on desktop, full-width on mobile
- Side-by-side hero+shows on desktop, stacked on mobile

## Seeded Accounts
- Admin: admin@thebeat515.com / Beat515Admin!
- DJ: dj@thebeat515.com / DJBeat515!
- Editor: news@thebeat515.com / News515!
