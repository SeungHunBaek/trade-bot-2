import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: any) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API 키가 필요합니다');
    }

    const result = await this.authService.validateApiKey(apiKey);
    if (!result) {
      throw new UnauthorizedException('유효하지 않은 API 키입니다');
    }

    return result.user;
  }
}
