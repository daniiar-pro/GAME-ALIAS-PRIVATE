import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() username: string;
  @ApiProperty() totalGames: number;
  @ApiProperty() totalWins: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
