import { CanActivate, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../jwt/constants";
import { Observable } from "rxjs";

@Injectable()
export class WsGuard implements CanActivate {

  constructor(private jwtService: JwtService) {
  }

  canActivate(
    context: any
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken = context.args[0].handshake.auth.token;
    console.log(bearerToken);
    try {
      const decoded = this.jwtService.verify(bearerToken, jwtConstants) as any;
      console.log(decoded);
      // return new Promise((resolve, reject) => {
      //   return this.userService.findByUsername(decoded.username).then(user => {
      //     if (user) {
      //       resolve(user);
      //     } else {
      //       reject(false);
      //     }
      //   });
      //
      // });
      return true;
    } catch (ex) {
      console.log("faffaaf");
      console.log(ex);
      return false;
    }
  }
}