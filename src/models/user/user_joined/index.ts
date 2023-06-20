import { db } from "../../../database/connection";
import { UserJoinSchema } from "../../../database/schema/user/user_join";

export const UserJoin = db.model('UserJoin', UserJoinSchema);

