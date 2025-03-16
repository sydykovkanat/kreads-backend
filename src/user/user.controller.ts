import { Controller, Get } from '@nestjs/common';

import { Auth } from '../auth/decorators/auth.decorator';

import { CurrentUser } from './decorators/current-user.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Get('/profile')
  async getById(@CurrentUser('id') id: string) {
    return this.userService.getById(id);
  }
}
