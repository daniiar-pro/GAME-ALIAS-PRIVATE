import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WordDocument = HydratedDocument<Word>;

@Schema({ timestamps: true })
export class Word {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 120,
  })
  text: string;
}

export const WordSchema = SchemaFactory.createForClass(Word);

WordSchema.index({ text: 1 }, { unique: true });
