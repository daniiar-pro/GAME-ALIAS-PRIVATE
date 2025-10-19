import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { User, UserDocument } from 'src/infra/database/schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  // async create(data: {
  //   email: string;
  //   username: string;
  //   passwordHash: string;
  // }) {
  //   try {
  //     return await this.userModel.create({
  //       email: data.email.toLowerCase(),
  //       username: data.username.trim(),
  //       passwordHash: data.passwordHash,
  //     });
  //   } catch (e: any) {
  //     if (e?.code === 11000)
  //       throw new ConflictException('Email or username already in use');
  //     throw e;
  //   }
  // }

  // async updateProfileMe(
  //   userId: string,
  //   patch: { email?: string; username?: string },
  // ) {
  //   const doc = await this.userModel.findById(userId);
  //   if (!doc) throw new NotFoundException('User not found');

  //   if (patch.email) doc.email = patch.email.toLowerCase();
  //   if (patch.username) doc.username = patch.username.trim();

  //   try {
  //     await doc.save();
  //     return doc;
  //   } catch (e: any) {
  //     if (e?.code === 11000)
  //       throw new ConflictException('Email or username already in use');
  //     throw e;
  //   }
  // }

  // Admin
  async list(params: {
    q?: string;
    role?: 'user' | 'admin';
    limit?: number;
    offset?: number;
  }) {
    const where: FilterQuery<UserDocument> = {};
    if (params.role) where.role = params.role;
    if (params.q) {
      const q = params.q.trim();
      where.$or = [
        { email: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ];
    }
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const offset = Math.max(params.offset ?? 0, 0);

    const [items, total] = await Promise.all([
      this.userModel
        .find(where)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(where),
    ]);

    return { items, total, limit, offset };
  }

  async changeRole(id: string, role: 'user' | 'admin') {
    const doc = await this.userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    );
    if (!doc) throw new NotFoundException('User not found');
    return doc;
  }

  async delete(id: string) {
    const res = await this.userModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('User not found');
  }

  // Stats helpers (use when game ends)
  async incrementStats(userId: string, { games = 0, wins = 0 }) {
    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { totalGames: games, totalWins: wins } },
    );
  }
}
