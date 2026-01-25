import { Global, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gatway';

@Global()
@Module({
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
