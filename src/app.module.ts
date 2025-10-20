import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { envValidationSchema, appConfig } from './infra/config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GameModule } from './modules/game/game.module';
import { ChatModule } from './modules/chat/chat.module';
import { WordsModule } from './modules/words/words.module';
import { RoomModule } from './modules/room/room.module';
import { Gateway } from './modules/gateway/gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI', { infer: true }),
        // dbName: config.get<string>('MONGO_DB_NAME'), // only if not in URI
      }),
    }),

    AuthModule,
    UsersModule,
    RoomModule,
    GameModule,
    ChatModule,
    WordsModule,
    Gateway,
  ],
})
export class AppModule {}
