import { Injectable } from '@nestjs/common';
import { existsSync, mkdir, writeFile } from 'fs-extra';
import { join } from 'path';

import { PrismaService } from '../prisma.service';

import { PostDto } from './dto/post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.post.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getById(id: string) {
    return this.prisma.post.findUnique({
      where: {
        id,
      },
    });
  }

  async create(dto: PostDto, userId: string, files: Express.Multer.File[]) {
    let imageUrls: string[] = [];
    const uploadDir = join(__dirname, '..', '..', 'uploads');

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const uniqueFileName = `${Date.now()}-${file.originalname}`;
        const filePath = join(uploadDir, uniqueFileName);
        await writeFile(filePath, file.buffer);
        imageUrls.push(`/uploads/${uniqueFileName}`);
      }
    }

    return this.prisma.post.create({
      data: {
        userId,
        images: imageUrls.length > 0 ? { set: imageUrls } : undefined,
        ...dto,
      },
    });
  }
}
