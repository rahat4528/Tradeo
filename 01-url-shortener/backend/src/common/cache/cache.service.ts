import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private memoryCache = new Map<string, CacheEntry>();
  private useRedis = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');

    try {
      this.redisClient = new Redis({
        host,
        port,
        password: password || undefined,
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Do not spam reconnect if not present
      });

      this.redisClient.on('error', (err) => {
        if (this.useRedis) {
          this.logger.warn(`Redis disconnected, switching to in-memory cache: ${err.message}`);
          this.useRedis = false;
        }
      });

      await this.redisClient.connect();
      this.useRedis = true;
      this.logger.log(`Connected to Redis cache at ${host}:${port}`);
    } catch (err: any) {
      this.logger.warn(`Redis cache unavailable (${err.message}). Using in-memory fallback.`);
      this.useRedis = false;
      if (this.redisClient) {
        this.redisClient.disconnect();
        this.redisClient = null;
      }
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useRedis && this.redisClient) {
      try {
        return await this.redisClient.get(key);
      } catch (err: any) {
        this.logger.warn(`Redis get failed for key ${key}: ${err.message}`);
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.redisClient.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, value);
        }
        return;
      } catch (err: any) {
        this.logger.warn(`Redis set failed for key ${key}: ${err.message}`);
      }
    }

    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err: any) {
        this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
      }
    }
    this.memoryCache.delete(key);
  }

  async clear(): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.flushdb();
      } catch (err: any) {}
    }
    this.memoryCache.clear();
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit().catch(() => {});
    }
    this.memoryCache.clear();
  }
}
