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

  %% who consumes what
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

  AUTH --> USERS   %% auth often needs user lookups

  %% exported providers (bold)
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