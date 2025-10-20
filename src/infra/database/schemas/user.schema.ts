import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false, timestamps: false })
class RefreshToken {
  @Prop({ required: true }) tokenHash: string; // store hash
  @Prop({ required: true }) expiresAt: Date;
  @Prop({ default: Date.now }) createdAt: Date;
}
const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    index: true,
  })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: 0, min: 0 })
  totalGames: number;

  @Prop({ default: 0, min: 0 })
  totalWins: number;

  @Prop({ type: [RefreshTokenSchema], default: [] })
  refreshTokens: RefreshToken[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// helpful indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ 'refreshTokens.tokenHash': 1 });
