import { Injectable } from '@nestjs/common';

type TurnState = {
  roomId: string;
  teamIndex: number;
  turnSeconds: number;
  expiresAt: number; // epoch ms
  timer?: NodeJS.Timeout;
};

@Injectable()
export class TurnManagerService {
  private byRoom = new Map<string, TurnState>();

  get(roomId: string) {
    return this.byRoom.get(roomId) ?? null;
  }

  clear(roomId: string) {
    const s = this.byRoom.get(roomId);
    if (s?.timer) clearTimeout(s.timer);
    this.byRoom.delete(roomId);
  }

  start(
    roomId: string,
    teamIndex: number,
    turnSeconds: number,
    onTimeout: () => void,
  ) {
    // stop existing
    this.clear(roomId);

    const expiresAt = Date.now() + turnSeconds * 1000;
    const timer = setTimeout(onTimeout, turnSeconds * 1000);

    const state: TurnState = {
      roomId,
      teamIndex,
      turnSeconds,
      expiresAt,
      timer,
    };
    this.byRoom.set(roomId, state);
    return state;
  }

  stop(roomId: string) {
    const s = this.byRoom.get(roomId);
    if (!s) return null;
    if (s.timer) clearTimeout(s.timer);
    s.timer = undefined;
    return s;
  }

  nextTeam(roomId: string, totalTeams: number) {
    const s = this.byRoom.get(roomId);
    if (!s) return null;
    s.teamIndex = (s.teamIndex + 1) % totalTeams;
    return s.teamIndex;
  }
}
