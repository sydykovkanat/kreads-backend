import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { Response } from 'express';

import { UserService } from '../user/user.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 7;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);

    return { user, ...tokens };
  }

  async register(dto: RegisterDto, avatarUrl: string) {
    const oldUserByEmail = await this.userService.getByEmail(dto.email);
    const oldUserByUsername = await this.userService.getByUsername(
      dto.username,
    );

    if (oldUserByEmail) {
      throw new BadRequestException(
        'Пользователь с такой почтой уже существует',
      );
    }

    if (oldUserByUsername) {
      throw new BadRequestException(
        'Пользователь с таким именем пользователя уже существует',
      );
    }

    const user = await this.userService.create(dto, avatarUrl);

    const tokens = this.issueTokens(user.id);

    console.log(user, tokens);

    return { user, ...tokens };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    const user = await this.userService.getById(result.id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const tokens = this.issueTokens(user.id);

    return { user, ...tokens };
  }

  issueTokens(userId: string) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async validateUser(dto: LoginDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return user;
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: this.configService.getOrThrow('SERVER_DOMAIN'),
      expires: expiresIn,
      secure: true,
      sameSite: 'lax',
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.getOrThrow('SERVER_DOMAIN'),
      expires: new Date(0),
      secure: true,
      sameSite: 'lax',
    });
  }
}
