import { validateEnv } from './env.schema';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export function getRedisConfig(): RedisConfig {
  const env = validateEnv();

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  };
}
