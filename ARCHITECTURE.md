# passive-money Architecture (v0)

## Goals
- Bithumb spot first; extend to Bybit/OKX.
- 1m/5m candles; monthly backfill with retry.
- Strategy approval flow: DRAFT -> BACKTEST_PASS -> APPROVED_FOR_PAPER -> PAPER -> APPROVED_FOR_LIVE -> LIVE.
- Paper trading before live; fill at candle close.
- Risk settings adjustable in UI, applied immediately.
- Multi-symbol strategies supported; also per-symbol instances.

## High-Level Components
1. Market Data Ingestion (Node.js)
2. Backfill Worker (BullMQ + Redis)
3. Market Data Store (Postgres)
4. Strategy Lab/Backtester (Python)
5. Strategy Registry + Approval Service
6. Execution Engine (Node.js)
7. Risk Manager (Node.js)
8. Order Manager / Exchange Gateway
9. Portfolio & Performance Aggregator
10. Notifications (Telegram)
11. Dashboard (Next.js)

## Data Flow (Happy Path)
1. Ingest candlesticks from exchange to `candles`.
2. Strategy Lab builds signals -> register strategy version.
3. Approval moves to PAPER -> engine executes paper trades.
4. Manual approve -> LIVE -> engine places orders.
5. Order/fills/positions feed portfolio metrics and dashboard; alerts on failures or risk breaches.

## Order Lifecycle (Live + Paper)
- States: NEW -> OPEN -> PARTIAL -> FILLED | CANCELED | REJECTED | EXPIRED
- Each order can emit multiple fills; partial fills update position and remaining qty.
- Unfilled orders are tracked and re-priced or canceled based on strategy policy.

## Multi-Symbol Strategy Model
- Strategy definition may target multiple symbols.
- Strategy instance contains: strategy_version_id, account_id, symbol_set, params, mode (paper/live).
- Execution engine fans out per-symbol evaluation but allows shared state for cross-asset logic.

## Risk Manager (UI-Configurable)
- Risk per trade (1%, max 2%)
- Daily loss limit (3 to 5%)
- Position limit per market (20 to 25%)
- Slippage tolerance (0.2 to 0.5%)
- Immediate effect on next order and active order guardrails.

## Dashboard Requirements (Next.js)
- Exchange/account registration form (API key/secret + optional password)
- Strategy list + status
- Charts per exchange/symbol with BUY/SELL markers and partial-fill markers
- Orders: open/partial/filled/canceled, with filter by symbol
- Performance: current balance, PnL (daily/weekly/monthly/custom), win rate (position-based)

## Extensibility
- Exchange adapter interface (bithumb/bybit/okx)
- Strategy interface (signals -> orders)
- Data replayer for backtest/paper
