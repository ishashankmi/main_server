enum USER_ERRORS {
  EMAIL_UNVERIFIED = "your email is not verified",
  ACCOUNT_BANNED = "your account is banned",
  ACCOUNT_DEACTIVE = "your account is deactive",
  INVALID_CREDENTIALS = "invalid credentails or user does not exist",
  SUCCESS_FALSE = 'false',
  SOMETHING_WENT_WRONG = "something went wrong",
  FAILED_TO_CREATE = "failed to create user",
  INVALID_TOKEN = "Invalid token or token expired",
  UNAUTHORIZED_ACCESS = "unauthorized access, login required",
  USER_NOT_EXIST = "user does not exist or incorrect id",
  EMAIL_ALREADY_EXIST = 'email already exist',
  INVALID_USER_ID = 'invalid user id',
  NO_USER_ONLINE = 'no user is online',
  IGN_TAGLINE_REQUIRED = 'ign and tagline required'
}

enum NAME_ERROS {
  INVALID_IGN = 'invalid ign, please try something else',
  INVALID_TAG = 'invalid tag line, must contain a valid word or numbers'
}


enum USER_SUCCESS {
  LOGIN_SUCCESS = "login successfully",
  REGISTER_SUCCESS = "user registered successfully",
  SUCCESS_OK = "ok", 
  USER_FOUND = 'user found',
  PENDING_USERS_LIST = 'pending users list',
  ONLINE_USERS = 'online users'
}

enum JOIN_REQUEST {
  USER_JOIN_ACCEPTED = 'join request accepted',
  USER_JOIN_REJECTED = 'join request rejected',
  NO_PENDING_JOIN = 'no pending join request',
}

enum REQUEST_ERROR {
  INVALID_ROUTE = "invalid route",
  INVALID_REQUEST = "invalid request",
  INVALID_PARAMETERS = 'invalid parameters',
  BAD_REQUEST = 'bad request'
}

enum SERVER_ENUMS {
  WEB_SERSVER_STARTED = "\n--------------------------------------------\n[!] Server Started on Port:",
  FAILED = "server failed to start",
  WEBSOCKET_STARTED = '[!] WebSocket Server Listening on Port:',
}

enum DATABASE_ENUMS {
  CONNECTED = "database connected",
  FAILED = "database connection failed",
}

enum REDIS_ENUMS {
  CONNECTED = "Redis Connected",
  FAILED = "redis failed to connect",
  CONNECTING = "redis trying to connect",
  TTL_ERROR = "error setting key with TTL",
}

enum USER_JOIN_ENUMS {
  FAILED = "failed to join user",
  PROCESS_FAILED = "can't process this request",
  INVALID_PARAMETERS = "invalid or missing parameters",
  INVALID_JOIN = "can't join to this user",
  SUCCESS = "user joined successfully",
  FILED_TO_UPDATE = 'failed to update join count',
  FAILED_TO_ACCEPT_REQ = 'failed to accept request',
}

enum SOCKET_EVENTS {
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  JOIN_LOBBY = 'join_lobby',
  EXIT_LOBBY = 'exit_lobby',
  KICK_USER = 'kick_user',
  DISCONNECTED = 'disconnected',
  CREATE_LOBBY = 'create_lobby',
  LOBBY_REQ_ACCEPT = 'lobby_request_accepted',
  JOIN_REQ_ACCEPT = 'join_request_accepted',
  LOBBY_CREATED = 'lobby_created',
  USER_ONLINE_STATUS = 'user_online_status',
  JOIN_LOBBY_REQUEST = 'join_lobby_request',
};

enum SOCKET_MESSAGE {
  LOBBY_REQ_ACCEPT = 'lobby request accepted',
  JOIN_REQ_ACCEPT = 'join request accepted',
  LOBBY_CREATED = 'lobby created',
  JOIN_LOBBY_REQUEST = 'join lobby request',
}

