import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../user/decorators/current-user.decorator';

import { PostDto } from './dto/post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAll() {
    return this.postService.getAll();
  }

  @Auth()
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: PostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postService.create(dto, userId, files);
  }
}
