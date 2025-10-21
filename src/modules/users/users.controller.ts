import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';

// If you registered JWT guard as global APP_GUARD, you can drop @UseGuards here.
// Otherwise, import your JwtAuthGuard from Auth module and use it here.
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // adjust path if different

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserResponseDto })
  async me(@Req() req: Request): Promise<UserResponseDto> {
    // Your Jwt strategy should attach payload to req.user
    // commonly: { sub: userId, email, username, roles }
    const userId = (req as any).user?.sub as string;
    return this.users.getMe(userId);
  }

  @Patch('me')
  @ApiOkResponse({ type: UserResponseDto })
  async updateMe(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const userId = (req as any).user?.sub as string;
    return this.users.updateMe(userId, dto);
  }

  @Patch('me/password')
  @ApiOkResponse({ description: 'Password changed successfully' })
  async changePassword(
    @Req() req: Request,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ ok: true }> {
    const userId = (req as any).user?.sub as string;
    await this.users.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return { ok: true };
  }
}
