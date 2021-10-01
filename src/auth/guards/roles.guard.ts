import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector
  ) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<any> | Observable<any> {
    const roles = this.reflector.get<string[]>("role", context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: any = request.user;

    const hasRole = () => roles.indexOf(user.role) > -1;
    let hasPermission: boolean = false;

    if (hasRole()) {
      hasPermission = true;
    }
    console.log(user)
    return user && hasPermission;
  }
}