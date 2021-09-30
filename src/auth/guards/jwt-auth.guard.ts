import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor() {
    super();
  }

  // handleRequest(err, user, info: Error) {
  //   // don't throw 401 error when unauthenticated
  //   if (!user)
  //     return undefined;
  //   return user;
  // }
}