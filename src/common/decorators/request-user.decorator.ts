import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const RequestUser = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if(key != null) {
      return user?.[key]
    } else {
      return user
    }
  },
);
