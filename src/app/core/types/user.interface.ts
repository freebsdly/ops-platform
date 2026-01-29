export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
}