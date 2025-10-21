```mermaid
flowchart LR
  subgraph AUTH[Auth Module]
    AS[AuthService]
  end

  subgraph USERS[Users Module]
    US[UsersService]
  end

  subgraph WORDS[Words Module]
    WS[WordService]
    SS[SimilarityService]
  end

  subgraph LOBBY[Lobby Module]
    LS[LobbyService]
  end

  subgraph ROOM[Room Module]
    RS[RoomService]
  end

  subgraph GAME[Game Module]
    GS[GameService]
    ScS[ScoreService]
  end

  subgraph CHAT[Chat Module]
    CS[ChatService]
  end


  GAME --> AUTH
  GAME --> USERS
  GAME --> WORDS
  GAME --> LOBBY
  GAME --> ROOM

  CHAT --> AUTH
  CHAT --> LOBBY
  CHAT --> ROOM
  CHAT --> GAME

  LOBBY --> AUTH
  LOBBY --> USERS
  LOBBY --> ROOM

  ROOM --> AUTH
  ROOM --> USERS

  AUTH --> USERS  


  style AS fill:#fff,stroke:#000,stroke-width:2px
  style US fill:#fff,stroke:#000,stroke-width:2px
  style WS fill:#fff,stroke:#000,stroke-width:2px
  style SS fill:#fff,stroke:#000,stroke-width:2px
  style LS fill:#fff,stroke:#000,stroke-width:2px
  style RS fill:#fff,stroke:#000,stroke-width:2px
  style GS fill:#fff,stroke:#000,stroke-width:2px
  style ScS fill:#fff,stroke:#000,stroke-width:1px  %% optional export
  style CS fill:#fff,stroke:#000,stroke-width:2px
```


What to implement now
	1.	UsersModule: GET /users/me, PATCH /users/me (username).
	2.	WordsModule: seed service + SimilarityService + private draw(n) used by Game.
	3.	RoomModule: create/list/get/join/leave + team CRUD (waiting phase).
	4.	ChatModule: gateway + persistence + pagination + WS auth.
	5.	GameModule: start → rounds/turns/guess/skip/end; emit events.

If you want, I can stub each controller/service next with minimal DTOs so your team can parallelize (one person per module) without stepping on each other’s toes.