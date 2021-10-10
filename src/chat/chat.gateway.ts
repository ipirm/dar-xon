import {
  ConnectedSocket, MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { jwtConstants } from "../auth/jwt/constants";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "./chat.service";
import { Role } from "../enums/roles.enum";

@WebSocketGateway({ cors: true, allowEIO3: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly jwt: JwtService, private readonly chat: ChatService) {
  }

  @WebSocketServer()
  server;

  connectedUsers: any = [];
  rooms: any = [];

  afterInit(server: any): any {
    console.log("Initizialized");
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    const decoded = this.jwt.verify(socket.handshake.auth.token, jwtConstants);
    this.connectedUsers.push(Object.assign(decoded, { socketId: socket.id }));
  }

  handleDisconnect(socket: Socket): any {
    this.connectedUsers = this.connectedUsers.filter(item => item?.socketId !== socket.id);
  }

  @SubscribeMessage("message")
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: any): Promise<any> {
    const user = this.connectedUsers.find(i => i.socketId === socket.id);
    const body = {
      chat: 4,
      text: data.data,
      read: false
    };
    if (user) {
      if (user.role === Role.Customer) {
        Object.assign(body, {
          customer: user.id
        });
      } else {
        Object.assign(body, {
          executor: user.id
        });
      }
    } else {
      throw new WsException("Invalid credentials.");
    }
    await this.chat.saveMessage(body);
    this.server.emit("message", data);
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