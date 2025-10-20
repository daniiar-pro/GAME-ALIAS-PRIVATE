import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import createClient from 'ioredis';
import { Server, ServerOptions } from 'socket.io';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const cfg = app.get(ConfigService);
  const port = cfg.getOrThrow<number>('app.port');
  const redisHost = cfg.get<string>('REDIS_HOST') ?? 'localhost';
  const redisPort = cfg.get<number>('REDIS_PORT') ?? 6379;

  // --- 🔌 Redis-backed Socket.IO adapter (optional) ---
  try {
    const pubClient = new createClient({ host: redisHost, port: redisPort });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    const redisAdapter = createAdapter(pubClient, subClient);
    const ioAdapter = new IoAdapter(app);

    ioAdapter.createIOServer = (
      port: number,
      options?: ServerOptions,
    ): Server => {
      const server = new Server(options);
      server.adapter(redisAdapter);
      return server;
    };

    app.useWebSocketAdapter(ioAdapter);
    console.log(`✅ Redis adapter connected (${redisHost}:${redisPort})`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn(
        '⚠️ Redis not available — running sockets in single-instance mode.',
        err.message,
      );
    } else {
      console.warn(
        '⚠️ Redis not available — running sockets in single-instance mode.',
        String(err),
      );
    }
  }

  const docConfig = new DocumentBuilder()
    .setTitle('Alias API')
    .setDescription('Alias game backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api/docs', app, doc);

  await app.listen(port);
  console.log(`API ready on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('Fatal bootstrap error: ', err);
  process.exit(1);
});
