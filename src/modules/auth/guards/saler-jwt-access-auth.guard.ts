import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { SALER_JWT_ACCESS_STRATEGY } from "../strategies";

@Injectable()
export class SalerJwtAccessAuthGuard extends AuthGuard(
  SALER_JWT_ACCESS_STRATEGY
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
