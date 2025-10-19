import { OnModuleInit, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from 'src/shared/types/socket-events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(Gateway.name);

  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.logger.log('🚀 WebSocket Gateway initialized');
  }

  handleConnection(socket: Socket) {
    this.logger.log(`✅ Client connected: ${socket.id}`);
    socket.emit('connected', { message: 'Welcome to Alias Game!' });
  }

  handleDisconnect(socket: Socket) {
    this.logger.warn(`❌ Client disconnected: ${socket.id}`);
  }

  /**
   * Send new chat messages to all clients
   */
  @SubscribeMessage(SOCKET_EVENTS['CHAT_NEW_MESSAGE'])
  onMessage(
    @MessageBody() body: { username: string; message: string },
    // @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(`📨 Message from ${body.username}: ${body.message}`);

    this.server.emit(SOCKET_EVENTS['CHAT_MESSAGE'], {
      from: body.username,
      message: body.message,
      timestamp: new Date().toISOString(),
    });
  }
}
