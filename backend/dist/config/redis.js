"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisMock = require('ioredis-mock');
let redisClient = new RedisMock();
try {
    const liveClient = new ioredis_1.default(env_1.env.REDIS_URL, {
        maxRetriesPerRequest: 2,
        retryStrategy(times) {
            if (times > 3) {
                console.warn('⚠️ Live Redis connection failed. Falling back to in-memory Redis mock.');
                return null; // Stop retrying live redis
            }
            return Math.min(times * 100, 1000);
        },
        lazyConnect: true,
    });
    liveClient.connect().then(() => {
        redisClient = liveClient;
        console.log('✅ Connected to live Redis at', env_1.env.REDIS_URL);
    }).catch((err) => {
        console.warn('⚠️ Could not connect to live Redis:', err.message);
        fallbackToMock();
    });
    liveClient.on('error', (_err) => {
        // Suppress unhandled error crashes
    });
}
catch (e) {
    fallbackToMock();
}
function fallbackToMock() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const RedisMock = require('ioredis-mock');
        redisClient = new RedisMock();
        console.log('✅ Fallback: In-memory mock Redis initialized.');
    }
    catch (err) {
        console.error('❌ Failed to initialize Redis mock:', err);
    }
}
const getRedisClient = () => redisClient;
exports.getRedisClient = getRedisClient;
exports.default = redisClient;
