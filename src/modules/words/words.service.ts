import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, FilterQuery } from 'mongoose';

import { Word, WordDocument } from '../../infra/database/schemas/word.schema';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { SearchWordsDto } from './dto/search-words.dto';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
  ) {}

  private normalize(text: string) {
    return text.trim();
  }

  async create(dto: CreateWordDto): Promise<WordDocument> {
    const text = this.normalize(dto.text);
    try {
      return await this.wordModel.create({ text });
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Word already exists');
      throw e;
    }
  }

  async createMany(items: string[]): Promise<{ inserted: number }> {
    if (!items?.length) return { inserted: 0 };
    const docs = items.map((t) => ({ text: this.normalize(t) }));
    try {
      // ordered:false to continue on duplicates
      const res = await this.wordModel.insertMany(docs, { ordered: false });
      return { inserted: res.length };
    } catch (e: any) {
      // When duplicates exist, Mongo throws but still inserts the rest; count via acknowledged docs if present
      const ok = Array.isArray(e?.insertedDocs) ? e.insertedDocs.length : 0;
      const inserted = ok || 0;
      if (inserted > 0) return { inserted };
      // If truly nothing inserted, rethrow a friendly error
      throw new ConflictException('Some words already exist');
    }
  }

  async update(id: string, dto: UpdateWordDto): Promise<WordDocument> {
    if (!dto.text) throw new ConflictException('Provide text to update');
    const text = this.normalize(dto.text);

    try {
      const updated = await this.wordModel
        .findByIdAndUpdate(id, { text }, { new: true, runValidators: true })
        .exec();

      if (!updated) throw new NotFoundException('Word not found');
      return updated;
    } catch (e: any) {
      if (e?.code === 11000) throw new ConflictException('Word already exists');
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    const res = await this.wordModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Word not found');
  }

  async search(params: SearchWordsDto): Promise<{
    items: WordDocument[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { q, limit = 20, offset = 0 } = params;
    const filter: FilterQuery<WordDocument> = {};

    if (q && q.trim()) {
      // case-insensitive contains
      filter.text = { $regex: q.trim(), $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.wordModel
        .find(filter)
        .sort({ text: 1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.wordModel.countDocuments(filter).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async random(count = 10): Promise<WordDocument[]> {
    // efficient server-side sampling
    const n = Math.min(Math.max(1, count), 200);
    const result = await this.wordModel
      .aggregate([{ $sample: { size: n } }])
      .exec();
    return result as any;
  }

  async count(): Promise<number> {
    return this.wordModel.estimatedDocumentCount().exec();
  }

  /** Convenience for bootstrapping: only inserts if collection is empty */
  async seedIfEmpty(
    items: string[],
  ): Promise<{ inserted: number; alreadyHad: number }> {
    const existing = await this.count();
    if (existing > 0) return { inserted: 0, alreadyHad: existing };
    const { inserted } = await this.createMany(items);
    return { inserted, alreadyHad: 0 };
  }
}
