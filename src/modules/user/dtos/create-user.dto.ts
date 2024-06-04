export class CreateUserDto {
    email: string;
    password: string; 
    firstName: string;
    lastName?: string;
    adminStatus: string;
    userStatus: string;
    isAdmin: boolean;
    isUser: boolean
}