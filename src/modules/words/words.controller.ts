import { Body, Controller } from '@nestjs/common';
import { WordsService } from './words.service';
// import { CreateWordDto } from './dto/create-word.dto';

@Controller('words')
export class WordsController {
  constructor(private readonly words: WordsService) {}

  // 1. list()
  // 2. create()
  // 3. random()
}
