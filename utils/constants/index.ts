import { ROLES_INTERFACE } from "../../src/interface/interface";

export const ROLES: ROLES_INTERFACE = {
  ADMIN: 1,
  USER: 2,
};

export const LET_BYPASS_ROUTES: string[] = ["login", "register"];

export const USER_BADGE: string[] = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'warrior'];

export const USER_JOIN_STATUS: string[] = ['unjoined', 'pending', 'accepted', 'rejected', 'temporarily rejected', 'permanently rejected'];

export const FIELD_LENGTH = {
    EMAIL_LENGTH : 100,
    FIRST_NAME : 50,
    LAST_NAME : 50,
    PASSWORD : {
      MIN : 5,
      MAX: 255,
    },
    PHONE: {
      MIN : 8,
      MAX : 20,
    }
}

/*
  SOCKET ROOMS
*/
export let SOCKET_USERS: any = new Map();
export let USERS_LOBBY: any = new Map();

export const ConsoleTextColor: any = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    default: "\x1b[39m",
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    default: "\x1b[49m",
  },
};