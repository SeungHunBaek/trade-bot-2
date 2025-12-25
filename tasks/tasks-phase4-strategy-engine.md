# Phase 4: 전략 엔진 (strategy-engine)

## Relevant Files

- `apps/strategy-engine/package.json` - 앱 패키지 설정
- `apps/strategy-engine/tsconfig.json` - TypeScript 설정
- `apps/strategy-engine/nest-cli.json` - NestJS CLI 설정
- `apps/strategy-engine/src/main.ts` - 앱 엔트리포인트
- `apps/strategy-engine/src/app.module.ts` - 루트 모듈
- `apps/strategy-engine/src/modules/strategy/` - 전략 관리 모듈
- `apps/strategy-engine/src/modules/signal/` - 시그널 생성 모듈
- `apps/strategy-engine/src/modules/backtest/` - 백테스트 모듈
- `apps/strategy-engine/src/modules/health/` - 헬스체크 모듈

### Notes

- NestJS 10.x 사용
- BullMQ로 시그널 처리 큐 관리
- 기술적 분석 지표 계산 (RSI, MACD, MA 등)
- 백테스트 엔진으로 전략 검증
- trade-engine과 연동하여 주문 실행

## Instructions for Completing Tasks

**IMPORTANT:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 진행 상황을 추적하세요.

## Tasks

- [x] 1.0 NestJS 앱 기본 구조 생성
  - [x] 1.1 apps/strategy-engine 디렉토리 생성
  - [x] 1.2 package.json 생성 (NestJS 의존성)
  - [x] 1.3 tsconfig.json 생성
  - [x] 1.4 nest-cli.json 생성
  - [x] 1.5 src/main.ts 생성
  - [x] 1.6 src/app.module.ts 생성
  - [x] 1.7 src/app.controller.ts 생성 (헬스체크)

- [x] 2.0 기술적 분석 지표 구현 (packages/common에 추가)
  - [x] 2.1 indicators/rsi.ts - RSI 계산
  - [x] 2.2 indicators/macd.ts - MACD 계산
  - [x] 2.3 indicators/moving-average.ts - SMA/EMA 계산
  - [x] 2.4 indicators/bollinger.ts - 볼린저 밴드 계산
  - [x] 2.5 indicators/index.ts - export

- [x] 3.0 전략 관리 모듈 구현
  - [x] 3.1 strategy.module.ts 생성
  - [x] 3.2 strategy.service.ts 생성 (전략 CRUD)
  - [x] 3.3 strategy.controller.ts 생성 (API 엔드포인트)
  - [x] 3.4 전략 인스턴스 생성/시작/중지 로직

- [x] 4.0 시그널 생성 모듈 구현
  - [x] 4.1 signal.module.ts 생성
  - [x] 4.2 signal.service.ts 생성 (시그널 생성 로직)
  - [x] 4.3 signal.processor.ts 생성 (BullMQ Worker)
  - [x] 4.4 전략별 시그널 생성 구현
    - [x] 4.4.1 RSI 기반 전략
    - [x] 4.4.2 MACD 크로스오버 전략
    - [x] 4.4.3 이동평균 크로스오버 전략

- [x] 5.0 백테스트 모듈 구현
  - [x] 5.1 backtest.module.ts 생성
  - [x] 5.2 backtest.service.ts 생성 (백테스트 실행)
  - [x] 5.3 backtest.controller.ts 생성 (API 엔드포인트)
  - [x] 5.4 히스토리 데이터로 전략 시뮬레이션
  - [x] 5.5 성과 지표 계산 (수익률, 샤프비율, MDD 등)

- [x] 6.0 의존성 설치 및 빌드 검증
  - [x] 6.1 pnpm install 실행
  - [x] 6.2 pnpm build 실행
  - [x] 6.3 앱 실행 테스트

- [x] 7.0 테스트 및 검증
  - [x] 7.1 지표 계산 단위 테스트
  - [x] 7.2 시그널 생성 단위 테스트
  - [x] 7.3 백테스트 단위 테스트
  - [x] 7.4 단위 테스트 통과 확인
