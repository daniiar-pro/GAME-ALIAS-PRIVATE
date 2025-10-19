import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { TeamSchema, Team } from './team.schema';

export type RoomDocument = HydratedDocument<Room>;
export type RoomPhase = 'waiting' | 'inGame' | 'finished';

@Schema({ timestamps: true, versionKey: false })
export class Room {
  @Prop({ required: true, trim: true, maxlength: 80 })
  name: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @Prop({ default: 'waiting' })
  phase: RoomPhase;

  @Prop({ type: Types.ObjectId, ref: 'Game', default: null })
  activeGameId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [TeamSchema], default: [] })
  teams: Team[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.index({ name: 'text' });
