import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Game,
  GameDocument,
  Room,
  RoomDocument,
} from 'src/infra/database/schemas';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
  ) {}

  // 1. startGame()
  // 2.  getState()
}
