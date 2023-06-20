import { db } from "../../../database/connection";
import { UserJoinGroupSchema } from "../../../database/schema/user/user_join_group";

export const UserJoinedGroup = db.model('UserJoinedGroup', UserJoinGroupSchema);