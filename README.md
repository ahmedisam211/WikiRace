<<<<<<< HEAD
# WikiRace
=======
# WikiRace 🏁

A real-time multiplayer browser game where players race through Wikipedia by clicking links.

## How to Play

1. Host creates a room and picks a **start article** and **target article**
2. Share the **6-letter room code** with friends
3. Everyone clicks Wikipedia links to navigate toward the target
4. **First to reach the target wins!**

---

## Project Structure

```
wikirace/
├── server/          # Node.js + Socket.io backend
│   ├── index.js
│   └── package.json
└── client/          # React frontend (Vite)
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

## Local Development

### 1. Start the server

```bash
cd server
npm install
npm run dev        # uses nodemon for auto-reload
# OR
npm start          # production
```

Server runs on **http://localhost:3001**

### 2. Start the client

```bash
cd client
npm install
cp .env.example .env   # uses localhost:3001 by default
npm run dev
```

Client runs on **http://localhost:5173**

Open two browser tabs (or different browsers) to test multiplayer!

---

## Deployment

### Server → Railway (recommended, free tier)

1. Push the `/server` folder to a GitHub repo (or use a monorepo)
2. Go to [railway.app](https://railway.app), create a new project
3. Connect your GitHub repo, set root to `/server`
4. Railway auto-detects Node.js and runs `npm start`
5. Note your Railway URL: `https://your-app.up.railway.app`

**Environment variables on Railway:**
```
PORT=3001        (Railway sets this automatically)
CLIENT_URL=https://your-frontend.vercel.app
```

### Client → Vercel

1. Push the `/client` folder to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. Set the root directory to `client`
4. Add environment variable:
   ```
   VITE_SERVER_URL=https://your-app.up.railway.app
   ```
5. Deploy — Vercel gives you a URL like `https://wikirace.vercel.app`

### Alternative: Render (server)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your repo, set root to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Note: free tier spins down after inactivity (cold start ~30s)

---

## Features

- ✅ Real-time multiplayer via Socket.io
- ✅ 6-letter room codes
- ✅ Up to 8 players per room
- ✅ Wikipedia autocomplete when picking articles
- ✅ Live leaderboard during the race
- ✅ Click counter + timer per player
- ✅ Path history (breadcrumb trail)
- ✅ Give up option
- ✅ Play again without leaving the room
- ✅ Host transfer if host disconnects

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

## Customization Ideas

- Add a **time limit** per game
- Add **random article** button using `https://en.wikipedia.org/api/rest_v1/page/random/summary`
- Track **all-time fastest runs** with a leaderboard (add a database)
- Add **chat** between players during the race
- Show the **article graph** of how each player navigated
>>>>>>> b1bf680 (first)
