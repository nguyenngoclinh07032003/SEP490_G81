import { redis, connectRedis } from '../config/redis.js';
import { randomBytes } from 'node:crypto';


// Các hàm bên dưới tạo khóa Redis; token chỉ xuất hiện dưới dạng SHA-256.
// family là nhóm phiên của một lần login; generation là phiên bản thu hồi chung của một user.
const prefix = 'hrmss:auth:';
const accessKey = hash => prefix + hash;
const familyKey = id => prefix + 'family:' + id;
const refreshKey = hash => prefix + 'refresh:' + hash;
const generationKey = id => prefix + 'generation:' + id;
const blacklistKey = (type, id) => prefix + 'blacklist:' + type + ':' + id;


// BL (blacklist) ghi token/nhóm bị thu hồi; TTL là thời gian hiệu lực còn lại.
// PTTL đọc TTL theo mili giây, PX đặt TTL; NX chỉ ghi khi chưa có để không gia hạn BL.
const blacklistLua = `
  -- Ghi BL khi nguồn còn hạn; nguồn đã hết hạn hoặc không tồn tại thì bỏ qua.
  local function blacklist(source, blocked, reason)
    local ttl = redis.call('PTTL', source)
    if ttl > 0 then redis.call('SET', blocked, reason, 'PX', ttl, 'NX') end
  end
  -- Đánh dấu thu hồi cả nhóm rồi xóa dữ liệu nhóm đang hoạt động.
  local function revokeFamily(family, blocked, reason)
    blacklist(family, blocked, reason)
    redis.call('DEL', family)
  end
`;


