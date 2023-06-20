import { Request, Response, NextFunction } from "express";
export interface ROLES_INTERFACE {
  ADMIN: number;
  USER: number;
}
export interface RESPONSE_HANDLER {
  req?: Request;
  resp: Response;
  next?: NextFunction;
  status_code?: number;
  data?: any;
  msg?: string;
  success?: string | boolean;
}

export interface DB_CREDENTIALS {
  db_host: string;
  db_port: number | string;
  db_name: string | undefined;
  db_user: string | undefined;
  db_pass: string | undefined;
}

export interface TOKEN_DATA {
  id: string;
  un: string | undefined;
  cr: Date;
  tk: string;
}

export interface BADGES {
  id: number;
  badge: string;
}

export interface REDIS_CONFIG {
  redis_host: string | undefined;
  redis_port: string | undefined;
  redis_user: string | undefined;
  redis_password: string | undefined;
}

export interface SOCKET_PAYLOAD {
  user_id: string;
  lobby_id?: string;
  type: string,
}

export interface USER_INFO extends SOCKET_PAYLOAD {
  ign?: string,
  tag_line?: string,
  username?: string,
  profile_img_url?: string,
  profile_cover_url?: string,
  online_status? : boolean,
  online_user?: any
};

export interface LOBBY_INFO {
  lobby_title?: string,
  game?: string,
  lobby_token?: string,
  by?: string,
  request_id?: string,
}

export interface SOCKET_DATA extends SOCKET_PAYLOAD, USER_INFO, LOBBY_INFO {
  msg?: string,
  to?: string,
  from?: string, // type of data sent ie message or notification
}

export class typeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}