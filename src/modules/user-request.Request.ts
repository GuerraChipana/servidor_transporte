export interface UserRequestRequest extends Request {
  user: {
    id: number;
    nombre: string;
    rol: string;
  };
}
