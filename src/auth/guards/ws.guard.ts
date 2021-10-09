import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor() {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake?.query?.token;
      console.log(authToken);
      // const user: User = await this.authService.verifyUser(authToken);
      // client.join(`house_${user?.house?.id}`);
      // context.switchToHttp().getRequest().user = user

      // return Boolean(user);
      return true;
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}