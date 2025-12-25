'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Play, Pause, Settings, Eye } from 'lucide-react';

const strategies = [
  {
    id: '1',
    name: 'Momentum Alpha',
    version: 'v1.2.0',
    status: 'LIVE',
    symbols: ['BTC/KRW', 'ETH/KRW'],
    pnl: '+12.5%',
    trades: 45,
    winRate: '68%',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Mean Reversion Beta',
    version: 'v2.0.1',
    status: 'LIVE',
    symbols: ['XRP/KRW', 'SOL/KRW'],
    pnl: '+8.2%',
    trades: 32,
    winRate: '72%',
    createdAt: '2024-02-01',
  },
  {
    id: '3',
    name: 'Breakout Gamma',
    version: 'v1.0.0',
    status: 'PAPER',
    symbols: ['BTC/KRW'],
    pnl: '+5.1%',
    trades: 18,
    winRate: '61%',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Grid Delta',
    version: 'v1.1.0',
    status: 'BACKTEST_PASS',
    symbols: ['ETH/KRW'],
    pnl: '+15.3%',
    trades: 0,
    winRate: '-',
    createdAt: '2024-03-15',
  },
  {
    id: '5',
    name: 'Scalping Epsilon',
    version: 'v0.9.0',
    status: 'DRAFT',
    symbols: ['BTC/KRW'],
    pnl: '-',
    trades: 0,
    winRate: '-',
    createdAt: '2024-03-20',
  },
];

const statusColors: Record<string, string> = {
  LIVE: 'bg-success/20 text-success',
  PAPER: 'bg-warning/20 text-warning',
  BACKTEST_PASS: 'bg-blue-500/20 text-blue-500',
  DRAFT: 'bg-muted text-muted-foreground',
  STOPPED: 'bg-destructive/20 text-destructive',
};

export default function StrategiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Strategies</h1>
        <Button>New Strategy</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strategies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {strategies.filter((s) => s.status === 'LIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paper Trading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {strategies.filter((s) => s.status === 'PAPER').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {strategies.filter((s) => s.status === 'BACKTEST_PASS').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Symbols</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strategies.map((strategy) => (
                <TableRow key={strategy.id}>
                  <TableCell className="font-medium">{strategy.name}</TableCell>
                  <TableCell className="text-muted-foreground">{strategy.version}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[strategy.status]}`}>
                      {strategy.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {strategy.symbols.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-muted rounded text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right ${strategy.pnl.startsWith('+') ? 'text-success' : ''}`}>
                    {strategy.pnl}
                  </TableCell>
                  <TableCell className="text-right">{strategy.trades}</TableCell>
                  <TableCell className="text-right">{strategy.winRate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {strategy.status === 'LIVE' || strategy.status === 'PAPER' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
