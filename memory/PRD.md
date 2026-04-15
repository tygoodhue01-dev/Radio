# The Beat 515 - Online Radio Station App PRD

## Overview
**The Beat 515** is a full-stack web application for a Top 40 radio station with the tagline **"Proud. Loud. Local."**

## Architecture
- **Frontend**: React (CRA) with Tailwind CSS, React Router DOM
- **Backend**: FastAPI (Python) with MongoDB (Motor async driver)
- **Auth**: JWT-based custom authentication with bcrypt password hashing

## Original Problem
User wanted to install an existing GitHub repo (https://github.com/tygoodhue01-dev/Radio) which was built with React Native (Expo). The Expo frontend didn't work in the Emergent environment (port 3000 required), so the frontend was converted from Expo/React Native to a standard React web app (CRA).

## What's Been Implemented (April 15, 2026)
### Backend (unchanged from repo)
- Full FastAPI backend with 50+ API endpoints
- JWT auth with brute force protection
- User roles: admin, dj, editor, listener
- Seeded accounts, news, shows, events, contests, podcasts, rewards

### Frontend (newly converted from Expo to React CRA)
- **Home**: Hero section, now playing widget, shows, latest news, events, contests
- **News**: Category filter, article listing, detail view
- **Requests**: Song request form, live chat, recent requests list
- **Rewards**: Points display, daily check-in, rewards catalog, redemption, activity history
- **Admin Panel**: Dashboard stats, user management (role change/delete), request management (approve/reject/delete), news creation
- **Profile**: Edit name/bio, points display, logout
- **Schedule**: Weekly programming schedule display
- **Leaderboard**: Top listeners by lifetime points
- **Recently Played**: Song history list
- **About, Contact, Careers**: Static/form pages
- **Auth**: Login/Register with proper loading state handling
- **Now Playing Bar**: Persistent bottom bar with play/pause, song info, volume control
- **Navigation**: Responsive navbar with mobile menu

## User Roles
| Role | Access |
|------|--------|
| Admin | Full control: manage users, content, settings, now playing |
| DJ | Manage shows, update now playing, manage requests |
| Editor | Create/edit news articles |
| Listener | Browse content, make song requests, chat, earn rewards |

## Design
- Dark neon theme (#09090b base)
- Hot Pink (#FF007F) primary, Cyan (#00F0FF) secondary, Yellow (#FFF000) accent
- Fonts: Syne (display), DM Sans (body), JetBrains Mono (mono)
- Glassmorphism cards with backdrop blur
- Responsive: max-width 6xl, mobile-friendly

## P0 (Completed)
- [x] Convert Expo frontend to React CRA
- [x] All pages functional end-to-end
- [x] Auth working with proper loading states
- [x] Admin panel with stats, users, requests, news creation

## P1 (Backlog)
- [ ] Polls feature (backend exists, no frontend)
- [ ] Podcasts/Replays page (backend exists)
- [ ] Advanced analytics dashboard
- [ ] Push notifications (web)
- [ ] Role management UI
- [ ] Job application management in admin

## P2 (Future)
- [ ] Real-time chat via WebSockets
- [ ] Song rating and favorites UI
- [ ] Charts/trending page
- [ ] Rich text editor for news
- [ ] Image upload for news/profile
