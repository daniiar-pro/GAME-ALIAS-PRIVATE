import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
// import { RolesGuard } from '@/shared/guards/roles.guard';
// import { Roles } from '@/shared/decorators/roles.decorator';
// import { CurrentUser } from '@/shared/decorators/current-user.decorator';
// import { UpdateProfileDto } from './dto/update-user.dto';
// import { ChangeRoleDto } from './dto/change-role.dto';

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // Me (USER CRUD)
  // 1. GET users/me
  // 2. PATCH users/me (updateMe)

  // Admin endpoints (ADMIN CRUD)
  // 1. admin/users (list())
  // 2. admin/users/:id/role (changeRole())
  // 3. admin/users/:id (delete())
}
