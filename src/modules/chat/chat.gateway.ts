import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { RoomService } from '../room/room.service';

type WsUser = { id: string; username?: string; roles?: string[] };

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: true, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chat: ChatService,
    private readonly auth: AuthService,
    private readonly rooms: RoomService,
  ) {}

  // ---- helpers ----
  private getToken(client: Socket): string | null {
    const h = client.handshake;
    const fromAuth = (h.auth as any)?.token;
    const fromHeader = h.headers?.authorization;
    if (fromAuth) return fromAuth as string;
    if (fromHeader?.startsWith('Bearer ')) return fromHeader.slice(7);
    return null;
  }

  private async identify(client: Socket): Promise<WsUser> {
    const token = this.getToken(client);
    if (!token) throw new Error('Missing token');

    const payload = await this.auth.verifyToken(token); // <- make sure AuthService exposes this
    const id = payload.sub ?? payload.id;
    if (!id) throw new Error('Invalid token payload');

    const user: WsUser = {
      id,
      username: payload.username,
      roles: payload.roles ?? [],
    };
    (client.data as any).user = user;
    return user;
  }

  private roomChannel(roomId: string) {
    return `room:${roomId}`;
  }

  // ---- lifecycle ----
  async handleConnection(client: Socket) {
    try {
      await this.identify(client);
      client.emit('ready', { ok: true });
    } catch (err) {
      client.emit('error', { error: 'unauthorized' });
      client.disconnect(true);
    }
  }

  async handleDisconnect(_client: Socket) {
    // optional: track online presence here
  }

  // ---- events ----

  /**
   * Client → server: join a room
   * payload: { roomId: string }
   */
  @SubscribeMessage('joinRoom')
  async onJoin(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsUser = (client.data as any).user;
    if (!payload?.roomId)
      return client.emit('error', { error: 'roomId required' });

    // ensure user is a room member
    const room = await this.rooms.getRoomById(payload.roomId);
    const isMember = room.members.some((m) => String(m) === user.id);
    if (!isMember) return client.emit('error', { error: 'not a member' });

    await client.join(this.roomChannel(payload.roomId));
    client.emit('joined', { roomId: payload.roomId });
  }

  /**
   * Client → server: leave room
   * payload: { roomId: string }
   */
  @SubscribeMessage('leaveRoom')
  async onLeave(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload?.roomId)
      return client.emit('error', { error: 'roomId required' });
    await client.leave(this.roomChannel(payload.roomId));
    client.emit('left', { roomId: payload.roomId });
  }

  /**
   * Client → server: send message
   * payload: { roomId: string, content: string }
   */
  @SubscribeMessage('sendMessage')
  async onSend(
    @MessageBody() payload: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsUser = (client.data as any).user;
    if (!payload?.roomId || !payload?.content) {
      return client.emit('error', { error: 'roomId & content required' });
    }

    const msg = await this.chat.sendMessage(
      payload.roomId,
      user.id,
      payload.content,
    );

    // broadcast to everyone in that room
    this.server.to(this.roomChannel(payload.roomId)).emit('message', {
      id: msg.id,
      roomId: msg.roomId,
      userId: msg.userId,
      content: msg.content,
      createdAt: msg.createdAt,
    });
  }

  /**
   * Client → server: history request (ack pattern)
   * payload: { roomId: string, limit?: number, before?: string }
   */
  @SubscribeMessage('history')
  async onHistory(
    @MessageBody()
    payload: { roomId: string; limit?: number; before?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload?.roomId)
      return client.emit('error', { error: 'roomId required' });
    const data = await this.chat.listHistory(
      payload.roomId,
      payload.limit ?? 50,
      payload.before,
    );
    client.emit('history', { roomId: payload.roomId, items: data });
  }
}
