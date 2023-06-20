import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin/lib/credential";

import config from "./config.json";

admin.initializeApp({
  credential: admin.credential.cert(config as ServiceAccount),
});

export const db: any = admin.firestore();

export const verifyIdToken = async (token: string): Promise<any> => {
  const decodedToken = await admin.auth().verifyIdToken(token);
  return decodedToken;
};
