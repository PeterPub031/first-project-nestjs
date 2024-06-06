import { CanActivate, ExecutionContext, Inject, Injectable, mixin } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

@Injectable()
class OrGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly guards: (CanActivate)[],
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    for (const guard of this.guards) {
      const result = await guard.canActivate(context);
      if (result) {
        return true;
      }
    }
    return false;
  }
}

// Mixin để tạo OrGuard với danh sách các guard cụ thể
export const OrGuardMixin = (...guards: (CanActivate)[]): any => {
  class MixinGuard extends OrGuard {
    constructor(reflector: Reflector) {
      super(reflector, guards);
    }
  }
  return mixin(MixinGuard);
};
