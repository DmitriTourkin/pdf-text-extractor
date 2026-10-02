import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'cookie';
import { FRONTEND_ORIGIN } from 'src/common/constants';

@WebSocketGateway({ cors: { origin: FRONTEND_ORIGIN, credentials: true }, })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket, ...args: any[]) {
    const cookies = parse(client.handshake.headers.cookie ?? '');
    const token = cookies.accessToken;

    if (!token) {
      this.logger.log(`Подключение без токена отклонено: ${client.id}`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        token,
      );
      client.join(this.getUserRoom(payload.sub));
      this.logger.log(`Клиент ${client.id} авторизован как ${payload.email}`);
    } catch {
      this.logger.warn(`Невалидный токен, отключаю: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Клиент отключился: ${client.id}`);
  }

  private getUserRoom(userId: string): string {
    return `user:${userId}`;
  }

  notifyFileProcessed(
    userId: string,
    payload: { fileId: string; status: string },
  ) {
    this.server.to(this.getUserRoom(userId)).emit('file:processed', payload);
  }
}
