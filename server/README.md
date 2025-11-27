### Room structure :

```
let rooms = new Map();

// for room initialization
rooms.set(roomid, roomdata)

{
  "id": String,
  "drawnNumber": Array,
  "winnerCount" : Number,
  "winner" : Array
}
```

### Player structure :

```
let players = new Map();

// during room initialized
players.set("roomid1", new Map())

// for player adding
let getRoom = players.get(roomid);
getRoom.set(userid1, userdata);

{
    "roomId" : {
        "player1" : {},
        "player2" : {},
    }
}

// players

{
    "name" : String,
    "claims" : Number,
    "ticket" : Number,
}
```

### socketMap Structure :

```
let socketMap = new Map();

// during room initialize
socketMap.set(roomId, new Map());
{
    roomId : []
}

// during adding player
let addToSocket = socketMap.get(roomId);
addToSocket.set(socketId, userId)

{
    roomId : {
        socketId1 : userId123,
        socketId23 : userId432,
    }
}

```
