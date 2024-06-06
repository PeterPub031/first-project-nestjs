export class JwtAccessPayload {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  isUser: boolean;
  isSaler: boolean;
}
