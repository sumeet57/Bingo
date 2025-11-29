# Bingo — Realtime Multiplayer Bingo (MERN + Socket.IO)

Bingo is a production-grade realtime multiplayer Bingo game built using MERN + Socket.IO with secure claim validation, unique ticket distribution, anti-cheat logic, smart reconnection, and fast synchronized gameplay.

This repository contains:

- **frontend** → React UI with Tailwind, Framer Motion, Toastify, Context-based Socket system
- **backend** → Node + Express + Socket.IO server with MongoDB + in-memory game state

---

## FEATURES

### Core Gameplay:

- 5×5 Bingo ticket with FREE center
- Each player receives a unique, non-repeating ticket
- Straight line win detection (row / column / diagonal)
- Multiple winners allowed based on limit defined by host
- Full server-side validation to prevent cheating

### Realtime Engine:

- Live number drawing synced across all clients
- Instant socket-based UI state changes
- Automatic reconnection recovery (restores game state)
- Memory cleanup after room closes

### Fairness & Safety:

- Claims verified only on server
- Duplicate winning lines are rejected
- Scattered/invalid claim patterns blocked automatically

---

## ARCHITECTURE SUMMARY

### System Flow:

React frontend communicates with backend via WebSockets (Socket.IO) for realtime gameplay and via REST APIs for authentication and meta-requests.

Server stores room, player and game state in memory Maps for speed.
Once game ends, results are saved in MongoDB.
Rooms are destroyed from memory to free usage.

### High-level:

React Client → Socket.IO → Game State Maps → MongoDB write on match end

---

## PROJECT STRUCTURE

- `/`
- **backend** = socket+http server + game logic + db write
- **frontend** = UI, gameplay, landing page, ticket UI, sync display
- **README.md** = this global overview

---

## TECH STACK

### Frontend:

- React
- TailwindCSS
- Framer Motion
- React Toastify
- Context + Socket state management

### Backend:

- Node.js
- Express
- Socket.IO
- MongoDB (Mongoose)
- In-memory store with Map()

---

## INSTALLATION GUIDE

Clone project:

- git clone https://github.com/sumeet57/bingo
- cd bingo

### Backend Setup:

- cd backend
- npm install
- npm run dev

#### Environment variables (Backend):

```
MONGO_URI=mongodb://localhost:27017/bingo
PORT=5000
JWT_SECRET=secret
ORIGIN=http://localhost:5173
```

### Frontend Setup:

- cd frontend
- npm install
- npm run dev

#### Enviornment variables (Frontend):

```
VITE_BACKEND_URL=http://localhost:5000
```

---

## GAME RULES

**Valid:**

- Must select exactly 5 cells
- Must form a straight line (row, column or diagonal)
- Center FREE cell counts automatically
- All selected numbers must be drawn

**Invalid:**

- Random scattered cells
- Duplicate claim on same line
- Claiming before number drawn
- Client cannot override server check

---

## GAME FLOW

- Host creates room → backend allocates it in memory
- Players join and receive unique ticket index
- Host draws numbers → server broadcasts instantly
- Players tap numbers to mark
- When a 5-line is found → claim → server validates
- Room ends when winnerLimit reached → results saved → memory cleanup

---

## ROADMAP

Future upgrades:

- Public matchmaking
- Leaderboard + tournament system
- Redis + load balancing
- WebRTC voice chat
- PWA / mobile application

---

## AUTHOR

Built by: Sumeet  
Portfolio: https://sumeet.live  
GitHub: https://github.com/sumeet57  
Instagram: @sumeet.codes  
LinkedIn: https://linkedin.com/in/sumeet-umbalkar

---

## SUPPORT

If you like this project, star the repo:  
https://github.com/sumeet57/bingo-arena

Contributions, PRs and feature suggestions are welcome.
