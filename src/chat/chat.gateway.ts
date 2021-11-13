import {
  ConnectedSocket,
  MessageBody,
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
import { MessageType } from "../enums/messageType";

@WebSocketGateway({ cors: true, allowEIO3: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly jwt: JwtService, private readonly chat: ChatService) {
  }

  @WebSocketServer()
  server;

  connectedUsers: any = [];

  afterInit(server: any): any {
    console.log("Initizialized");
  }

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    const decoded = this.jwt.verify(socket.handshake.auth.token, jwtConstants);
    this.connectedUsers.push({ socketId: socket.id, online: true, id: decoded.id, role: decoded.role });
    console.log("connected");
    this.setOnline(socket);
    // @ts-ignore
    if (socket.handshake.query.chat_id != 0)
      await this.onRoomJoin(socket, { data: socket.handshake.query.chat_id });
  }

  handleDisconnect(@ConnectedSocket() socket: Socket): void {
    this.connectedUsers = this.connectedUsers.filter(item => item?.socketId !== socket.id);
    console.log("disconnected");
    this.setOnline(socket);
    this.onRoomLeave(socket, { data: socket.handshake.query.chat_id });
  }

  @SubscribeMessage("message")
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data: any): Promise<any> {
    let body;
    const user = this.connectedUsers.find(i => i.socketId === socket.id);
    if (data.data.m_type === MessageType.Text) {
      body = {
        chat: socket.handshake.query.chat_id,
        text: data.data.text,
        message_type: MessageType.Text
      };
    } else if (data.data.m_type === MessageType.File) {
      body = {
        chat: socket.handshake.query.chat_id,
        file: {
          name: data.data.file.name,
          url: data.data.file.url
        },
        m_type: MessageType.File
      };
    }
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
    const message = await this.chat.saveMessage(body);
    this.server.in("room-" + socket.handshake.query.chat_id).emit("message", message);
  }


  @SubscribeMessage("join")
  async onRoomJoin(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const user = this.connectedUsers.find(i => i.socketId === socket.id);
    const room = await this.chat.getOne(user, data.data);
    if (!room)
      throw new WsException("Invalid room.");

    socket.join("room-" + room.id);
  }

  @SubscribeMessage("leave")
  onRoomLeave(@ConnectedSocket() socket: Socket, @MessageBody() data: any): void {
    socket.leave("room-" + data.data);
  }

  @SubscribeMessage("read")
  async readMessages(@ConnectedSocket() socket: Socket, @MessageBody() data: any): Promise<any> {
    const user = this.connectedUsers.find(i => i.socketId === socket.id);
    await this.chat.setMessagesRead(data.data, user);
  }

  setOnline(@ConnectedSocket() socket: Socket): void {
    socket.broadcast.emit("onlineList", this.connectedUsers);
  }

}