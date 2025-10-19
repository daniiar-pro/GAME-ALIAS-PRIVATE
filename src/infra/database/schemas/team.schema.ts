import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Team {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 0, min: 0 })
  score: number;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  players: Types.ObjectId[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
