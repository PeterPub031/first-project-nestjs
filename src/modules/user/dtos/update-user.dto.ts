export class UpdateUserDto {
    email?: string;
    password?: string; 
    firstName?: string;
    lastName?: string;
    adminStatus?: string;
    userStatus?: string;
    forgotPasswordToken?: string;
}