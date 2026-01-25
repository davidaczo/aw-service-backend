import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { configService } from './config/config.service';

@WebSocketGateway({ cors: true })
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Socket server initialized');
  }

  private rejectClient(client: Socket) {
    client.disconnect();
  }

  private getQueryItem(query: any, key: string) {
    return Array.isArray(query[key]) ? query[key][0] : query[key];
  }

  handleConnection(client: Socket) {
    const { query } = client.handshake;
    const token = this.getQueryItem(query, 'token');

    if (token) {
      if (token !== configService.getSocketToken()) {
        this.rejectClient(client);
      } else {
        const type = this.getQueryItem(query, 'type');
        if (!type) {
          this.rejectClient(client);
        }
      }
      return;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleDisconnect() {}
}
