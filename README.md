# WikiRace
=======
# WikiRace 

A real-time multiplayer browser game where players race through Wikipedia articles by clicking links.

## How to Play

1. Host creates a room.
2. Share the **6-letter room code** with friends
3. Host picks a **start article** and **target article**
4. Everyone clicks Wikipedia links to navigate toward the target
5. **First to reach the target wins!**

---

## Project Structure

```
wikirace/
├── server/          # Node.js + Socket.io for backend
│   ├── index.js
│   └── package.json
└── client/          # React for frontend (Vite)
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Lobby.jsx
    │   │   ├── Game.jsx
    │   │   └── Results.jsx
    │   └── components/
    │       └── ArticleSearch.jsx
    ├── index.html
    └── package.json
```
---

## Features

- Real-time multiplayer via Socket.io
-  6-letter room codes
-  Up to 8 players per room
-  Wikipedia autocomplete when picking articles
-  Live leaderboard during the race
-  Click counter + timer per player
-  Path history (breadcrumb trail)
-  Give up option
-  Play again without leaving the room
-  Host transfer if host disconnects

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Wikipedia | REST API (rest_v1) + OpenSearch API |
| Hosting | Railway (server) + Vercel (client) |

---
