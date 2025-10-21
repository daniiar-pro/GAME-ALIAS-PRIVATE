# CORE MODULES

    1.	AuthModule: POST /auth/signup, POST /auth/login (username or email).
    2.	UsersModule: GET /users/me, PATCH /users/me (username).
    3.	WordsModule: seed service + SimilarityService + private draw(n) used by Game.
    4.	RoomModule: create/list/get/join/leave + team CRUD (waiting phase).
    5.	ChatModule: gateway + persistence + pagination + WS auth.
    6.	GameModule: start → rounds/turns/guess/skip/end; emit events.

# AUTH MODULE

    •	Signup & Login with bcrypt password hashing
    •	JWT access token (Authorization: Bearer <token>)
    •	Refresh token issued as httpOnly cookie and stored hashed in MongoDB
    •	Rotate refresh tokens on /auth/refresh
    •	Logout (current device) & Logout-all (revoke all refresh tokens)
    •	JwtAuthGuard for protected routes
    •	Roles decorator + guard for admin-only endpoints
    •	Swagger decorators on DTOs you already started

Uses your existing User schema with refreshTokens: { tokenHash, expiresAt, createdAt }[].

# USER MODULE

    •	GET /users/me – read your profile
    •	PATCH /users/me – update username and/or email
    •	PATCH /users/me/password – change password (verify current → set new)
    •	UsersService exported so other modules (Auth/Game/Chat) can reuse it
    •	Clean DTOs + Swagger + proper Mongo duplicate-key handling

# WORDS MODULE

    •	Mongoose model wiring
    •	CRUD (admin-only for mutations)
    •	Search with pagination
    •	Random word sampler for rounds
    •	Bulk insert (seeding)
    •	A SimilarityService (Levenshtein + normalization) and a /words/check endpoint for guess validation
    •	Clean DTOs + Swagger + duplicate‐key (11000) handling

# ROOM MODULE

    •	Room CRUD + search
    •	Join/leave room
    •	Teams management (create/delete, assign/remove players)
    •	Start game (creates a Game doc, links it to the room, switches phase to inGame)
    •	Guards-ready endpoints (you can flip on global guards or uncomment per-route guards)
    •	Clean DTOs, Swagger docs, helpful errors

    How it works (quick mental model)
    •	Rooms are the waiting area: create, list, join/leave.
    •	Teams live inside a room as embedded docs (simple + fast updates).
    •	While phase = waiting you can edit teams and assignments.
    •	POST /rooms/:id/start validates prerequisites (min players, everyone assigned), creates a Game doc (with fresh team scores), links it via activeGameId, and flips phase → inGame.
    •	Later, your GameModule runs turns, scoring, etc., and when finished it can set room phase to finished.

    If you prefer the GameModule to own creation, make RoomService.startRoom call a GameService.startForRoom(room, maxRounds) instead of touching the Game model directly.


    Security / Guards
        •	If your JWT + Roles guards are global (APP_GUARD), you’re set.
        •	If not, uncomment the @UseGuards lines and add your decorators.
        •	Deleting a room is restricted to creator or admin (see deleteRoom()).

# CHAT MODULE

## How to use (quick client snippet)

HTTP

```
POST /chat/rooms/:roomId/messages with { content } in body → persists + echoes
GET /chat/rooms/:roomId/messages?limit=50&before=<ISO> → history
```

WS (Socket.IO)

```
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'Bearer <JWT-HERE>' }, // or headers.authorization (Bearer ...)
});

// after 'ready'
socket.emit('joinRoom', { roomId: '...' });
socket.emit('sendMessage', { roomId: '...', content: 'hi!' });
socket.on('message', (m) => console.log('message:', m));

socket.emit('history', { roomId: '...', limit: 50 });
socket.on('history', (payload) => console.log(payload.items));
```

# GAME MODULE

### How this hangs together

Start game (REST POST /game/rooms/:roomId/start or WS start)

Validates room → copies room.teams into a new Game doc → sets room.phase='inGame' & activeGameId → starts a turn timer for team 0.

Turns

Ephemeral TurnManagerService keeps {teamIndex, expiresAt} per room.

- turn:start → (re)starts timer
- Timeout → auto turn:next (via service callback)
- turn:next → rotates team index, restarts timer

Scoring

- score endpoint/event increments teams.$.score atomically in the Game doc.

Rounds & Finish

- round:end increments currentRound (or finishes if == maxRounds) and resets the turn to team 0.
- finish sets isFinished=true, clears in-memory timer, marks room finished.

Real-time

- Clients join channel game:<roomId>. After any change, the gateway emits state with the whole public game state so UIs can re-render (timer secondsLeft, scores, round, current team, etc.).

### QUICK client usage (socket.IO)

```
import { io } from 'socket.io-client';

const sock = io('http://localhost:3000/game', {
  auth: { token: 'Bearer <JWT>' },
});

sock.on('ready', () => {
  sock.emit('join', { roomId: '<roomId>' });
});

sock.on('state', (s) => console.log('state:', s));

// Start a game
sock.emit('start', { roomId: '<roomId>', maxRounds: 5, turnSeconds: 60 });

// During play
sock.emit('turn:start', { roomId: '<roomId>' });
sock.emit('score', { roomId: '<roomId>', teamId: 'teamA', delta: +1 });
sock.emit('turn:next', { roomId: '<roomId>' });
sock.emit('round:end', { roomId: '<roomId>' });

// Finish
sock.emit('finish', { roomId: '<roomId>' });
```
