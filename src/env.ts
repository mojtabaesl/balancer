import type { ZodError } from "zod";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import dotenv from "dotenv";
dotenv.config();

export const publicENVSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ARVAN_URL: z.string().url(),
  PORT: z.string(),
  JOBS_INTERVAL: z.string(),
  SALT: z.string().min(16),
  AUTH_TOKEN: z.string().min(32),
});

export const env = (function () {
  try {
    const publicENV = {
      DATABASE_URL: process.env?.DATABASE_URL,
      ARVAN_URL: process.env?.ARVAN_URL,
      PORT: process.env?.PORT,
      JOBS_INTERVAL: process.env?.JOBS_INTERVAL,
      SALT: process.env?.SALT,
      AUTH_TOKEN: process.env?.AUTH_TOKEN,
    };

    const parsedPublicENV = publicENVSchema.parse(publicENV);

    return { ...parsedPublicENV };
  } catch (err) {
    const validationError = fromZodError(err as ZodError);
    console.error(validationError);
    process.exit(-3);
  }
})();
