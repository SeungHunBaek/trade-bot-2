import { validateEnv } from './env.schema';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  synchronize: boolean;
  logging: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  const env = validateEnv();

  return {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    database: env.DATABASE_NAME,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    synchronize: env.NODE_ENV === 'development',
    logging: env.NODE_ENV === 'development',
  };
}
