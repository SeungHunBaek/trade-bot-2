import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService, LoginDto, RegisterDto, TokenResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 401, description: '이미 등록된 이메일' })
  async register(@Body() dto: RegisterDto) {
    const account = await this.authService.register(dto);
    return {
      id: account.id,
      email: account.email,
      name: account.name,
      createdAt: account.createdAt,
    };
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: Object })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보' })
  async getMe(@Request() req: any) {
    const account = req.user;
    return {
      id: account.id,
      email: account.email,
      name: account.name,
      createdAt: account.createdAt,
    };
  }

  @Post('api-keys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'API 키 생성' })
  @ApiResponse({ status: 201, description: 'API 키 생성 성공' })
  async createApiKey(@Request() req: any, @Body() body: { name: string }) {
    const credential = await this.authService.generateApiKey(
      req.user.id,
      body.name,
    );
    return {
      id: credential.id,
      name: credential.name,
      apiKey: credential.apiKey,
      secretKey: credential.secretKey, // 최초 생성 시에만 표시
      createdAt: credential.createdAt,
    };
  }

  @Get('api-keys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'API 키 목록 조회' })
  @ApiResponse({ status: 200, description: 'API 키 목록' })
  async getApiKeys(@Request() req: any) {
    return this.authService.getApiKeys(req.user.id);
  }

  @Delete('api-keys/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'API 키 폐기' })
  @ApiResponse({ status: 200, description: 'API 키 폐기 성공' })
  async revokeApiKey(@Request() req: any, @Param('id') id: string) {
    await this.authService.revokeApiKey(req.user.id, id);
    return { success: true };
  }
}
