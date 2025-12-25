import { z } from 'zod';

export const envSchema = z.object({
  // Node
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_NAME: z.string().default('passive_money'),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default(''),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Bithumb
  BITHUMB_ACCESS_KEY: z.string().optional(),
  BITHUMB_SECRET_KEY: z.string().optional(),

  // Bybit (추후)
  BYBIT_ACCESS_KEY: z.string().optional(),
  BYBIT_SECRET_KEY: z.string().optional(),

  // OKX (추후)
  OKX_ACCESS_KEY: z.string().optional(),
  OKX_SECRET_KEY: z.string().optional(),
  OKX_PASSPHRASE: z.string().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  // Services
  API_GATEWAY_PORT: z.coerce.number().default(3000),
  DATA_COLLECTOR_PORT: z.coerce.number().default(3001),
  TRADE_ENGINE_PORT: z.coerce.number().default(3002),
  STRATEGY_ENGINE_PORT: z.coerce.number().default(8000),
  WEB_PORT: z.coerce.number().default(3100),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errorMessage = parsed.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errorMessage}`);
  }

  return parsed.data;
}
