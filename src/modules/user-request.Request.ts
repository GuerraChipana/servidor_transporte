export interface UserRequestRequest extends Request {
  user: {
    id: number;
    username: string;
    rol: string;
  };
}
