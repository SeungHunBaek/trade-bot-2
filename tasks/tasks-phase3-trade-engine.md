# Phase 3: 거래 실행 엔진 (trade-engine)

## Relevant Files

- `apps/trade-engine/package.json` - 앱 패키지 설정
- `apps/trade-engine/tsconfig.json` - TypeScript 설정
- `apps/trade-engine/nest-cli.json` - NestJS CLI 설정
- `apps/trade-engine/src/main.ts` - 앱 엔트리포인트
- `apps/trade-engine/src/app.module.ts` - 루트 모듈
- `apps/trade-engine/src/modules/order/` - 주문 관리 모듈
- `apps/trade-engine/src/modules/position/` - 포지션 관리 모듈
- `apps/trade-engine/src/modules/risk/` - 리스크 관리 모듈
- `apps/trade-engine/src/modules/health/` - 헬스체크 모듈

### Notes

- NestJS 10.x 사용
- BullMQ로 주문 처리 큐 관리
- @passive-money/exchange 패키지 활용
- PostgreSQL + Redis 연결

## Instructions for Completing Tasks

**IMPORTANT:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 진행 상황을 추적하세요.

## Tasks

- [x] 1.0 NestJS 앱 기본 구조 생성
  - [x] 1.1 apps/trade-engine 디렉토리 생성
  - [x] 1.2 package.json 생성 (NestJS 의존성)
  - [x] 1.3 tsconfig.json 생성
  - [x] 1.4 nest-cli.json 생성
  - [x] 1.5 src/main.ts 생성
  - [x] 1.6 src/app.module.ts 생성
  - [x] 1.7 src/app.controller.ts 생성 (헬스체크)

- [x] 2.0 데이터베이스 연결 설정
  - [x] 2.1 TypeORM 모듈 설정
  - [x] 2.2 @passive-money/database 패키지 연동

- [x] 3.0 주문 관리 모듈 구현
  - [x] 3.1 order.module.ts 생성
  - [x] 3.2 order.service.ts 생성 (주문 생성/조회/취소)
  - [x] 3.3 order.processor.ts 생성 (BullMQ Worker)
  - [x] 3.4 order.controller.ts 생성 (API 엔드포인트)
  - [x] 3.5 주문 상태 관리 로직 구현
  - [x] 3.6 거래소 주문 연동

- [x] 4.0 포지션 관리 모듈 구현
  - [x] 4.1 position.module.ts 생성
  - [x] 4.2 position.service.ts 생성 (포지션 계산/조회)
  - [x] 4.3 position.controller.ts 생성 (API 엔드포인트)
  - [x] 4.4 평균 진입가 계산 로직
  - [x] 4.5 손익 계산 로직

- [x] 5.0 리스크 관리 모듈 구현
  - [x] 5.1 risk.module.ts 생성
  - [x] 5.2 risk.service.ts 생성 (리스크 검증)
  - [x] 5.3 주문 크기 제한 검증
  - [x] 5.4 일일 손실 제한 검증
  - [x] 5.5 최대 포지션 제한 검증

- [x] 6.0 의존성 설치 및 빌드 검증
  - [x] 6.1 pnpm install 실행
  - [x] 6.2 pnpm build 실행
  - [x] 6.3 앱 실행 테스트 (PostgreSQL/Redis 필요)

- [x] 7.0 테스트 및 검증
  - [x] 7.1 단위 테스트 작성 (order.service.spec.ts)
  - [x] 7.2 단위 테스트 작성 (position.service.spec.ts)
  - [x] 7.3 단위 테스트 작성 (risk.service.spec.ts)
  - [x] 7.4 단위 테스트 통과 확인
  - [x] 7.5 통합 테스트 (PostgreSQL/Redis 필요)
