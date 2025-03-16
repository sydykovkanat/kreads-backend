import { IsString, MinLength } from 'class-validator';

export class PostDto {
  @IsString({
    message: 'Контент обязателен',
  })
  @MinLength(4, {
    message: 'Контент должен содержать не менее 4 символов',
  })
  content: string;
}
