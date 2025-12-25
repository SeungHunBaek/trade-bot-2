# Phase 1: 프로젝트 초기 설정

## Relevant Files

- `pnpm-workspace.yaml` - 모노레포 워크스페이스 설정
- `package.json` - 루트 패키지 설정
- `tsconfig.base.json` - TypeScript 기본 설정
- `tsconfig.json` - 루트 TypeScript 설정
- `.eslintrc.js` - ESLint 설정
- `.prettierrc` - Prettier 설정
- `.gitignore` - Git 무시 파일
- `.editorconfig` - 에디터 설정
- `.nvmrc` - Node.js 버전 고정
- `packages/database/package.json` - DB 패키지 설정
- `packages/database/src/entities/*.ts` - TypeORM 엔티티
- `packages/database/src/migrations/*.ts` - DB 마이그레이션
- `packages/common/package.json` - 공통 패키지 설정
- `packages/common/src/types/*.ts` - 공유 타입
- `packages/common/src/constants/*.ts` - 상수 정의
- `packages/exchange/package.json` - 거래소 패키지 설정
- `packages/exchange/src/*.ts` - 거래소 API 래퍼
- `packages/config/package.json` - 설정 패키지
- `packages/config/src/*.ts` - 환경 변수 관리

### Notes

- pnpm workspace를 사용하여 모노레포 구성
- TypeORM을 사용하여 PostgreSQL 연결
- 모든 패키지는 `@passive-money/` 스코프 사용

## Instructions for Completing Tasks

**IMPORTANT:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 진행 상황을 추적하세요.

## Tasks

- [ ] 0.0 Git 저장소 초기화
  - [ ] 0.1 `git init` 실행
  - [x] 0.2 `.gitignore` 파일 생성 (node_modules, dist, .env 등)
  - [ ] 0.3 초기 커밋 생성

- [x] 1.0 모노레포 기본 구조 설정
  - [x] 1.1 `pnpm-workspace.yaml` 생성 (apps/*, packages/* 포함)
  - [x] 1.2 루트 `package.json` 생성 (워크스페이스 스크립트 포함)
  - [x] 1.3 `.nvmrc` 생성 (Node.js 20 LTS)
  - [x] 1.4 `.editorconfig` 생성
  - [x] 1.5 apps/, packages/, scripts/, tasks/ 디렉토리 구조 생성

- [x] 2.0 TypeScript 설정
  - [x] 2.1 루트에 `tsconfig.base.json` 생성 (공통 설정)
  - [x] 2.2 루트에 `tsconfig.json` 생성 (references 설정)
  - [x] 2.3 TypeScript 및 관련 패키지 설치

- [x] 3.0 ESLint 및 Prettier 설정
  - [x] 3.1 `.eslintrc.js` 생성 (TypeScript 규칙 포함)
  - [x] 3.2 `.prettierrc` 생성
  - [x] 3.3 `.eslintignore`, `.prettierignore` 생성
  - [x] 3.4 ESLint, Prettier 패키지 설치
  - [x] 3.5 package.json에 lint, format 스크립트 추가

- [x] 4.0 packages/config 패키지 생성
  - [x] 4.1 package.json 생성
  - [x] 4.2 tsconfig.json 생성
  - [x] 4.3 src/index.ts 생성
  - [x] 4.4 src/env.schema.ts 생성 (환경 변수 스키마)
  - [x] 4.5 src/database.config.ts 생성
  - [x] 4.6 src/redis.config.ts 생성

- [x] 5.0 packages/common 패키지 생성
  - [x] 5.1 package.json 생성
  - [x] 5.2 tsconfig.json 생성
  - [x] 5.3 src/index.ts 생성
  - [x] 5.4 src/types/exchange.types.ts 생성 (거래소 관련 타입)
  - [x] 5.5 src/types/trading.types.ts 생성 (트레이딩 관련 타입)
  - [x] 5.6 src/constants/exchanges.ts 생성
  - [x] 5.7 src/constants/timeframes.ts 생성

- [x] 6.0 packages/database 패키지 생성
  - [x] 6.1 package.json 생성
  - [x] 6.2 tsconfig.json 생성
  - [x] 6.3 src/index.ts 생성
  - [x] 6.4 src/data-source.ts 생성 (TypeORM DataSource)
  - [x] 6.5 src/entities/candle.entity.ts 생성
  - [x] 6.6 src/entities/exchange.entity.ts 생성
  - [x] 6.7 src/entities/account.entity.ts 생성
  - [x] 6.8 src/entities/api-credential.entity.ts 생성
  - [x] 6.9 src/entities/strategy.entity.ts 생성
  - [x] 6.10 src/entities/strategy-version.entity.ts 생성
  - [x] 6.11 src/entities/strategy-instance.entity.ts 생성
  - [x] 6.12 src/entities/order.entity.ts 생성
  - [x] 6.13 src/entities/order-fill.entity.ts 생성
  - [x] 6.14 src/entities/position.entity.ts 생성
  - [x] 6.15 src/entities/balance-history.entity.ts 생성
  - [x] 6.16 src/entities/risk-setting.entity.ts 생성
  - [x] 6.17 src/entities/system-log.entity.ts 생성
  - [x] 6.18 src/entities/notification.entity.ts 생성
  - [x] 6.19 src/entities/index.ts 생성 (모든 엔티티 export)

- [x] 7.0 packages/exchange 패키지 생성
  - [x] 7.1 package.json 생성
  - [x] 7.2 tsconfig.json 생성
  - [x] 7.3 src/index.ts 생성
  - [x] 7.4 src/base.exchange.ts 생성 (추상 클래스)
  - [x] 7.5 src/bithumb.exchange.ts 생성

- [x] 8.0 의존성 설치 및 빌드 검증
  - [x] 8.1 `pnpm install` 실행
  - [x] 8.2 `pnpm build` 실행하여 빌드 확인
  - [ ] 8.3 `pnpm lint` 실행하여 린트 확인
  - [x] 8.4 TypeScript 타입 체크 확인
