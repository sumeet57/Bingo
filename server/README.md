# Bingo — Backend Documentation

This backend represents the core game engine for Bingo.  
It manages rooms, players, number draws, claim validation, sockets, and game persistence using Node.js + Express + Socket.IO + MongoDB.

---

## TECHNOLOGIES USED

- Runtime: Node.js
- Server Framework: Express.js
- Realtime Communication: Socket.IO
- Database: MongoDB (Mongoose)
- Storage Mode: In-memory Maps (rooms, players, tickets, sockets)

---

## PROJECT RESPONSIBILITY (BACKEND ONLY)

✔ Room creation and management  
✔ Ticket assignment (non-repeating)  
✔ Number draw generation and broadcast  
✔ Claim validation server-side only  
✔ Multi-winner tracking based on winnerLimit  
✔ Cleanup & disposal of memory after match end  
✔ DB logging (match summary / winners / players)

Client has no authority to approve a claim — validation happens exclusively here.

---

## REPOSITORY STRUCTURE (BACKEND)

```
backend/
├── src/
│ ├── index.js → Server startup entry
│ ├── app.js → Express initialization + HTTP binding
│ ├── config/Database.js → MongoDB connection
│ ├── sockets/
│ │ ├── room.socket.js → Room creation / joining / leaving
│ │ ├── game.socket.js → Draw number, claim pattern
│ ├── store/
│ │ ├── room.js → In-memory room store (Map)
│ │ ├── player.js → Player store Map
│ │ ├── socketStore.js → socket.id <→ user.id mapping
│ └── models/
│ ├── Room.model.js → Game result save structure
│ └── User.model.js → Authentication user schema (if exists)
└── README.backend.txt → This file
```

## ENVIRONMENT VARIABLES REQUIRED

(Make a .env file)

```
PORT=5000
MONGO_URI=your_mongo_connection_string_here
JWT_SECRET=any_secure_key
ORIGIN=http://localhost:5173 (client domain)
```

## HOW TO RUN

- Navigate to backend folder:

  - Install dependencies: npm install

- Start server:
  - npm start

Server will run typically at:  
http://localhost:5000

---

## SOCKET EVENTS (COMMUNICATION CONTRACT)

### Room Events:

- `room:create` → Create room
- `room:join` → Join a room
- `room:leave` → When player exits/lost connection
- `room:updated` → Broadcast updated room state

### Game Events:

- `bingo:get_ticket` → Sends user ticket from index
- `bingo:call_number` → Host draws random undrawn number
- `bingo:claim` → Validate winning line
- `bingo:number` → Emits new drawn number to all clients

---

## ROOM OBJECT STRUCTURE (SERVER STORE)

```
{
"id": "String / Number",
"drawnNumbers": [Number],
"status": "pending" | "ongoing" | "completed",
"winnerLimit": Number,
"winners": [userId],
"ticketsAssigned": [0...99] (ticket indexes used)
}
```

---

## PLAYER STORE STRUCTURE

```
players = {
roomId -> Map(
userId -> {
name: String,
ticketIndex: Number,
claims: Number,
claimedLines: [[numbers]],
}
)
}
```

---

## GAME FLOW (BACKEND SIDED SUMMARY)

- Host creates room → backend allocates room store
- Players join → backend assigns unused ticket index
- Host calls `/bingo:call_number` → backend picks next random number
- Client claims → backend verifies if:  
  • exactly 5 numbers  
  • straight line only  
  • numbers must be drawn already  
  • line not previously claimed
- If valid → increment player claims count
- When winnerLimit reached → room status "completed"
- Room + player + socket stores removed from memory
- Final summary written to MongoDB

---

## SCALABILITY NOTES

To scale horizontally:

- store rooms in Redis or distributed memory
- enforce sticky sessions OR use socket.io adapter for cluster mode

Possible Enhancements:

- sharded ticket server
- match history paging
- separate event worker layer

---

## CREDITS (BACKEND)

Developer — Sumeet  
GitHub — https://github.com/sumeet57  
Portfolio — https://sumeet.live

---
