import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';

function toUserDto(doc: UserDocument): UserResponseDto {
  return {
    id: doc._id.toString(),
    email: doc.email,
    username: doc.username,
    totalGames: doc.totalGames,
    totalWins: doc.totalWins,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    createdAt: doc.createdAt,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    updatedAt: doc.updatedAt,
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getByIdOrThrow(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.getByIdOrThrow(userId);
    return toUserDto(user);
  }

  async updateMe(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    if (!dto || (!dto.username && !dto.email)) {
      // Not strictly needed since DTO validated, but clearer error for clients
      throw new ConflictException('Provide at least one field to update');
    }

    try {
      const user = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            ...(dto.username ? { username: dto.username.trim() } : {}),
            ...(dto.email ? { email: dto.email.toLowerCase().trim() } : {}),
          },
          { new: true, runValidators: true },
        )
        .exec();

      if (!user) throw new NotFoundException('User not found');
      return toUserDto(user);
    } catch (e: any) {
      // Mongo duplicate key error (unique index)
      if (e?.code === 11000) {
        // figure out which field collided
        const fields = Object.keys(e.keyPattern ?? {});
        const field = fields[0] ?? 'field';
        throw new ConflictException(`${field} already in use`);
      }
      throw e;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.getByIdOrThrow(userId);

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();
  }

  // handy helpers for other modules (Auth etc.)
  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username: username.trim() }).exec();
  }
}
