import type { User } from "./db/schema";

export type AppEnv = {
  Variables: {
    requestId: string;
    user: User;
  };
};
