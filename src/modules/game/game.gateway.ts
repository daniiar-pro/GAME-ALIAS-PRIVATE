import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { GameService } from './game.service';
import { AuthService } from '../auth/auth.service';
import { RoomService } from '../room/room.service';

type WsUser = { id: string; username?: string; roles?: string[] };

@WebSocketGateway({
  namespace: '/game',
  cors: { origin: true, credentials: true },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly game: GameService,
    private readonly auth: AuthService,
    private readonly rooms: RoomService,
  ) {}

  // ---- auth helpers ----
  private getToken(client: Socket) {
    const auth = client.handshake.auth as any;
    const h = client.handshake.headers;
    if (auth?.token) return auth.token as string;
    if (h?.authorization?.startsWith('Bearer '))
      return h.authorization.slice(7);
    return null;
  }

  private async identify(client: Socket): Promise<WsUser> {
    const token = this.getToken(client);
    if (!token) throw new Error('unauthorized');
    const payload = await this.auth.verifyToken(token);
    const id = payload.sub ?? payload.id;
    if (!id) throw new Error('unauthorized');
    const user: WsUser = {
      id,
      username: payload.username,
      roles: payload.roles ?? [],
    };
    (client.data as any).user = user;
    return user;
  }

  private chan(roomId: string) {
    return `game:${roomId}`;
  }

  // ---- lifecycle ----
  async handleConnection(client: Socket) {
    try {
      await this.identify(client);
      client.emit('ready', { ok: true });
    } catch {
      client.emit('error', { error: 'unauthorized' });
      client.disconnect(true);
    }
  }

  async handleDisconnect(_client: Socket) {}

  // ---- events ----

  @SubscribeMessage('join')
  async join(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsUser = (client.data as any).user;
    if (!payload?.roomId)
      return client.emit('error', { error: 'roomId required' });

    const room = await this.rooms.getRoomById(payload.roomId);
    const isMember = room.members.some((m) => String(m) === user.id);
    if (!isMember) return client.emit('error', { error: 'not a member' });

    await client.join(this.chan(payload.roomId));
    client.emit('joined', { roomId: payload.roomId });

    // send current state on join
    const state = await this.game
      .getPublicStateByRoom(payload.roomId)
      .catch(() => null);
    if (state) client.emit('state', state);
  }

  @SubscribeMessage('leave')
  async leave(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload?.roomId)
      return client.emit('error', { error: 'roomId required' });
    await client.leave(this.chan(payload.roomId));
    client.emit('left', { roomId: payload.roomId });
  }

  // start game (host/member)
  @SubscribeMessage('start')
  async start(
    @MessageBody()
    payload: { roomId: string; maxRounds?: number; turnSeconds?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsUser = (client.data as any).user;
    const state = await this.game.startGame(
      payload.roomId,
      user.id,
      payload.maxRounds ?? 5,
      payload.turnSeconds ?? 60,
    );
    this.server.to(this.chan(payload.roomId)).emit('state', state);
  }

  // start/stop/next turn
  @SubscribeMessage('turn:start')
  async turnStart(
    @MessageBody() payload: { roomId: string; turnSeconds?: number },
  ) {
    const state = await this.game.startTurn(
      payload.roomId,
      payload.turnSeconds,
    );
    this.server.to(this.chan(payload.roomId)).emit('state', state);
  }

  @SubscribeMessage('turn:stop')
  async turnStop(@MessageBody() payload: { roomId: string }) {
    const state = await this.game.stopTurn(payload.roomId);
    this.server.to(this.chan(payload.roomId)).emit('state', state);
  }

  @SubscribeMessage('turn:next')
  async turnNext(@MessageBody() payload: { roomId: string }) {
    const state = await this.game.nextTeam(payload.roomId);
    this.server.to(this.chan(payload.roomId)).emit('state', state);
  }

  // scoring (e.g., on "correct" guess)
  @SubscribeMessage('score')
  async score(
    @MessageBody() payload: { roomId: string; teamId: string; delta: number },
  ) {
    const state = await this.game.updateScore(
      payload.roomId,
      payload.teamId,
      payload.delta,
    );
    this.server.to(this.chan(payload.roomId)).emit('state', state);
  }

  @SubscribeMessage('round:end')
  async roundEnd(@MessageBody() payload: { roomId: string }) {
    const state = await this.game.endRound(payload.roomId);
    this.server.to(this.chan(payload.roomId)).emit('state', state);
  }

  @SubscribeMessage('finish')
  async finish(@MessageBody() payload: { roomId: string }) {
    const state = await this.game.finishGame(payload.roomId);
    this.server.to(this.chan(payload.roomId)).emit('state', state);
  }

  @SubscribeMessage('state')
  async current(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const state = await this.game.getPublicStateByRoom(payload.roomId);
    client.emit('state', state);
  }
}
