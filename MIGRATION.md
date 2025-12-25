# SQLite -> Postgres Migration Notes (trading-bot.sqlite)

## Source
File: /Users/baek/Develop/money-printer/apps/orchestrator/data/trading-bot.sqlite
Tables: candle, system_setting, system_log, balance_history, trade_log

## Table Mapping
- candle -> candles
  - columns: id, exchange, symbol, timeframe, timestamp, open, high, low, close, volume
  - unique: (exchange, symbol, timeframe, timestamp)

- system_setting -> system_settings
  - columns: key, value, description

- system_log -> system_logs
  - columns: id, level, message, created_at

- balance_history -> balance_history
  - columns: id, total_balance, krw_balance, btc_balance, btc_price, created_at, mode

- trade_log -> trade_logs
  - columns: id, exchange, symbol, side, price, amount, created_at, mode, fee, fee_currency

## Notes
- Decimals -> numeric(20,8)
- Candle timestamp stays bigint
- created_at should be timestamp with time zone
- mode can be string now, migrate to enum later

## Suggested New Postgres Tables (New System)
- exchanges, accounts, api_credentials
- strategies, strategy_versions, strategy_instances, strategy_approvals
- orders, order_fills, positions
- risk_settings, notifications, system_events
- portfolio_snapshots, performance_metrics

## Migration Flow
1. Create Postgres schema.
2. Export sqlite tables to CSV or use pgloader.
3. Import and validate unique constraints.
4. Rebuild indexes.
5. Sanity checks: row counts, min/max timestamps.
