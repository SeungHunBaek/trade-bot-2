# Phase 5: API Gateway (api-gateway)

## Relevant Files

- `apps/api-gateway/package.json` - 앱 패키지 설정
- `apps/api-gateway/tsconfig.json` - TypeScript 설정
- `apps/api-gateway/nest-cli.json` - NestJS CLI 설정
- `apps/api-gateway/src/main.ts` - 앱 엔트리포인트
- `apps/api-gateway/src/app.module.ts` - 루트 모듈
- `apps/api-gateway/src/modules/auth/` - 인증/인가 모듈
- `apps/api-gateway/src/modules/health/` - 헬스체크 모듈
- `packages/database/src/entities/user.entity.ts` - 사용자 엔티티
- `packages/database/src/entities/user-api-key.entity.ts` - 사용자 API 키 엔티티

### Notes

- NestJS 10.x 사용
- JWT 기반 인증 (passport-jwt)
- API Key 기반 인증 (passport-custom)
- bcrypt 비밀번호 해싱
- Swagger API 문서화
- 포트 3000 (메인 API)
- UserEntity, UserApiKeyEntity 새로 생성 (기존 AccountEntity와 분리)

## Instructions for Completing Tasks

**IMPORTANT:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 진행 상황을 추적하세요.

## Tasks

- [x] 1.0 NestJS 앱 기본 구조 생성
  - [x] 1.1 apps/api-gateway 디렉토리 생성
  - [x] 1.2 package.json 생성 (NestJS 의존성)
  - [x] 1.3 tsconfig.json 생성
  - [x] 1.4 nest-cli.json 생성
  - [x] 1.5 src/main.ts 생성 (Swagger 설정 포함)
  - [x] 1.6 src/app.module.ts 생성
  - [x] 1.7 src/app.controller.ts 생성 (기본 라우트)

- [x] 2.0 인증/인가 모듈 구현
  - [x] 2.1 auth.module.ts 생성
  - [x] 2.2 auth.service.ts 생성 (JWT 발급/검증)
  - [x] 2.3 auth.controller.ts 생성 (로그인/회원가입)
  - [x] 2.4 jwt.strategy.ts 생성 (Passport JWT)
  - [x] 2.5 auth.guard.ts 생성 (인증 가드)
  - [x] 2.6 API 키 기반 인증 구현

- [x] 3.0 사용자 인증 엔티티 추가
  - [x] 3.1 UserEntity 생성 (email, password, name)
  - [x] 3.2 UserApiKeyEntity 생성 (apiKey, secretKey)
  - [x] 3.3 database 패키지에 엔티티 export 추가

- [x] 4.0 헬스체크 모듈 구현
  - [x] 4.1 health.module.ts 생성
  - [x] 4.2 health.service.ts 생성
  - [x] 4.3 health.controller.ts 생성

- [x] 5.0 의존성 설치 및 빌드 검증
  - [x] 5.1 pnpm install 실행
  - [x] 5.2 pnpm build 실행

## 향후 구현 예정 (Phase 5.5)

아래 기능들은 엔티티 구조 재설계 후 구현 예정:

- [ ] 계정 관리 모듈 (account)
  - API 크레덴셜 관리
  - 잔고 조회

- [ ] 대시보드 API (dashboard)
  - 포트폴리오 요약 API
  - 전략 성과 API
  - 최근 거래 내역 API
  - 알림 API

- [ ] 주문/포지션 프록시 API (order)
  - trade-engine 프록시
  - strategy-engine 프록시