enum LOBBY_ENUM {

  FAILED = 'failed to create a lobby',
  WAIT = 'wait for few minutes before creating a new lobby or delete previously created',
  SUCCESS = 'lobby created successfully',
  FAILED_TO_DELETE = 'failed to delete lobby',
  DELETED = 'lobby successfully deleted',
  MAX_LOBBY_CAPACITY = "max update limit reached, cannot add more than",
  USERS = 'users',
  USER = 'user',
  CANNOT_UPDATE_LIMIT = 'failed to update lobby limit, try to remove',
  UPDATED_LOBBY = 'lobby updated successfully',
  FAILED_TO_UPDATE = 'failed to update lobby',
  MINIMUM_LOBBY_LIMIT = `lobby can be less than 1 user`,
  NOT_FOUND = "lobby not found or you don't have permission to enter this lobby",
  NO_PERMISSION = "you don't have permission to enter this lobby",
  LOBBY_CREATED = 'lobby created',
  
  LOBBY_FOUND = 'found a lobby',
  LOBBY_NOT_FOUND = 'lobby not found',
  LOBBY_NOT_EXIST = 'lobby does not exist',
  NEED_PERMISSION_TO_JOIN = 'request permission to join this lobby',
  LIST_SUCCESS = 'list fetch success',
  LOBBY_EXPIRED = 'lobby is expired',
  SESSION_ALREADY_RUNNING = 'session already started, please join the lobby',
  FAILED_TO_START_SESSION= 'failed to start lobby session',
  LOBBY_SESSION_STARTED = 'lobby session started',
  
  LOBBY_IS_FULL = 'lobby is full, cannot add new users',
  FAILED_TO_JOIN_LOBBY = 'failed to join this lobby',
  JOINED_LOBBY_SUCCESSFULLY = 'successfully joined the lobby',
  JOIN_REQUEST_ALREADY_SENT = 'join request already sent, please wait the for admins response',
  JOIN_REQUEST_PENDING = 'join request pending',
  CAN_JOIN_LOBBY = 'you can join lobby',
  CANNOT_JOIN_LOBBY = 'you cannot join this lobby',
  FAILED_TO_LEAVE = 'failed to leave the lobby',
  
  CANNOT_ADD_MORE_USERS = "cannot add more users, try removing some",
  
  FAILED_TO_ACCEPT_REQUEST = 'failed to accept request',
  REQUEUST_ACCEPTED = 'lobby request accepted',

  FAILED_TO_REJECT_REQUEST = 'failed to reject request',
  REQUEUST_REJECTED = 'lobby request rejected',
  LOBBY_JOIN_REQUEST_SENT = 'lobby join request sent',

  KICKED_USER = 'successfully kicked user',
  FAILED_TO_KICK_USER = 'failed to kick user',

  LOBBY_NOT_CREATED = 'no lobby has been created for this game',
  LOBBY_LIST = 'fetched lobby list',

  TOKEN_SUCCES = 'token created',
  CANNOT_SEND_MORE_REQUESTS = 'cannot send more request to this lobby'

}


enum LIVEKIT_SERVER {
  FAILED_TO_CREATE_TOKEN = 'failed to create token',
}

enum STATUS_CODE {
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  BAD_REQUEST = 400,
  UNAUTHRIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

enum SOCKET_DATA_TYPE {
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  LOG = 'log',
  ERROR = 'error',
}

export {
  USER_ERRORS,
  USER_SUCCESS,
  REQUEST_ERROR,
  SERVER_ENUMS,
  REDIS_ENUMS,
  USER_JOIN_ENUMS,
  NAME_ERROS,
  JOIN_REQUEST,
  SOCKET_EVENTS,
  LOBBY_ENUM,
  STATUS_CODE,
  SOCKET_MESSAGE,
  SOCKET_DATA_TYPE,
  DATABASE_ENUMS,
  LIVEKIT_SERVER
};
