import { words } from "./_words";
import crypto from 'crypto';

export const generatePhrase = (numWords = 3) => {
  const result = [];
  for (let i = 0; i < numWords; i++) {
    result.push(
      words[crypto.randomInt(0, words.length)]
    )
  }
  return result.join('-');
}