import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserEntity, UserApiKeyEntity } from '@passive-money/database';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ApiKeyStrategy } from './strategies/api-key.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserApiKeyEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ApiKeyStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
