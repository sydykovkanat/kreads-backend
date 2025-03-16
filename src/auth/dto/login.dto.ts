import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message: 'Некорректная почта',
    },
  )
  email: string;

  @MinLength(6, {
    message: 'Пароль должен содержать не менее 6 символов',
  })
  password: string;
}
