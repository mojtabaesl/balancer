import { z } from "zod";
import { fromZodError } from "zod-validation-error";
export const publicENVSchema = z.object({
    ARVAN_API_URL: z.string().url(),
});
export const env = (function () {
    try {
        const serverEnv = {
            ARVAN_API_URL: process.env.ARVAN_API_URL,
        };
        const parsedPublicENV = publicENVSchema.parse(serverEnv);
        return { ...parsedPublicENV };
    }
    catch (err) {
        const validationError = fromZodError(err);
        console.error(validationError);
        process.exit(-3);
    }
})();
