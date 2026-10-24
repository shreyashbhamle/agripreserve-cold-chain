export type UserRole =
  | "admin"
  | "farmer"
  | "driver"
  | "receiver";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  region?: string;
  status?: string;
  avatar?: string;
  last_login_at?: string;
}
