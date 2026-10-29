import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

// Băm mật khẩu bằng scrypt bất đồng bộ với salt ngẫu nhiên; lưu kèm phiên bản/tham số để kiểm tra lại.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64, options);
  return `scrypt$v1$32768$8$3$${salt}$${hash.toString("hex")}`;
}
// Kiểm tra định dạng hash, băm lại bằng salt đã lưu và so sánh bằng timingSafeEqual.
// Phép so sánh tránh rò rỉ vị trí byte sai qua thời gian chạy; không trim hay đổi chữ hoa/thường mật khẩu.
export async function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string")
    return false;
  const parts = storedHash.split("$");
  if (
    parts.length !== 7 ||
    parts.slice(0, 5).join("$") !== "scrypt$v1$32768$8$3" ||
    !/^[a-f0-9]{32}$/.test(parts[5]) ||
    !/^[a-f0-9]{128}$/.test(parts[6])
  )
    return false;
  const actual = await scrypt(password, parts[5], 64, options);
  return timingSafeEqual(actual, Buffer.from(parts[6], "hex"));
}
