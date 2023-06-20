import { db } from "../../../database/connection";
import { UserSchema } from "../../../database/schema";
export const User = db.model("User", UserSchema);
