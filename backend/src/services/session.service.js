import { randomBytes, createHash } from "node:crypto";
import { createSessionRepository } from "../repositories/session.repository.js";
import { createUserRepository } from "../repositories/user.repository.js";
import { verifyPassword, hashPassword } from "../utils/password.js";
import { AppError } from "../utils/app-error.js";
import { toPublicAccount, toPublicProfile } from "../mappers/user.mapper.js";
// Băm token/IP trước khi dùng làm khóa Redis; không lưu token thô.
const digest = (value) => createHash("sha256").update(value).digest("hex");
// Dùng chung thông báo lỗi để không tiết lộ tài khoản hay bước xác thực bị sai.
const unauthorized = () =>
  new AppError(
    401,
    "UNAUTHENTICATED",
    "Thông tin đăng nhập hoặc phiên không hợp lệ.",
  );
// Access token sống 15 phút; nhóm refresh hết hạn tuyệt đối sau 7 ngày từ login.
const accessSeconds = 900;
const refreshSeconds = 7 * 24 * 60 * 60;
// Chỉ nhận token dạng 32 byte ngẫu nhiên được biểu diễn bằng 64 ký tự hex.
const validToken = (token) =>
  typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
// Sinh độc lập hai token ngẫu nhiên bằng bộ sinh số an toàn của Node.js.
function tokens() {
  return {
    accessToken: randomBytes(32).toString("hex"),
    refreshToken: randomBytes(32).toString("hex"),
  };
}
// Gói kết quả nội bộ; controller tách refresh token sang cookie và không trả nó trong JSON.
function result(pair, user, remaining, profile = null) {
  return {
    access_token: pair.accessToken,
    token_type: "Bearer",
    expires_in: Math.min(accessSeconds, remaining),
    account: toPublicAccount(user),
    profile: toPublicProfile(profile),
    refreshToken: pair.refreshToken,
    refreshExpiresIn: remaining,
  };
}
// Xử lý nghiệp vụ đăng nhập, làm mới token và thu hồi phiên.
export function createSessionService({
  sessions = createSessionRepository(),
  users = createUserRepository(),
} = {}) {
  let dummyHash;
  // Chuyển lỗi Redis thành 503; không bỏ qua xác thực khi dịch vụ phiên gặp sự cố.
  async function sessionOperation(work) {
    try {
      return await work();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        503,
        "SESSION_UNAVAILABLE",
        "Dịch vụ phiên chưa sẵn sàng.",
      );
    }
  }
  return {
    // Giới hạn số lần thử, kiểm tra mật khẩu/trạng thái rồi tạo nhóm phiên mới.
    async login({ identifier, password }, ip = "unknown") {
      await sessionOperation(async () => {
        if (!(await sessions.allowLogin(digest(ip))))
          throw new AppError(
            429,
            "LOGIN_RATE_LIMIT",
            "Thử đăng nhập quá nhiều lần, vui lòng thử lại sau.",
          );
      });
      const user = await users.findCredentialsByIdentifier(identifier);
      // Vẫn chạy scrypt khi tài khoản không tồn tại để giảm chênh lệch thời gian phản hồi.
      dummyHash ??= hashPassword(randomBytes(24).toString("hex"));
      const valid = await verifyPassword(
        password,
        user?.password_hash ?? (await dummyHash),
      );
      if (!user || !valid || user.account_status !== "ACTIVE")
        throw unauthorized();
      const pair = tokens();
      await sessionOperation(() =>
        sessions.create({
          accessHash: digest(pair.accessToken),
          refreshHash: digest(pair.refreshToken),
          familyId: randomBytes(32).toString("hex"),
          userId: user.user_id,
          accessSeconds,
          refreshSeconds,
        }),
      );
      const profile =
        typeof users.findProfileByUserId === "function"
          ? await users.findProfileByUserId(user.user_id)
          : null;
      return result(pair, user, refreshSeconds, profile);
    },
    // Kiểm tra lại tài khoản ACTIVE rồi yêu cầu Redis rotation nguyên tử.
    // TTL trả về là thời gian còn lại của nhóm; không gia hạn mốc 7 ngày.
    async refresh(token) {
      if (!validToken(token)) throw unauthorized();
      const previousHash = digest(token);
      const state = await sessionOperation(() =>
        sessions.findRefresh(previousHash),
      );
      if (!state) throw unauthorized();
      const user = await users.findAccountById(state.userId);
      if (!user || user.account_status !== "ACTIVE") {
        await sessionOperation(() =>
          sessions.revokeFamily(
            state.familyId,
            previousHash,
            "account_inactive",
          ),
        );
        throw unauthorized();
      }
      const pair = tokens();
      const ttl = await sessionOperation(() =>
        sessions.rotate({
          previousHash,
          refreshHash: digest(pair.refreshToken),
          accessHash: digest(pair.accessToken),
          state,
          accessSeconds,
        }),
      );
      if (ttl <= 0) throw unauthorized();
      const profile =
        typeof users.findProfileByUserId === "function"
          ? await users.findProfileByUserId(user.user_id)
          : null;
      return result(pair, user, Math.floor(ttl / 1000), profile);
    },
    // Kiểm tra phiên/BL rồi đọc lại tài khoản từ DB để áp dụng role và trạng thái hiện tại.
    async authenticate(token) {
      if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
        throw unauthorized();
      const userId = await sessionOperation(() => sessions.find(digest(token)));
      if (!userId) throw unauthorized();
      const user = await users.findAccountById(userId);
      if (!user || user.account_status !== "ACTIVE") throw unauthorized();
      return toPublicAccount(user);
    },
    // Lấy thông tin hồ sơ cá nhân theo ID tài khoản.
    async getProfile(userId) {
      if (typeof users.findProfileByUserId !== "function") return null;
      return toPublicProfile(await users.findProfileByUserId(userId));
    },
    // Thu hồi nhóm phiên hiện tại thông qua hash của access token.
    async logout(token) {
      await sessionOperation(() => sessions.remove(digest(token)));
    },
    // Thu hồi nhóm bằng refresh cookie, dùng được khi access token đã hết hạn.
    async logoutRefresh(token) {
      if (!validToken(token)) throw unauthorized();
      const state = await sessionOperation(() =>
        sessions.findRefresh(digest(token)),
      );
      if (!state) throw unauthorized();
      await sessionOperation(() =>
        sessions.revokeFamily(state.familyId, digest(token), "logout"),
      );
    },
    // Đổi generation và đưa các token thuộc phiên cũ của tài khoản vào BL.
    async logoutAll(userId) {
      await sessionOperation(() => sessions.revokeAll(userId));
    },
  };
}
