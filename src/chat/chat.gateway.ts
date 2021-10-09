import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Socket } from "socket.io";

@WebSocketGateway({ cors: true, allowEIO3: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor() {
  }

  @WebSocketServer()
  server;

  connectedUsers: string[] = [];
  rooms: any = [];

  afterInit(server: any): any {
    console.log("Initizialized");
  }

  handleConnection(socket: Socket) {
    console.log("connected", socket.id);
    // console.log(socket.handshake.headers.authorization);
  }

  handleDisconnect(socket: Socket): any {
    console.log("disconect", socket.id);
  }

  @SubscribeMessage("message")
  handleMessage(@MessageBody() message: string): void {
    // socket.handshake.query.token;
    console.log(message);
    this.server.emit("message", message);
  }


  @SubscribeMessage("join")
  async onRoomJoin(client, data: any): Promise<any> {
    client.join(data[0]);

    // const messages = await this.roomService.findMessages(data, 25);

    // Send last messages to the connected user
    // client.emit('message', messages);
  }

  @SubscribeMessage("leave")
  onRoomLeave(client, data: any): void {
    client.leave(data[0]);
  }
}