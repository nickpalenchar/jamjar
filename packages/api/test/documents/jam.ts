import { add } from "date-fns";

export const jamDoc = {
  id: "jam-123",
  phrase: "test-jam",
  userId: "abcdefg",
  spotify: {},
  exp: add(new Date(), { hours: 6 }),
};
