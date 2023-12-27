import { add } from 'date-fns';

export const sessionDoc = {
  id: 'bkeoxkr98r',
  userId: 'abcdefg',
  exp: add(Date.now(), { days: 1 }),
}
