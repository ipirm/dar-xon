import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsModule } from "../aws/aws.module";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { Message } from "../database/entities/message.entity";
import { Executor } from "../database/entities/executor.entity";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "../auth/jwt/constants";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, Message, Executor]),
    AwsModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "286400s" }
    })
  ],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController]
})
export class ChatModule {
}
