import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity, UserApiKeyEntity } from '@passive-money/database';

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'user';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserApiKeyEntity)
    private readonly apiKeyRepository: Repository<UserApiKeyEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('이미 등록된 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.log(`New user registered: ${savedUser.email}`);

    return savedUser;
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('비활성화된 계정입니다');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'user',
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken,
      expiresIn: 7 * 24 * 60 * 60,
      tokenType: 'Bearer',
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
  }

  async validateApiKey(apiKey: string): Promise<{ user: UserEntity; apiKeyEntity: UserApiKeyEntity } | null> {
    const apiKeyEntity = await this.apiKeyRepository.findOne({
      where: { apiKey, isActive: true },
      relations: ['user'],
    });

    if (!apiKeyEntity || !apiKeyEntity.user.isActive) {
      return null;
    }

    apiKeyEntity.lastUsedAt = new Date();
    await this.apiKeyRepository.save(apiKeyEntity);

    return {
      user: apiKeyEntity.user,
      apiKeyEntity,
    };
  }

  async generateApiKey(userId: string, name: string): Promise<UserApiKeyEntity> {
    const apiKey = this.generateRandomKey(32);
    const secretKey = this.generateRandomKey(64);

    const apiKeyEntity = this.apiKeyRepository.create({
      userId,
      name,
      apiKey,
      secretKey,
      isActive: true,
    });

    const saved = await this.apiKeyRepository.save(apiKeyEntity);
    this.logger.log(`API key generated for user ${userId}: ${name}`);

    return saved;
  }

  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    const apiKeyEntity = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId, userId },
    });

    if (!apiKeyEntity) {
      throw new UnauthorizedException('API 키를 찾을 수 없습니다');
    }

    apiKeyEntity.isActive = false;
    await this.apiKeyRepository.save(apiKeyEntity);

    this.logger.log(`API key revoked: ${apiKeyId}`);
  }

  async getApiKeys(userId: string): Promise<UserApiKeyEntity[]> {
    return this.apiKeyRepository.find({
      where: { userId },
      select: ['id', 'name', 'apiKey', 'isActive', 'lastUsedAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  private generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
