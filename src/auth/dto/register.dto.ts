import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail(
    {},
    {
      message: 'Некорректная почта',
    },
  )
  email: string;

  @IsString({
    message: 'Имя пользователя обязательна',
  })
  @MinLength(4, {
    message: 'Имя пользователя должно содержать не менее 4 символов',
  })
  username: string;

  @MinLength(6, {
    message: 'Пароль должен содержать не менее 6 символов',
  })
  password: string;
}
