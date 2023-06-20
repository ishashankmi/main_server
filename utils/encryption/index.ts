import crypto from "crypto";
import bcrypt from 'bcrypt'

require('dotenv').config();

class Encryption {

  public static hashPassword = async (password: string) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  };

  public static comparePassword = async (password: string, hashedPassword: string) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  };
  

  public static encrypt = async (text: string) => {
    const encryptionKey = this.generateEncryptionKey(process.env.TOKEN_SALT);
    const iv = crypto.randomBytes(16); // Initialization Vector
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex')+'.'+encrypted;
  };
  
  public static generateEncryptionKey = (salt: any) => {
    return crypto.pbkdf2Sync(salt, 'salt', 1000, 32, 'sha512');
  };
  
  public static decrypt = async (token: string) => {
    if(typeof(token) != 'string' || !token ){
      return Promise.reject('invalid token')
    }
    let encryptedData: string[] = token.split('.');
    let iv : string = encryptedData[0];
    let encryptedText: string = encryptedData[1];
    const encryptionKey = this.generateEncryptionKey(process.env.TOKEN_SALT);
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;

  };

  public static convertMd5(text: string){
    return crypto.createHash('md5').update(text, 'utf8').digest('hex');
  }
  
  public static async getGroupHash(user_id: string | number, target_id: string | number){
    const salt: any = process.env.JOIN_GROUP_SALT;
    let group_hash = user_id+'_'+target_id+'_'+salt;
    group_hash = Encryption.convertMd5(group_hash);
    return group_hash;
  }
}

export default Encryption;