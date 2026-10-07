"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingService = void 0;
const redis_1 = __importDefault(require("../config/redis"));
class MatchmakingService {
    static getQueueKey(category, difficulty) {
        return `matchmaking:queue:${category.toLowerCase()}:${difficulty.toLowerCase()}`;
    }
    static async addToQueue(player) {
        const queueKey = this.getQueueKey(player.category, player.difficulty);
        // Remove if already in queue
        await this.removeFromAllQueues(player.userId);
        // Push serialized player object
        await redis_1.default.rpush(queueKey, JSON.stringify(player));
        // Index player location for fast removal
        await redis_1.default.set(`matchmaking:user:${player.userId}`, queueKey, 'EX', 120);
    }
    static async removeFromAllQueues(userId) {
        const queueKey = await redis_1.default.get(`matchmaking:user:${userId}`);
        if (queueKey) {
            const items = await redis_1.default.lrange(queueKey, 0, -1);
            for (const item of items) {
                try {
                    const parsed = JSON.parse(item);
                    if (parsed.userId === userId) {
                        await redis_1.default.lrem(queueKey, 1, item);
                    }
                }
                catch {
                    // ignore parsing error
                }
            }
            await redis_1.default.del(`matchmaking:user:${userId}`);
        }
    }
    static async findMatch(category, difficulty) {
        const queueKey = this.getQueueKey(category, difficulty);
        const length = await redis_1.default.llen(queueKey);
        if (length < 2)
            return null;
        const p1Raw = await redis_1.default.lpop(queueKey);
        const p2Raw = await redis_1.default.lpop(queueKey);
        if (!p1Raw || !p2Raw) {
            if (p1Raw)
                await redis_1.default.lpush(queueKey, p1Raw);
            return null;
        }
        try {
            const player1 = JSON.parse(p1Raw);
            const player2 = JSON.parse(p2Raw);
            await redis_1.default.del(`matchmaking:user:${player1.userId}`);
            await redis_1.default.del(`matchmaking:user:${player2.userId}`);
            return [player1, player2];
        }
        catch {
            return null;
        }
    }
}
exports.MatchmakingService = MatchmakingService;
