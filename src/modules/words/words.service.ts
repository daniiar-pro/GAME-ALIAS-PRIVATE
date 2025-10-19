import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Word, WordDocument } from 'src/infra/database/schemas';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
  ) {}

  // 1. list()
  // 2. create()
  // 3. random()
}
