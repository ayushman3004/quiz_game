import redisClient from '../config/redis';

export interface QueuedPlayer {
  userId: string;
  socketId: string;
  displayName: string;
  avatarUrl: string;
  rating: number;
  category: string;
  difficulty: string;
  queuedAt: number;
}

export class MatchmakingService {
  private static getQueueKey(category: string, difficulty: string): string {
    return `matchmaking:queue:${category.toLowerCase()}:${difficulty.toLowerCase()}`;
  }

  public static async addToQueue(player: QueuedPlayer): Promise<void> {
    const queueKey = this.getQueueKey(player.category, player.difficulty);
    // Remove if already in queue
    await this.removeFromAllQueues(player.userId);
    // Push serialized player object
    await redisClient.rpush(queueKey, JSON.stringify(player));
    // Index player location for fast removal
    await redisClient.set(`matchmaking:user:${player.userId}`, queueKey, 'EX', 120);
  }

  public static async removeFromAllQueues(userId: string): Promise<void> {
    const queueKey = await redisClient.get(`matchmaking:user:${userId}`);
    if (queueKey) {
      const items = await redisClient.lrange(queueKey, 0, -1);
      for (const item of items) {
        try {
          const parsed = JSON.parse(item) as QueuedPlayer;
          if (parsed.userId === userId) {
            await redisClient.lrem(queueKey, 1, item);
          }
        } catch {
          // ignore parsing error
        }
      }
      await redisClient.del(`matchmaking:user:${userId}`);
    }
  }

  public static async findMatch(category: string, difficulty: string): Promise<[QueuedPlayer, QueuedPlayer] | null> {
    const queueKey = this.getQueueKey(category, difficulty);
    const length = await redisClient.llen(queueKey);

    if (length < 2) return null;

    const p1Raw = await redisClient.lpop(queueKey);
    const p2Raw = await redisClient.lpop(queueKey);

    if (!p1Raw || !p2Raw) {
      if (p1Raw) await redisClient.lpush(queueKey, p1Raw);
      return null;
    }

    try {
      const player1 = JSON.parse(p1Raw) as QueuedPlayer;
      const player2 = JSON.parse(p2Raw) as QueuedPlayer;

      await redisClient.del(`matchmaking:user:${player1.userId}`);
      await redisClient.del(`matchmaking:user:${player2.userId}`);

      return [player1, player2];
    } catch {
      return null;
    }
  }
}