// Quản lý phiên và BL trong Redis; giữ hash refresh đã dùng đến hết hạn để phát hiện dùng lại.
export function createSessionRepository({ client = redis, connect = connectRedis, namespace = '' } = {}) {
  
  // Thêm vùng tên riêng khi kiểm thử để dữ liệu test không chạm vào phiên thật.
  const key = value => namespace + value;
  
  // Chạy Lua nguyên tử trên Redis: các lệnh trong script không bị yêu cầu khác chen ngang.
  // KEYS chứa các khóa, ARGV chứa giá trị; mọi đối số được chuyển thành chuỗi.
  async function evaluate(script, keys, args = []) {
    await connect();
    return client.eval(script, { keys: keys.map(key), arguments: args.map(String) });
  }
  return {
    // Tạo nhóm phiên và cặp token cùng lúc; chỉ khởi tạo generation nếu user chưa có.
    // Nhóm/refresh sống 7 ngày từ login, access token sống 15 phút theo TTL service truyền vào.
    async create({ accessHash, refreshHash, familyId, userId, accessSeconds, refreshSeconds }) {
      await evaluate(`
        redis.call('SET', KEYS[4], ARGV[6], 'NX')
        local generation = redis.call('GET', KEYS[4])
        local state = cjson.encode({userId=ARGV[1], familyId=ARGV[2], generation=generation})
        redis.call('HSET', KEYS[2], 'current', ARGV[3], 'userId', ARGV[1], 'generation', generation)
        redis.call('EXPIRE', KEYS[2], ARGV[5])
        redis.call('SET', KEYS[3], state, 'EX', ARGV[5])
        redis.call('SET', KEYS[1], state, 'EX', ARGV[4])
        return 1`, [accessKey(accessHash), familyKey(familyId), refreshKey(refreshHash), generationKey(userId)],
      [userId, familyId, refreshHash, accessSeconds, refreshSeconds, randomBytes(32).toString('hex')]);
    },
    
    // Tìm access token, kiểm tra BL và nhóm phiên trước khi trả user_id.
    // Nếu nhóm/generation đã bị thu hồi, ghi BL của token theo TTL còn lại rồi từ chối.
    async find(hash) {
      const value = await evaluate(`
        if redis.call('EXISTS', KEYS[2]) == 1 then return false end
        return redis.call('GET', KEYS[1])`, [accessKey(hash), blacklistKey('access', hash)]);
      if (!value) return null;
      // Phiên kiểu cũ chỉ lưu user_id; tiếp tục hỗ trợ đến khi hết hạn hoặc bị logout.
      if (!value.startsWith('{')) return value;
      const state = JSON.parse(value);
      const valid = await evaluate(`${blacklistLua}
        if redis.call('EXISTS', KEYS[3]) == 1 then return 0 end
        if redis.call('EXISTS', KEYS[4]) == 1 or redis.call('EXISTS', KEYS[1]) == 0
          or (redis.call('GET', KEYS[2]) or '') ~= ARGV[1] then
          blacklist(KEYS[5], KEYS[3], 'revoked'); return 0
        end
        return 1`,
      [familyKey(state.familyId), generationKey(state.userId), blacklistKey('access', hash),
        blacklistKey('family', state.familyId), accessKey(hash)], [state.generation]);
      return valid === 1 ? state.userId : null;
    },
    
    // Đọc trạng thái refresh token để service kiểm tra tài khoản và thực hiện rotation.
    async findRefresh(hash) {
      // Token có BL rotated vẫn đi tới rotate() để phát hiện dùng lại và thu hồi cả nhóm.
      const value = await evaluate(`
        local reason = redis.call('GET', KEYS[2])
        if reason and reason ~= 'rotated' then return false end
        return redis.call('GET', KEYS[1])`, [refreshKey(hash), blacklistKey('refresh', hash)]);
      return value ? JSON.parse(value) : null;
    },
    
    // Đổi cặp token nguyên tử: đưa refresh cũ vào BL rồi lưu token mới với TTL còn lại.
    // Hai lần refresh đồng thời: lần sau thấy token đã dùng sẽ thu hồi cả nhóm.
    async rotate({ previousHash, refreshHash, accessHash, state, accessSeconds }) {
      return evaluate(`${blacklistLua}
        -- Nhóm hết hạn, có BL hoặc sai generation thì không được cấp token mới.
        local ttl = redis.call('PTTL', KEYS[1])
        if ttl <= 0 or redis.call('EXISTS', KEYS[7]) == 1
          or (redis.call('GET', KEYS[2]) or '') ~= ARGV[1] then
          blacklist(KEYS[5], KEYS[6], 'revoked'); return 0
        end
        -- Refresh cũ đã dùng: thu hồi nhóm, bao gồm cả access token vừa được cấp trước đó.
        if redis.call('EXISTS', KEYS[6]) == 1 or redis.call('HGET', KEYS[1], 'current') ~= ARGV[2] then
          revokeFamily(KEYS[1], KEYS[7], 'refresh_reuse'); return -1
        end
        -- Giữ mốc hết hạn tuyệt đối của nhóm; không kéo dài thêm 7 ngày khi rotation.
        blacklist(KEYS[5], KEYS[6], 'rotated')
        redis.call('HSET', KEYS[1], 'current', ARGV[3])
        redis.call('SET', KEYS[3], ARGV[4], 'PX', ttl)
        redis.call('SET', KEYS[4], ARGV[4], 'PX', math.min(ttl, tonumber(ARGV[5])*1000))
        return ttl`, [familyKey(state.familyId), generationKey(state.userId), refreshKey(refreshHash), accessKey(accessHash),
        refreshKey(previousHash), blacklistKey('refresh', previousHash), blacklistKey('family', state.familyId)],
      [state.generation, previousHash, refreshHash, JSON.stringify(state), accessSeconds]);
    },

    // Ghi BL nhóm và refresh token được chỉ định, rồi xóa nhóm phiên đang hoạt động.
    async revokeFamily(familyId, refreshHash, reason = 'revoked') {
      await evaluate(`${blacklistLua}
        revokeFamily(KEYS[1], KEYS[2], ARGV[1])
        if ARGV[2] ~= '' then blacklist(KEYS[3], KEYS[4], ARGV[1]) end
        return 1`, [familyKey(familyId), blacklistKey('family', familyId), refreshKey(refreshHash ?? ''),
        blacklistKey('refresh', refreshHash ?? '')], [reason, refreshHash ?? '']);
    },

    // Logout bằng access token: ghi BL token, thu hồi nhóm nếu có và xóa khóa access.
    async remove(hash) {
      await evaluate(`${blacklistLua}
        local value = redis.call('GET', KEYS[1])
        blacklist(KEYS[1], KEYS[2], 'logout')
        if value and string.sub(value, 1, 1) == '{' then
          local state = cjson.decode(value)
          revokeFamily(ARGV[1] .. state.familyId, ARGV[2] .. state.familyId, 'logout')
        end
        redis.call('DEL', KEYS[1]); return 1`, [accessKey(hash), blacklistKey('access', hash)],
      [key(familyKey('')), key(blacklistKey('family', ''))]);
    },

    // Thu hồi các phiên của user; không ảnh hưởng user khác hoặc lần login sau mốc thu hồi.
    async revokeAll(userId) {
      await connect();
      // Đổi generation nguyên tử để chặn ngay các nhóm cũ, kể cả khi đang refresh đồng thời.
      const previous = await evaluate(`
        local previous = redis.call('GET', KEYS[1]) or ''
        redis.call('SET', KEYS[1], ARGV[1]); return previous`,
      [generationKey(userId)], [randomBytes(32).toString('hex')]);
      // SCAN duyệt từng đợt để ghi BL từng token, tránh khóa Redis bằng một script quét toàn bộ.
      // Generation đã đổi nên các nhóm cũ bị chặn ngay trong lúc quét; chỉ xử lý generation cũ.
      for await (const candidate of client.scanIterator({ MATCH: key(prefix) + '*', COUNT: 100 })) {
        const match = candidate.slice(key(prefix).length).match(/^(refresh:)?([a-f0-9]{64})$/);
        if (!match) continue;
        const type = match[1] ? 'refresh' : 'access';
        await client.eval(`${blacklistLua}
          local value = redis.call('GET', KEYS[1])
          if not value then return 0 end
          if string.sub(value, 1, 1) == '{' then
            local state = cjson.decode(value)
            if state.userId ~= ARGV[1] or state.generation ~= ARGV[2] then return 0 end
            revokeFamily(ARGV[3] .. state.familyId, ARGV[4] .. state.familyId, 'logout_all')
          elseif value ~= ARGV[1] then return 0 end
          blacklist(KEYS[1], KEYS[2], 'logout_all')
          if ARGV[5] == 'access' then redis.call('DEL', KEYS[1]) end
          return 1`, { keys: [candidate, key(blacklistKey(type, match[2]))],
          arguments: [String(userId), previous, key(familyKey('')), key(blacklistKey('family', '')), type] });
      }
    },

    // Giới hạn 20 lần login/IP trong 15 phút; INCR và EXPIRE chạy nguyên tử.
    // Chỉ đặt thời hạn khi đếm lần đầu, nên các lần sau không kéo dài cửa sổ giới hạn.
    async allowLogin(hash) {
      const count = await evaluate(`local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 900) end; return n`,
        [prefix + 'attempt:' + hash]);
      return count <= 20;
    },
  };
}
