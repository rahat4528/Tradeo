import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BoardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BoardGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    if (data?.boardId) {
      client.join(`board:${data.boardId}`);
      this.logger.log(`Client ${client.id} joined board:${data.boardId}`);
      return { status: 'joined', boardId: data.boardId };
    }
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { boardId: string },
  ) {
    if (data?.boardId) {
      client.leave(`board:${data.boardId}`);
      return { status: 'left', boardId: data.boardId };
    }
  }

  notifyCardCreated(boardId: string, card: any) {
    if (this.server) {
      this.server.to(`board:${boardId}`).emit('card:created', card);
    }
  }

  notifyCardMoved(boardId: string, payload: any) {
    if (this.server) {
      this.server.to(`board:${boardId}`).emit('card:moved', payload);
    }
  }

  notifyCardUpdated(boardId: string, card: any) {
    if (this.server) {
      this.server.to(`board:${boardId}`).emit('card:updated', card);
    }
  }

  notifyListCreated(boardId: string, list: any) {
    if (this.server) {
      this.server.to(`board:${boardId}`).emit('list:created', list);
    }
  }
}
