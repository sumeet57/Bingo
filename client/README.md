# Bingo — Frontend Documentation

This frontend is the user-facing interface for Bingo.  
It handles the landing page, authentication, lobby management, game board UI, ticket rendering, number selection, pattern claiming, and realtime updates from the backend via Socket.IO.  
The frontend is built using React, TailwindCSS, Framer Motion, and React Context for managing user and socket state.

---

## TECHNOLOGIES USED

- Framework: React
- Bundler/Dev Server: Vite (or CRA equivalent)
- Styling: Tailwind CSS
- Animation: Framer Motion
- Notifications: React Toastify
- State Management: React Context API (UserContext + SocketContext)
- Realtime: Socket.IO client

---

## ROLE OF FRONTEND

The frontend is responsible for:

- Displaying Landing / Marketing UI for Bingo
- Handling authentication flows (login / signup)
- Managing user state (logged-in user, logout)
- Connecting and listening to Socket.IO events through SocketContext
- Allowing host to create rooms and players to join rooms
- Rendering ticket and drawn numbers in realtime
- Allowing users to select numbers and send claim requests
- Handling UI feedback on valid / invalid claims
- Handling reconnection and rejoin flow (based on stored state and server data)

The frontend NEVER decides if a claim is truly valid — it only performs basic checks (like selecting 5 in a line) and the backend remains the final authority.

---

## FOLDER STRUCTURE (TYPICAL)

```
frontend/
├── src/
│ ├── main.jsx → App entry file
│ ├── App.jsx → Routing & providers
│ ├── pages/
│ │ ├── LandingPage.jsx → Public marketing / home page
│ │ ├── Home.jsx → Lobby actions (create/join room)
│ │ ├── Room.jsx → Show room details, players list, start game
│ │ ├── Game.jsx → Ticket view, drawn numbers, claims
│ │ └── Auth.jsx → Login/Register
│ ├── components/
│ │ ├── Ticket.jsx → Ticket grid UI / cell selection
│ │ ├── DrawnNumbers.jsx → Drawn numbers horizontal bar + modal
│ │ ├── socket.js → Socket.IO client instance
│ ├── context/
│ │ ├── UserContext.jsx → User auth state, API calls, logout
│ │ └── SocketContext.jsx → Socket connection, event handlers, game state
│ ├── styles/ → (if any global CSS/Tailwind configs)
│ └── ... → utility hooks, helpers, etc.
├── index.html
└── package.json
```

## ENVIRONMENT CONFIGURATION

Create a `.env` (or `.env.local`) file for frontend:

- VITE_BACKEND_URL=http://localhost:5000

- This value is used for:
  - API calls (login, etc.)
  - Socket connection (if using explicit URL)

---

## INSTALLATION & RUNNING

- Go to frontend folder:

  - cd frontend

- Install dependencies:

  - npm install

- Run the development server:
  - npm run dev

Default dev URL (Vite):  
http://localhost:5173

---

## ROUTING

Routes (typical):

- `/` → LandingPage (marketing, info, Go to Play)
- `/auth` → Auth page (login/register)
- `/home` or `/` → Home (for logged-in user, create/join room buttons)
- `/room` → Room page (show room details, players, start game button)
- `/game` → Game page (ticket + drawn numbers + claiming)

Routing library: react-router-dom

---

## CONTEXTS

**UserContext:**

- Stores logged-in user details
- Provides login, logout, auto-redirect for unauthorized access
- Exposes current user to pages (Home, Room, Game, etc.)

**SocketContext:**

- Manages the Socket.IO connection
- Keeps track of:
  - room state
  - player ticket index
  - drawn numbers
  - claim count (for B I N G O)
  - whether the user is host or player
- Exposes actions:
  - callNextNumber()
  - claimPattern()
  - setSelectedNumbers()
  - handleRoomUpdate() etc.

By using SocketContext, all components (Home, Room, Game) access a single shared realtime state.

---

## KEY UI COMPONENTS

**Ticket.jsx:**

- Renders a 5x5 grid for the Bingo ticket
- Middle cell is rendered as FREE (★)
- Supports:
  - highlighted cells when selected
  - visual style changes when number is drawn
  - strike-through style when number is part of a successful claim
- Passes cell clicks back via `onCellToggle` callback

**DrawnNumbers.jsx:**

- Shows the drawn numbers in a horizontal scrollable bar at the top
- Latest drawn number is visually highlighted
- Provides a modal that shows all numbers from 1–99 with drawn numbers highlighted
- Host sees a “Pick Number” or similar button that triggers socket event for new number

**Game.jsx:**

- Orchestrates ticket and drawn numbers display
- Uses SocketContext state:
  - drawnNumbers
  - claims (for B I N G O display)
  - isHost
  - selectedNumbers from context
- Contains logic to:
  - validate straight-line selection on client side
  - ensure exactly 5 cells selected for claim
  - allow FREE center logic (4 or 5 drawn numbers)
- Sends only valid claim attempts to backend; backend decides final result
- After successful claim:
  - resets selected cells
  - updates UI to show claimed numbers as “used”

---

## RECONNECTION & STATE RESTORE

The frontend is designed to support reconnection scenarios:

- On reconnect, SocketContext emits a request to rejoin the room if a roomId is stored locally (for example via localStorage or state).
- Server responds with:
  - current room state
  - assigned ticket index
  - current drawn numbers
- Game.jsx / Room.jsx then restore their state based on this updated data.

**IMPORTANT:**  
Front-end only uses local storage or state to remember which room and ticket user belongs to — it does not store sensitive auth tokens directly without proper security checks.

---

## VALIDATION ON CLIENT SIDE

The client does basic checks before sending a claim:

- Must select exactly 5 cells
- Selected cells must form a straight line:
  - same row
  - same column
  - main diagonal or anti-diagonal
- If FREE center is included, it is handled as a valid part of diagonal/row/column

If these conditions fail, the client:

- shows error using React Toastify
- does not even send claim request to backend

But:  
Final validation still belongs to server (server checks drawn numbers and ensures it is not previously claimed).

## AUTHOR (FRONTEND)

Built by: Sumeet  
Portfolio: https://sumeet.live  
GitHub: https://github.com/sumeet57  
Instagram: @sumeet.codes  
LinkedIn: https://linkedin.com/in/sumeet-umbalkar

---
