import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { ADMIN_JWT_ACCESS_STRATEGY } from "../strategies";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class AdminJwtAccessAuthGuard extends AuthGuard(
  ADMIN_JWT_ACCESS_STRATEGY
) {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    if (info) {
      throw new UnauthorizedException(info);
    }
    return super.handleRequest(err, user, info, context);
  }
}
