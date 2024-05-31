import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateUserDto } from '../dtos';
import { UserRepository } from '../repositories/user.repositoy';

@Injectable()
export class UserService {
    constructor(private readonly _userRepository: UserRepository) {}

    async create(data: CreateUserDto) {
        const user = await this._userRepository.create(data);
        return user;
    }

    async findOne(userId: string) {
        const user = await this._userRepository.findOne({
            where: {
                id: userId,
            }
        });
    }

    async update(userId: string, data: UpdateUserDto) {
        const user = this._userRepository.findOne({
            where: {
                id: userId,
            },
        });

        if(!user){
            throw new BadRequestException()
        } 
    }
}
