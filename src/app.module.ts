import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, AuthModule, PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
