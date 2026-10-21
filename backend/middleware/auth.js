import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

const jwtOptions = {
  algorithm: 'HS256',
  issuer: 'hrmss-api',
  audience: 'hrmss-web',
};

// Tạo access token có thời hạn.
export function createAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    jwtSecret,
    {
      ...jwtOptions,
      subject: String(user.user_id),
      expiresIn: '30m',
    },
  );
}

// Kiểm tra token và trạng thái tài khoản hiện tại.
export function authenticate(findUserById) {
  return (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const match = authorization.match(/^Bearer ([^\s]+)$/i);

    if (!match) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const payload = jwt.verify(match[1], jwtSecret, {
        algorithms: ['HS256'],
        issuer: jwtOptions.issuer,
        audience: jwtOptions.audience,
      });

      const user = findUserById(payload.sub);

      if (!user || user.account_status !== 'ACTIVE') {
        return res.status(401).json({ message: 'Account unavailable' });
      }

      // Dùng role hiện tại thay vì chỉ tin role trong token.
      req.user = {
        user_id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      };

      next();
    } catch {
      return res.status(401).json({
        message: 'Invalid or expired token',
      });
    }
  };
}

// Chỉ cho phép các role được chỉ định.
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
}