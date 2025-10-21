import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { WordsService } from './words.service';
import { SimilarityService } from './similarity.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { SearchWordsDto } from './dto/search-words.dto';
import { BulkInsertDto } from './dto/bulk-insert.dto';
import { CheckSimilarityDto } from './dto/check-similarity.dto';

// If you have global guards, you can remove explicit @UseGuards here.
// If not global, uncomment these two imports and decorators for admin-only routes.
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../../shared/roles/roles.decorator';
// import { Role } from '../../shared/roles/role.enum';

@ApiTags('words')
@Controller('words')
export class WordsController {
  constructor(
    private readonly words: WordsService,
    private readonly similarity: SimilarityService,
  ) {}

  // Public search (used by admin UI too)
  @Get()
  async search(@Query() q: SearchWordsDto) {
    return this.words.search(q);
  }

  // Random words for a round
  @Get('random')
  async random(@Query('count') count?: string) {
    const n = Number.isFinite(Number(count)) ? Number(count) : 10;
    return this.words.random(n);
  }

  // Admin-only mutations (add guards if not global)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Word created' })
  async create(@Body() dto: CreateWordDto) {
    return this.words.create(dto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @Post('bulk')
  @ApiBearerAuth()
  async bulk(@Body() dto: BulkInsertDto) {
    return this.words.createMany(dto.items);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @Patch(':id')
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() dto: UpdateWordDto) {
    return this.words.update(id, dto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin)
  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    await this.words.remove(id);
    return { ok: true };
  }

  // Utility endpoint: client/server can confirm a guess without burning a round
  @Post('check')
  async check(@Body() dto: CheckSimilarityDto) {
    return this.similarity.isAcceptable(dto.word, dto.guess);
  }
}
