import jwt from 'jsonwebtoken';
import { randomBytes, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import redisClient from '../config/redis.js';

// Cấu hình thời hạn, thuật toán và Secret Key bảo mật
const JWT_SECRET = process.env.JWT_SECRET || 'HRMSS_SECRET_KEY_FOR_SEP490_G81_CAPSTONE_2026';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

// Cấu hình định danh phát hành chuẩn RFC 7519
const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = process.env.JWT_ISSUER || 'hrmss.minhduc.vn';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'hrmss-client';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 phút (900 giây)
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 ngày
const REFRESH_TOKEN_VERSION = 'v1';

/**
 * ==============================================================================
 * DỊCH VỤ MINH ĐỨC - TOKEN SERVICE (QUẢN LÝ JWT & REDIS SESSIONS)
 * ==============================================================================
 * Áp dụng kiến trúc bảo mật ngân hàng OWASP:
 * - Access Token: JWT chữ ký HS256 ngắn hạn (15 phút) kèm clockTolerance
 * - Refresh Token: Opaque Token định dạng v1.<userId>.<sessionId>.<secret>
 * - Lưu trữ an toàn: Redis CHỈ lưu SHA-256 hash của secret, không bao giờ lưu token gốc
 * - So khớp bằng timingSafeEqual chống tấn công kênh kề (Timing Attack)
 */
class TokenService {
  /**
   * Thời gian sống của Access Token tính bằng giây (dùng cho bộ đếm Silent Refresh trên Client)
   */
  get accessTokenTtlSeconds() {
    return ACCESS_TOKEN_TTL_SECONDS;
  }

  /**
   * Sinh Session ID ngẫu nhiên chuẩn UUID v4 cho phiên làm việc
   */
  newSessionId() {
    return randomUUID();
  }

  /**
   * Giải mã Access Token mà không cần verify chữ ký (dùng để trích xuất thông tin, tính TTL hoặc ghi audit log)
   */
  decodeAccessToken(token) {
    if (!token) return null;
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }

  /**
   * Băm bí mật của Refresh Token bằng SHA-256 một chiều trước khi ghi vào Redis
   */
  hashRefreshSecret(secret) {
    return createHash('sha256').update(secret).digest('hex');
  }

  /**
   * So khớp an toàn với thời gian hằng số (Constant-time comparison) chống tấn công Timing Attack
   */
  matchesRefreshHash(secret, storedHash) {
    if (!secret || !storedHash) return false;
    const computed = Buffer.from(this.hashRefreshSecret(secret), 'hex');
    const stored = Buffer.from(storedHash, 'hex');

    if (computed.length !== stored.length || stored.length === 0) {
      return false;
    }
    return timingSafeEqual(computed, stored);
  }

  /**
   * Tạo chuỗi Opaque Refresh Token (v1.userId.sessionId.secret) kèm bản băm SHA-256
   */
  createRefreshToken(userId, sessionId) {
    const secret = randomBytes(32).toString('base64url');
    return {
      token: [REFRESH_TOKEN_VERSION, String(userId), sessionId, secret].join('.'),
      hash: this.hashRefreshSecret(secret),
    };
  }

  /**
   * Bóc tách và kiểm định cấu trúc của Refresh Token (trả về null nếu sai định dạng, không văng lỗi 500)
   */
  parseRefreshToken(token) {
    if (typeof token !== 'string' || token.length === 0) return null;

    const parts = token.split('.');
    if (parts.length !== 4) return null;

    const [version, rawUserId, sessionId, secret] = parts;
    if (version !== REFRESH_TOKEN_VERSION) return null;

    // Kiểm tra định dạng userId phải là số nguyên dương hợp lệ
    if (!/^[1-9]\d{0,17}$/.test(rawUserId)) return null;
    if (!sessionId || sessionId.length === 0 || !secret || secret.length === 0) return null;

    return {
      version,
      userId: Number(rawUserId),
      sessionId,
      secret,
    };
  }

  /**
   * Ký cặp Token: Access Token (JWT 15m) + Opaque Hashed Refresh Token (7d)
   */
  generateTokens(user) {
    const userId = user.user_id || user.userId;
    const sessionId = this.newSessionId();

    const payload = {
      userId,
      username: user.username,
      email: user.email,
      roleId: user.role_id || user.roleId,
      roleCode: user.role_code || user.role,
      sid: sessionId,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      algorithm: JWT_ALGORITHM,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    const refreshPair = this.createRefreshToken(userId, sessionId);

    return {
      accessToken,
      refreshToken: refreshPair.token,
      sessionId,
      expiresIn: this.accessTokenTtlSeconds,
      payload,
    };
  }

  /**
   * Lưu Refresh Token Session vào Redis (CHỈ lưu SHA-256 hash của secret)
   */
  async saveSession(userId, refreshToken) {
    try {
      const parts = this.parseRefreshToken(refreshToken);
      if (!parts) {
        console.warn('⚠️ [TokenService] Không thể lưu session do Refresh Token sai định dạng');
        return;
      }

      const hash = this.hashRefreshSecret(parts.secret);
      await redisClient.set(
        `refresh:${parts.userId}:${parts.sessionId}`,
        hash,
        { EX: REFRESH_TOKEN_TTL_SECONDS },
      );
    } catch (err) {
      console.warn('⚠️ [Redis] Không thể lưu session refresh token:', err.message);
    }
  }

  /**
   * Xác thực Refresh Token và đối soát bản băm SHA-256 an toàn trong Redis
   */
  async verifyRefreshToken(refreshToken) {
    const parts = this.parseRefreshToken(refreshToken);
    if (!parts) {
      const error = new Error('Refresh Token không hợp lệ hoặc sai cấu trúc.');
      error.status = 401;
      error.code = 'REFRESH_TOKEN_INVALID';
      throw error;
    }

    try {
      const storedHash = await redisClient.get(`refresh:${parts.userId}:${parts.sessionId}`);
      if (!storedHash) {
        const error = new Error('Phiên làm việc đã bị thu hồi hoặc đã hết hạn.');
        error.status = 401;
        error.code = 'SESSION_REVOKED';
        throw error;
      }

      const isValid = this.matchesRefreshHash(parts.secret, storedHash);
      if (!isValid) {
        const error = new Error('Bí mật Refresh Token không khớp. Yêu cầu đăng nhập lại.');
        error.status = 401;
        error.code = 'REFRESH_SECRET_MISMATCH';
        throw error;
      }
    } catch (redisErr) {
      if (redisErr.status === 401) throw redisErr;
      console.warn('⚠️ [Redis] Tạm thời bỏ qua kiểm tra session refresh token:', redisErr.message);
    }

    return {
      userId: parts.userId,
      sessionId: parts.sessionId,
    };
  }

  /**
   * Đưa Access Token cũ vào Blacklist trong Redis (Chống Replay Attack)
   */
  async blacklistToken(token) {
    if (!token) return;
    try {
      const decoded = this.decodeAccessToken(token);
      const remainingTime = decoded?.exp
        ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0)
        : this.accessTokenTtlSeconds;

      const ttl = remainingTime > 0 ? remainingTime : this.accessTokenTtlSeconds;
      await redisClient.set(`blacklist:${token}`, 'revoked', { EX: ttl });
    } catch (err) {
      console.warn('⚠️ [Redis] Không thể đưa token vào blacklist:', err.message);
    }
  }

  /**
   * Kiểm tra xem Token có nằm trong Blacklist hay không
   */
  async isTokenBlacklisted(token) {
    if (!token) return false;
    try {
      const status = await redisClient.get(`blacklist:${token}`);
      return status !== null;
    } catch (err) {
      console.warn('⚠️ [Redis] Lỗi kiểm tra blacklist:', err.message);
      return false;
    }
  }

  /**
   * Thu hồi phiên làm việc (Xóa refresh token hash khỏi Redis)
   */
  async revokeSession(userId, refreshToken) {
    if (!userId || !refreshToken) return;
    try {
      const parts = this.parseRefreshToken(refreshToken);
      const sessionId = parts ? parts.sessionId : refreshToken;
      await redisClient.del(`refresh:${userId}:${sessionId}`);
    } catch (err) {
      console.warn('⚠️ [Redis] Lỗi thu hồi session:', err.message);
    }
  }

  /**
   * Thu hồi toàn bộ phiên làm việc của người dùng (khi đổi mật khẩu / khóa tài khoản)
   */
  async revokeAllUserSessions(userId) {
    if (!userId) return;
    try {
      const keys = await redisClient.keys(`refresh:${userId}:*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (err) {
      console.warn('⚠️ [Redis] Lỗi thu hồi toàn bộ session của user:', err.message);
    }
  }

  /**
   * Giải mã và xác thực chữ ký Access Token (Chống Algorithm-Confusion Attack)
   */
  verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: 5, // Cho phép chênh lệch tối đa 5 giây đồng hồ giữa các server
    });
  }
}

export const tokenService = new TokenService();
export default tokenService;
