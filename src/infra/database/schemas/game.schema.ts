import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { Team, TeamSchema } from './team.schema';

export type GameDocument = HydratedDocument<Game>;

@Schema({ timestamps: true })
export class Game {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  currentRound: number;

  @Prop({ default: 5, min: 1, max: 50 })
  maxRounds: number;

  @Prop({ default: false })
  isFinished: boolean;

  @Prop({ type: [TeamSchema], default: [] })
  teams: Team[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
