import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from 'src/infra/database/schemas';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }]),
  ],
  providers: [WordsService],
  controllers: [WordsController],
  exports: [WordsService],
})
export class WordsModule {}
