# Phase 6: Next.js Dashboard (dashboard)

## Relevant Files

- `apps/dashboard/package.json` - 앱 패키지 설정
- `apps/dashboard/tsconfig.json` - TypeScript 설정
- `apps/dashboard/next.config.js` - Next.js 설정
- `apps/dashboard/tailwind.config.js` - Tailwind CSS 설정
- `apps/dashboard/src/app/` - App Router 페이지
- `apps/dashboard/src/components/` - 공통 컴포넌트
- `apps/dashboard/src/lib/` - 유틸리티 및 API 클라이언트

### Notes

- Next.js 14.x (App Router) 사용
- Tailwind CSS 스타일링
- lightweight-charts 차트 라이브러리
- API Gateway (localhost:3000)와 통신
- 포트 3001 (대시보드)

## Instructions for Completing Tasks

**IMPORTANT:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 진행 상황을 추적하세요.

## Tasks

- [x] 1.0 Next.js 앱 기본 구조 생성
  - [x] 1.1 apps/dashboard 디렉토리 생성
  - [x] 1.2 package.json 생성
  - [x] 1.3 tsconfig.json 생성
  - [x] 1.4 next.config.js 생성
  - [x] 1.5 tailwind.config.js 생성
  - [x] 1.6 postcss.config.js 생성
  - [x] 1.7 src/app/layout.tsx 생성
  - [x] 1.8 src/app/page.tsx 생성
  - [x] 1.9 src/app/globals.css 생성

- [x] 2.0 공통 컴포넌트 및 레이아웃 구현
  - [x] 2.1 사이드바 네비게이션 컴포넌트
  - [x] 2.2 헤더 컴포넌트
  - [x] 2.3 카드 컴포넌트
  - [x] 2.4 테이블 컴포넌트
  - [x] 2.5 버튼/입력 컴포넌트

- [x] 3.0 대시보드 메인 페이지 구현
  - [x] 3.1 포트폴리오 요약 카드
  - [x] 3.2 전략 성과 요약
  - [x] 3.3 최근 거래 내역
  - [x] 3.4 알림 목록

- [x] 4.0 차트 페이지 구현
  - [x] 4.1 lightweight-charts 설정
  - [x] 4.2 캔들스틱 차트 컴포넌트
  - [x] 4.3 심볼 선택기
  - [x] 4.4 타임프레임 선택기
  - [x] 4.5 주문 마커 표시 (BUY/SELL)

- [x] 5.0 전략 관리 페이지 구현
  - [x] 5.1 전략 목록 테이블
  - [x] 5.2 전략 상태 표시

- [x] 6.0 주문/포지션 페이지 구현
  - [x] 6.1 주문 목록 테이블
  - [x] 6.2 포지션 목록 테이블
  - [x] 6.3 상태 필터

- [x] 7.0 설정 페이지 구현
  - [x] 7.1 거래소 계정 등록 UI
  - [x] 7.2 리스크 설정 UI
  - [x] 7.3 알림 설정 UI

- [x] 8.0 알림 페이지 구현
  - [x] 8.1 알림 목록
  - [x] 8.2 알림 필터
  - [x] 8.3 읽음 처리

- [x] 9.0 빌드 및 테스트 검증
  - [x] 9.1 pnpm install 실행
  - [x] 9.2 pnpm build 실행

## 향후 구현 예정

- [ ] API 클라이언트 연동 (axios)
- [ ] 인증 토큰 관리 (zustand)
- [ ] 실시간 데이터 업데이트 (WebSocket)
- [ ] 반응형 모바일 UI
