import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  const port = parseInt(process.env.PORT ?? '3000', 10);
  const jwtSecret = process.env.JWT_SECRET!;
  const jwtExpires = process.env.JWT_EXPIRES ?? '900s';

  const mongoUri =
    process.env.MONGO_URI ??
    `mongodb://${process.env.MONGO_HOST ?? 'localhost'}:${process.env.MONGO_PORT ?? '27017'}/${process.env.MONGO_DB_NAME ?? 'alias'}`;

  const redisUrl =
    process.env.REDIS_URL ??
    `redis://${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? '6379'}`;

  return { port, jwtSecret, jwtExpires, mongoUri, redisUrl };
});

export type AppConfigShape = ReturnType<typeof appConfig>;
