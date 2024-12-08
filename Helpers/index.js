import crypto from "crypto";
import fs from "fs";
import * as url from "url";
import path from "path";
import bcrypt from "bcryptjs";

export const generateOTP = () => crypto.randomInt(100000, 999999);

export const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export const readFileSync = (filePath) =>
  fs.readFileSync(path.join(__dirname, filePath), "utf8");

export const hashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 *
 * @param {number} length
 * @returns
 */

export const ramdomStr = (length) => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .slice(0, length)
    .replace(/[^a-zA-Z0-9]/g, "");
};
