# The Beat 515 - Online Radio Station App PRD

## Overview
**The Beat 515** is a full-stack web application for a Top 40 radio station with the tagline **"Proud. Loud. Local."**

## Tech Stack
- **Frontend**: React (CRA) with Tailwind CSS, React Router DOM
- **Backend**: FastAPI (Python) with MongoDB (Motor async driver)
- **Auth**: JWT-based custom authentication with bcrypt password hashing
- **Stream**: Live365 CDN stream with Icecast metadata auto-polling

## What's Been Implemented (April 15, 2026)

### Stream Integration
- Stream URL: `https://das-edge62-live365-dal03.cdnstream.com/a55796`
- Auto metadata polling every 2 minutes from stream
- Admin can change stream URL from Dashboard > Stream Settings
- When no song metadata available, shows "The Beat 515 / Now Streaming Live"
- When song plays, auto-updates to show real song title & artist

### Admin Panel (11 tabs with sidebar)
1. **Overview** - Stats (users, news, requests, pending, shows)
2. **Stream Settings** - Stream URL config, station name, tagline (auto metadata)
3. **Requests** - Table with approve/delete
4. **Users** - Full CRUD with edit modal, role change, delete
5. **Publish News** - Create articles with title, summary, content, category
6. **Manage News** - Edit/delete existing articles
7. **Comments** - Approve/delete pending comments
8. **Schedule** - Create/edit/delete time slots with modal
9. **Job Applications** - Review/approve/reject/email/delete
10. **Roles & Permissions** - Create/edit/delete roles, manage permissions
11. **Push Notifications** - Send notifications, view history

### Profile Drawer
- Slides in from right side when clicking user avatar in navbar
- Shows: avatar, name, email, role badge, stats, favorites, quick actions, sign out

### Frontend Pages
- Home (hero with LISTEN LIVE, shows, news, events, contests, podcasts, footer)
- News (category filter, featured article, grid)
- Requests (form, recent requests, live chat)
- Rewards (points, check-in, catalog, leaderboard, history)
- Schedule, About, Careers, Contact, Leaderboard, Recently Played
- Auth (Login, Register)

## Seeded Accounts
- Admin: admin@thebeat515.com / Beat515Admin!
- DJ: dj@thebeat515.com / DJBeat515!
- Editor: news@thebeat515.com / News515!
