# Phase 2: 데이터 수집 서비스 (data-collector)

## Relevant Files

- `apps/data-collector/package.json` - 앱 패키지 설정
- `apps/data-collector/tsconfig.json` - TypeScript 설정
- `apps/data-collector/nest-cli.json` - NestJS CLI 설정
- `apps/data-collector/src/main.ts` - 앱 엔트리포인트
- `apps/data-collector/src/app.module.ts` - 루트 모듈
- `apps/data-collector/src/modules/candle/` - 캔들 수집 모듈
- `apps/data-collector/src/modules/backfill/` - 백필 모듈
- `apps/data-collector/src/modules/health/` - 헬스체크 모듈

### Notes

- NestJS 10.x 사용
- BullMQ로 백필 작업 큐 관리
- @nestjs/schedule로 주기적 수집
- PostgreSQL + Redis 연결

## Instructions for Completing Tasks

**IMPORTANT:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 진행 상황을 추적하세요.

## Tasks

- [x] 1.0 NestJS 앱 기본 구조 생성
  - [x] 1.1 apps/data-collector 디렉토리 생성
  - [x] 1.2 package.json 생성 (NestJS 의존성)
  - [x] 1.3 tsconfig.json 생성
  - [x] 1.4 nest-cli.json 생성
  - [x] 1.5 src/main.ts 생성
  - [x] 1.6 src/app.module.ts 생성
  - [x] 1.7 src/app.controller.ts 생성 (헬스체크)

- [x] 2.0 데이터베이스 연결 설정
  - [x] 2.1 TypeORM 모듈 설정
  - [x] 2.2 @passive-money/database 패키지 연동

- [x] 3.0 캔들 수집 모듈 구현
  - [x] 3.1 candle.module.ts 생성
  - [x] 3.2 candle.service.ts 생성 (수집 로직)
  - [x] 3.3 candle.scheduler.ts 생성 (스케줄러)
  - [x] 3.4 1분/5분 캔들 주기적 수집 구현

- [x] 4.0 백필 모듈 구현
  - [x] 4.1 backfill.module.ts 생성
  - [x] 4.2 backfill.service.ts 생성
  - [x] 4.3 backfill.processor.ts 생성 (BullMQ Worker)
  - [x] 4.4 backfill.controller.ts 생성 (API 엔드포인트)
  - [x] 4.5 월 단위 백필 로직 구현
  - [x] 4.6 재시도 로직 구현

- [x] 5.0 의존성 설치 및 빌드 검증
  - [x] 5.1 pnpm install 실행
  - [x] 5.2 pnpm build 실행
  - [ ] 5.3 앱 실행 테스트 (PostgreSQL/Redis 필요)

- [x] 6.0 테스트 및 검증
  - [x] 6.1 단위 테스트 작성 (candle.service.spec.ts)
  - [x] 6.2 단위 테스트 통과 확인
  - [ ] 6.3 통합 테스트 (PostgreSQL/Redis 필요)
