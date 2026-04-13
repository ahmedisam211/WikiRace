const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

// In-memory room storage
// rooms[code] = { code, host, players, state, startArticle, endArticle, startedAt, createdAt }
const rooms = {};

function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

function generateUniqueCode() {
    let code;
    do { code = generateCode(); } while (rooms[code]);
    return code;
}

// Clean up rooms older than 2 hours
setInterval(() => {
    const now = Date.now();
    for (const code of Object.keys(rooms)) {
        if (now - rooms[code].createdAt > 2 * 60 * 60 * 1000) {
            delete rooms[code];
        }
    }
}, 10 * 60 * 1000);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", rooms: Object.keys(rooms).length }));

// Fetch article info from Wikipedia (for validation / title resolution)
app.get("/api/article/:title", async(req, res) => {
    try {
        const title = encodeURIComponent(req.params.title);
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
        );
        if (!response.ok) return res.status(404).json({ error: "Article not found" });
        const data = await response.json();
        res.json({ title: data.title, extract: data.extract, thumbnail: data.thumbnail });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch article" });
    }
});

io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // CREATE ROOM — articles chosen later in the lobby
    socket.on("create_room", ({ playerName }) => {
        if (!playerName) {
            return socket.emit("error", { message: "Name is required" });
        }

        const code = generateUniqueCode();
        const player = {
            id: socket.id,
            name: playerName,
            currentArticle: null,
            clickCount: 0,
            path: [],
            finishedAt: null,
            place: null,
        };

        rooms[code] = {
            code,
            host: socket.id,
            players: [player],
            state: "lobby",
            startArticle: null,
            endArticle: null,
            finishOrder: [],
            createdAt: Date.now(),
        };

        socket.join(code);
        socket.data.roomCode = code;
        socket.data.playerName = playerName;

        socket.emit("room_created", { code, room: sanitizeRoom(rooms[code]) });
        console.log(`Room ${code} created by ${playerName}`);
    });

    // SET ARTICLES (host only, in lobby)
    socket.on("set_articles", ({ startArticle, endArticle }) => {
        const code = socket.data.roomCode;
        const room = rooms[code];
        if (!room) return socket.emit("error", { message: "Room not found" });
        if (room.host !== socket.id) return socket.emit("error", { message: "Only the host can set articles" });
        if (room.state !== "lobby") return socket.emit("error", { message: "Cannot change articles mid-game" });
        if (!startArticle || !endArticle) return socket.emit("error", { message: "Both articles required" });
        if (startArticle === endArticle) return socket.emit("error", { message: "Start and end must be different" });

        room.startArticle = startArticle;
        room.endArticle = endArticle;
        room.players.forEach(p => {
            p.currentArticle = startArticle;
            p.path = [startArticle];
        });

        io.to(code).emit("articles_set", { startArticle, endArticle, room: sanitizeRoom(room) });
        console.log(`Room ${code} articles set: ${startArticle} → ${endArticle}`);
    });

    // JOIN ROOM
    socket.on("join_room", ({ playerName, code }) => {
        if (!playerName || !code) return socket.emit("error", { message: "Missing fields" });

        const room = rooms[code.toUpperCase()];
        if (!room) return socket.emit("error", { message: "Room not found" });
        if (room.state !== "lobby") return socket.emit("error", { message: "Game already in progress" });
        if (room.players.length >= 8) return socket.emit("error", { message: "Room is full (max 8)" });

        const existingName = room.players.find(
            (p) => p.name.toLowerCase() === playerName.toLowerCase()
        );
        if (existingName) return socket.emit("error", { message: "Name already taken in this room" });

        const player = {
            id: socket.id,
            name: playerName,
            currentArticle: room.startArticle || null,
            clickCount: 0,
            path: room.startArticle ? [room.startArticle] : [],
            finishedAt: null,
            place: null,
        };

        room.players.push(player);
        socket.join(code.toUpperCase());
        socket.data.roomCode = code.toUpperCase();
        socket.data.playerName = playerName;

        socket.emit("room_joined", { room: sanitizeRoom(room) });
        socket.to(code.toUpperCase()).emit("player_joined", { player: sanitizePlayer(player), players: room.players.map(sanitizePlayer) });
        console.log(`${playerName} joined room ${code}`);
    });

    // START GAME (host only)
    socket.on("start_game", () => {
        const code = socket.data.roomCode;
        const room = rooms[code];
        if (!room) return socket.emit("error", { message: "Room not found" });
        if (room.host !== socket.id) return socket.emit("error", { message: "Only the host can start" });
        if (room.players.length < 1) return socket.emit("error", { message: "Need at least 1 player" });
        if (room.state !== "lobby") return socket.emit("error", { message: "Game already started" });
        if (!room.startArticle || !room.endArticle) return socket.emit("error", { message: "Host must set articles before starting" });

        room.state = "countdown";

        // Reset all player states
        room.players.forEach((p) => {
            p.currentArticle = room.startArticle;
            p.clickCount = 0;
            p.path = [room.startArticle];
            p.finishedAt = null;
            p.place = null;
        });
        room.finishOrder = [];

        io.to(code).emit("countdown_start", { seconds: 3 });

        let count = 3;
        const interval = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(interval);
                room.state = "playing";
                room.startedAt = Date.now();
                io.to(code).emit("game_start", {
                    startArticle: room.startArticle,
                    endArticle: room.endArticle,
                    startedAt: room.startedAt,
                });
            } else {
                io.to(code).emit("countdown_tick", { seconds: count });
            }
        }, 1000);
    });

    // PLAYER NAVIGATES TO NEW ARTICLE
    socket.on("navigate", ({ articleTitle }) => {
        const code = socket.data.roomCode;
        const room = rooms[code];
        if (!room || room.state !== "playing") return;

        const player = room.players.find((p) => p.id === socket.id);
        if (!player || player.finishedAt) return;

        player.currentArticle = articleTitle;
        player.clickCount++;
        player.path.push(articleTitle);

        // Check win condition
        const normalizedTarget = room.endArticle.replace(/_/g, " ").toLowerCase();
        const normalizedCurrent = articleTitle.replace(/_/g, " ").toLowerCase();

        if (normalizedCurrent === normalizedTarget) {
            player.finishedAt = Date.now();
            player.place = room.finishOrder.length + 1;
            room.finishOrder.push(socket.id);

            io.to(code).emit("player_finished", {
                player: sanitizePlayer(player),
                place: player.place,
                timeTaken: player.finishedAt - room.startedAt,
                players: room.players.map(sanitizePlayer),
            });

            // All finished? End the game
            const activePlayers = room.players.filter((p) => !p.finishedAt);
            if (activePlayers.length === 0 || room.players.length === 1) {
                endGame(code);
            }
        } else {
            // Broadcast position update to everyone in room
            io.to(code).emit("player_navigated", {
                playerId: socket.id,
                playerName: player.name,
                articleTitle,
                clickCount: player.clickCount,
                players: room.players.map(sanitizePlayer),
            });
        }
    });
    //redeploy
    // GIVE UP
    socket.on("give_up", () => {
        const code = socket.data.roomCode;
        const room = rooms[code];
        if (!room || room.state !== "playing") return;

        const player = room.players.find((p) => p.id === socket.id);
        if (!player) return;

        player.gaveUp = true;
        player.finishedAt = Date.now();

        io.to(code).emit("player_gave_up", {
            playerName: player.name,
            players: room.players.map(sanitizePlayer),
        });

        const activePlayers = room.players.filter((p) => !p.finishedAt);
        if (activePlayers.length === 0) endGame(code);
    });

    // PLAY AGAIN (host resets to lobby)
    socket.on("play_again", () => {
        const code = socket.data.roomCode;
        const room = rooms[code];
        if (!room) return;
        if (room.host !== socket.id) return;

        room.state = "lobby";
        room.finishOrder = [];
        room.startedAt = null;
        room.players.forEach((p) => {
            p.currentArticle = room.startArticle;
            p.clickCount = 0;
            p.path = [room.startArticle];
            p.finishedAt = null;
            p.place = null;
            p.gaveUp = false;
        });

        io.to(code).emit("reset_to_lobby", { room: sanitizeRoom(room) });
    });

    // GET ROOM STATE
    socket.on("get_room", () => {
        const code = socket.data.roomCode;
        const room = rooms[code];
        if (!room) return socket.emit("error", { message: "Room not found" });
        socket.emit("room_state", { room: sanitizeRoom(room) });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
        const code = socket.data.roomCode;
        const room = rooms[code];
        if (!room) return;

        const idx = room.players.findIndex((p) => p.id === socket.id);
        if (idx === -1) return;

        const [removed] = room.players.splice(idx, 1);
        console.log(`${removed.name} disconnected from room ${code}`);

        if (room.players.length === 0) {
            delete rooms[code];
            return;
        }

        // Transfer host if needed
        if (room.host === socket.id) {
            room.host = room.players[0].id;
            io.to(code).emit("host_changed", { newHostId: room.host, newHostName: room.players[0].name });
        }

        io.to(code).emit("player_left", {
            playerName: removed.name,
            players: room.players.map(sanitizePlayer),
        });

        // If only 1 player left during game, end
        if (room.state === "playing" && room.players.filter(p => !p.finishedAt).length === 0) {
            endGame(code);
        }
    });
});

function endGame(code) {
    const room = rooms[code];
    if (!room) return;
    room.state = "finished";
    io.to(code).emit("game_over", {
        players: room.players.map(sanitizePlayer).sort((a, b) => (a.place || 999) - (b.place || 999)),
    });
}

function sanitizePlayer(p) {
    return {
        id: p.id,
        name: p.name,
        currentArticle: p.currentArticle,
        clickCount: p.clickCount,
        path: p.path,
        finishedAt: p.finishedAt,
        place: p.place,
        gaveUp: p.gaveUp || false,
    };
}

function sanitizeRoom(room) {
    return {
        code: room.code,
        host: room.host,
        players: room.players.map(sanitizePlayer),
        state: room.state,
        startArticle: room.startArticle,
        endArticle: room.endArticle,
        startedAt: room.startedAt || null,
    };
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`WikiRace server running on port ${PORT}`));