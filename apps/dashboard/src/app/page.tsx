'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Bell,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+20.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+$1,234.56</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+2.5%</span> return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67.8%</div>
            <p className="text-xs text-muted-foreground">
              Based on 156 closed positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 live, 1 paper trading
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades & Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { symbol: 'BTC/KRW', side: 'BUY', price: '87,500,000', amount: '0.015', time: '14:32:15' },
                { symbol: 'ETH/KRW', side: 'SELL', price: '4,250,000', amount: '0.5', time: '14:28:42' },
                { symbol: 'XRP/KRW', side: 'BUY', price: '850', amount: '1000', time: '14:15:08' },
                { symbol: 'BTC/KRW', side: 'SELL', price: '87,650,000', amount: '0.012', time: '13:58:33' },
              ].map((trade, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.side === 'BUY'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {trade.side}
                    </span>
                    <span className="font-medium">{trade.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{trade.price}</div>
                    <div className="text-xs text-muted-foreground">{trade.amount} @ {trade.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'info', message: 'Strategy "Momentum Alpha" started', time: '5 min ago' },
                { type: 'success', message: 'Order filled: BUY 0.015 BTC', time: '15 min ago' },
                { type: 'warning', message: 'Daily loss limit at 80%', time: '1 hour ago' },
                { type: 'error', message: 'Connection lost to Bithumb API', time: '2 hours ago' },
              ].map((notification, idx) => (
                <div key={idx} className="flex items-start gap-3 border-b border-border pb-2 last:border-0">
                  <span className={`mt-1 h-2 w-2 rounded-full ${
                    notification.type === 'info' ? 'bg-blue-500' :
                    notification.type === 'success' ? 'bg-success' :
                    notification.type === 'warning' ? 'bg-warning' :
                    'bg-destructive'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Momentum Alpha', status: 'LIVE', pnl: '+12.5%', trades: 45, winRate: '68%' },
              { name: 'Mean Reversion Beta', status: 'LIVE', pnl: '+8.2%', trades: 32, winRate: '72%' },
              { name: 'Breakout Gamma', status: 'PAPER', pnl: '+5.1%', trades: 18, winRate: '61%' },
            ].map((strategy, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{strategy.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    strategy.status === 'LIVE'
                      ? 'bg-success/20 text-success'
                      : 'bg-warning/20 text-warning'
                  }`}>
                    {strategy.status}
                  </span>
                </div>
                <div className="flex gap-8 text-sm">
                  <div>
                    <div className="text-muted-foreground">P&L</div>
                    <div className="font-medium text-success">{strategy.pnl}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Trades</div>
                    <div className="font-medium">{strategy.trades}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Win Rate</div>
                    <div className="font-medium">{strategy.winRate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
