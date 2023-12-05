import {
  createCipheriv,
  createHash,
  createDecipheriv,
  randomBytes,
} from "crypto";
import { env } from "./env.js";

interface EncryptResult {
  iv: string;
  encrypted: string;
}
export function convertByteToGB(byte: number, fractionDigits: number = 2) {
  return Number.parseFloat((byte / Math.pow(1024, 3)).toFixed(fractionDigits));
}

export function encrypt(text: string): string {
  const key = createHash("sha256").update(env.SALT).digest("hex").slice(0, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(text: string) {
  const [iv, encryptedText] = text.split(":");
  const key = createHash("sha256").update(env.SALT).digest("hex").slice(0, 32);

  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedText, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
