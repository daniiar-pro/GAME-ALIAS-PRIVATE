import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, maxlength: 1000 })
  content: string;

  // createdAt, updatedAt via timestamps
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Fast queries for room history & moderation
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
ChatMessageSchema.index({ userId: 1, createdAt: -1 });
