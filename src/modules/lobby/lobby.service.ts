import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument, User } from 'src/infra/database/schemas';

@Injectable()
export class LobbyService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // 1. list()
  // 2. create()
  // 3. join()
  // 4. leave()
}
