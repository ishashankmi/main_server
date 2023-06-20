import { v4 as uuidv4 } from 'uuid';

function generateUUID() {
  return uuidv4();
}

function generateRandomText(len?: any) {
  len = len || 4;
  const digits = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let letters = "";

  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    letters += characters.charAt(randomIndex);
  }

  return `${digits}_${letters}`;
}

function generateRandomWord(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let word = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    word += characters.charAt(randomIndex);
  }
  return word;
}

export { generateRandomWord, generateRandomText, generateUUID }