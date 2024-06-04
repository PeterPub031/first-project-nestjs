import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos';

import { USER_ERRORS } from 'src/content/errors';
import { UserRepository } from '../repositories/user.repositoy';

@Injectable()
export class UserService {
    constructor(private readonly _userRepository: UserRepository) {}

    async create(data: CreateUserDto) {
        const user = await this._userRepository.create(data);
        return user;
    }

    async findUserById(userId: string) {
        const user = await this._userRepository.findUserById({
            where: {
                id: userId,
                deletedAt: null,
            }
        });
        return user;
    }

    async findOneWithEmail(email: string) {
        const user = await this._userRepository.findOneWithEmail({
            where: {
                email: email,
                deletedAt: null,
            }
        });
        return user;
    }

    async update(userId: string, data: UpdateUserDto) {
        const user = this._userRepository.findUserById({
            where: {
                id: userId,
            },
        });

        if(!user){
            throw new BadRequestException(USER_ERRORS.USER_01);
        } 

        return this._userRepository.update({
            where:{
                id: userId,
            },
            data: {
                ...data,
            }
        });
    }

    async updatePassWord(userId: string, data: string) {
        const user = this._userRepository.findUserById({
            where: {
                id: userId,
            },
        });

        if(!user){
            throw new BadRequestException(USER_ERRORS.USER_01);
        } 

        return this._userRepository.update({
            where:{
                id: userId,
            },
            data: {
                password: data,
            }
        });
    }

    async assignForgotPassword(userId: string, token: string) {
        const user = this._userRepository.findUserById({
            where: {
                id: userId,
            },
        });

        if(!user){
            throw new BadRequestException(USER_ERRORS.USER_01);
        } 

        return this._userRepository.update({
            where:{
                id: userId,
            },
            data: {
                forgotPasswordToken: token,
            }
        });
    }

    async delete(userId: string) {
        const user = this._userRepository.findUserById({
            where: {
                id: userId,
            },
        });

        if(!user){
            throw new BadRequestException(USER_ERRORS.USER_01);
        } 
        return this._userRepository.delete({ id: userId });
    }
}
