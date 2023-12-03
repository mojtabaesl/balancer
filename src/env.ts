import type { ZodError } from "zod";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import dotenv from "dotenv";
dotenv.config();

export const publicENVSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AXIOM_API_TOKEN: z.string().min(1),
  AXIOM_API_URL: z.string().url(),
  AXIOM_DATASET_NAME: z.string().min(1),
  ARVAN_URL: z.string().url(),
  PORT: z.string(),
  INTERVAL: z.string(),
  ARVAN_API_TOKEN: z.string(),
});

export const env = (function () {
  try {
    const publicENV = {
      DATABASE_URL: process.env?.DATABASE_URL,
      AXIOM_API_TOKEN: process.env?.AXIOM_API_TOKEN,
      AXIOM_API_URL: process.env?.AXIOM_API_URL,
      AXIOM_DATASET_NAME: process.env?.AXIOM_DATASET_NAME,
      ARVAN_URL: process.env?.ARVAN_URL,
      PORT: process.env?.PORT,
      INTERVAL: process.env?.INTERVAL,
      ARVAN_API_TOKEN: process.env?.ARVAN_API_TOKEN,
    };

    const parsedPublicENV = publicENVSchema.parse(publicENV);

    return { ...parsedPublicENV };
  } catch (err) {
    const validationError = fromZodError(err as ZodError);
    console.error(validationError);
    process.exit(-3);
  }
})();
