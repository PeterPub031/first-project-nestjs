import { Module } from "@nestjs/common";
// import { UserController } from "./controllers";
import { UserRepository } from "./repositories";
import { UserService } from "./services";

@Module({
  controllers: [],
  providers: [
    UserService,
    // Repositories
    UserRepository,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
