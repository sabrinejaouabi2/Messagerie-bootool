import { User } from "./user";

export interface Auth {

    email: string;
    password: string;
  }

  export interface LoginResponse {
    user: User;
    token: string;
  }


