import { db } from "../../../database/connection";
import { UserTokenSchema } from "../../../database/schema";

export const UserToken = db.model('UserToken', UserTokenSchema);