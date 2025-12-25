# Passive Money - 프로젝트 컨텍스트

## 프로젝트 개요

빗썸 스팟 시장 대상 자동 매매 시스템. 1m/5m 캔들 기반 전략 생성/검증/배포/실행 파이프라인.

## 기술 스택

- **모노레포**: pnpm workspace
- **백엔드**: NestJS 10.x, TypeORM, PostgreSQL, Redis (BullMQ)
- **프론트엔드**: Next.js 14.x (App Router), Tailwind CSS, lightweight-charts
- **언어**: TypeScript 5.x

## 디렉토리 구조

```
passive-money/
├── apps/
│   ├── api-gateway/       # REST API 서버 (포트 3000)
│   ├── dashboard/         # Next.js 대시보드 (포트 3001)
│   ├── data-collector/    # 캔들 데이터 수집 (포트 3002)
│   ├── trade-engine/      # 주문 실행 엔진 (포트 3003)
│   └── strategy-engine/   # 전략 실행 엔진 (포트 3004)
├── packages/
│   ├── common/            # 공통 타입, 유틸리티
│   ├── config/            # 환경 설정
│   ├── database/          # TypeORM 엔티티
│   └── exchange/          # 거래소 API 클라이언트
├── tasks/                 # Phase별 태스크 파일
├── PRD.md                 # 제품 요구사항 문서
└── .env                   # 환경 변수 (API 키 등)
```

## 완료된 Phase

### Phase 1: 프로젝트 초기 설정
- pnpm 모노레포 구성
- 공통 패키지 (common, config, database, exchange)

### Phase 2: Data Collector
- 빗썸 1m/5m 캔들 수집
- 월 단위 백필 (2020-01-01~)
- BullMQ 재시도 큐

### Phase 3: Trade Engine
- 주문 실행 (지정가)
- 주문 상태 관리 (NEW → FILLED/CANCELED)
- 포지션 관리

### Phase 4: Strategy Engine
- 전략 인스턴스 실행
- 페이퍼/라이브 트레이딩
- 전략 상태 전이 (DRAFT → BACKTEST_PASS → PAPER → LIVE)

### Phase 5: API Gateway
- JWT 인증 (passport-jwt)
- API Key 인증 (passport-custom)
- UserEntity, UserApiKeyEntity 생성
- 헬스체크

### Phase 6: Dashboard
- Next.js 14 App Router
- 대시보드 메인 (포트폴리오, 전략 성과, 최근 거래)
- 차트 페이지 (캔들스틱, BUY/SELL 마커)
- 전략/주문/포지션/알림/설정 페이지

## 주요 엔티티

```typescript
// packages/database/src/entities/
- UserEntity           // 사용자 인증 (email, password, name)
- UserApiKeyEntity     // API 키 관리
- AccountEntity        // 거래소 계정 (exchangeId)
- ApiCredentialEntity  // 거래소 API 크레덴셜
- CandleEntity         // 캔들 데이터
- StrategyEntity       // 전략 정의
- StrategyVersionEntity // 전략 버전
- StrategyInstanceEntity // 전략 인스턴스
- OrderEntity          // 주문
- OrderFillEntity      // 체결
- PositionEntity       // 포지션
- BalanceHistoryEntity // 잔고 이력
- RiskSettingEntity    // 리스크 설정
- NotificationEntity   // 알림
- ExchangeEntity       // 거래소 정보
- SystemLogEntity      // 시스템 로그
```

## 환경 변수 (.env)

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=passive_money
DATABASE_USER=postgres
DATABASE_PASSWORD=

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d

BITHUMB_ACCESS_KEY=***
BITHUMB_SECRET_KEY=***
BYBIT_ACCESS_KEY=***
BYBIT_SECRET_KEY=***
OKX_ACCESS_KEY=***
OKX_SECRET_KEY=***
OKX_PASSWORD=***

TELEGRAM_BOT_TOKEN=***
TELEGRAM_CHAT_ID=***
```

## 다음 작업 후보

1. **Phase 7: 텔레그램 알림 서비스**
   - 주문 체결/실패 알림
   - 리스크 초과 알림
   - 데이터 수집 지연 알림

2. **API Gateway 확장 (Phase 5.5)**
   - Account, Dashboard, Order 모듈 완성
   - 엔티티와 API 호환성 수정

3. **통합 테스트 / Docker Compose**
   - 전체 서비스 연동 테스트
   - docker-compose.yml 설정

4. **대시보드 API 연동**
   - axios 클라이언트 설정
   - zustand 상태 관리
   - 실시간 WebSocket 업데이트

## Git 커밋 히스토리

```
0143433 feat: Phase 6 Next.js Dashboard 구현
e96cfc1 feat: Phase 5 API Gateway 기본 구현
625c341 feat: Phase 4 전략 엔진 (strategy-engine) 구현
e176627 feat: Phase 3 거래 실행 엔진 (trade-engine) 구현
66bd7f3 feat: Phase 2 데이터 수집 서비스 구현
aee8af2 chore: Phase 1 프로젝트 초기 설정 완료
```

## 주요 명령어

```bash
# 전체 빌드
pnpm build

# 의존성 설치
pnpm install

# 개발 서버 실행 (각 앱에서)
cd apps/api-gateway && pnpm start:dev
cd apps/dashboard && pnpm dev
cd apps/data-collector && pnpm start:dev
cd apps/trade-engine && pnpm start:dev
cd apps/strategy-engine && pnpm start:dev

# Git 로그 확인
git log --oneline -10
```

## 알려진 이슈

1. **API Gateway 모듈 미완성**
   - Account, Dashboard, Order 모듈은 엔티티 호환성 문제로 임시 제거됨
   - `apps/api-gateway/src/app.module.ts`에서 AuthModule, HealthModule만 포함

2. **Dashboard Mock 데이터**
   - 현재 모든 페이지가 Mock 데이터 사용
   - API 연동 필요

3. **엔티티 관계**
   - UserEntity ↔ UserApiKeyEntity (1:N)
   - AccountEntity에 userId 필드 없음 (추가 필요)
   - ApiCredentialEntity에 apiKey 필드 없음 (accessKey 사용)

## 새 대화 시작 시 참고

다음 대화창에서 아래 파일들을 읽으면 전체 컨텍스트 파악 가능:

1. `/Users/baek/Develop/passive-money/CONTEXT.md` (이 파일)
2. `/Users/baek/Develop/passive-money/PRD.md` (요구사항)
3. `/Users/baek/Develop/passive-money/tasks/` (Phase별 태스크)

## 참고 사항

- Dashboard ESLint: `ignoreDuringBuilds: true` 설정됨
- TypeORM synchronize: production이 아닐 때만 활성화
