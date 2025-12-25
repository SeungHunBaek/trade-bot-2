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
import { X } from 'lucide-react';

const positions = [
  {
    id: '1',
    symbol: 'BTC/KRW',
    side: 'LONG',
    entryPrice: 87200000,
    currentPrice: 87650000,
    amount: 0.025,
    unrealizedPnl: 11250,
    unrealizedPnlPercent: 0.52,
    strategy: 'Momentum Alpha',
    openedAt: '2024-03-19 10:15:00',
  },
  {
    id: '2',
    symbol: 'ETH/KRW',
    side: 'LONG',
    entryPrice: 4180000,
    currentPrice: 4250000,
    amount: 1.5,
    unrealizedPnl: 105000,
    unrealizedPnlPercent: 1.67,
    strategy: 'Mean Reversion Beta',
    openedAt: '2024-03-18 14:32:00',
  },
  {
    id: '3',
    symbol: 'XRP/KRW',
    side: 'LONG',
    entryPrice: 870,
    currentPrice: 850,
    amount: 5000,
    unrealizedPnl: -100000,
    unrealizedPnlPercent: -2.30,
    strategy: 'Breakout Gamma',
    openedAt: '2024-03-20 09:45:00',
  },
];

const closedPositions = [
  {
    id: '4',
    symbol: 'SOL/KRW',
    side: 'LONG',
    entryPrice: 175000,
    exitPrice: 185000,
    amount: 3,
    realizedPnl: 30000,
    realizedPnlPercent: 5.71,
    strategy: 'Momentum Alpha',
    closedAt: '2024-03-20 11:30:00',
  },
  {
    id: '5',
    symbol: 'BTC/KRW',
    side: 'LONG',
    entryPrice: 86500000,
    exitPrice: 87100000,
    amount: 0.01,
    realizedPnl: 6000,
    realizedPnlPercent: 0.69,
    strategy: 'Momentum Alpha',
    closedAt: '2024-03-19 16:45:00',
  },
];

export default function PositionsPage() {
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalRealizedPnl = closedPositions.reduce((sum, p) => sum + p.realizedPnl, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Positions</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unrealized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalUnrealizedPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}{totalUnrealizedPnl.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today Realized P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRealizedPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalRealizedPnl >= 0 ? '+' : ''}{totalRealizedPnl.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
          </CardContent>
        </Card>
      </div>

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Entry Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Unrealized P&L</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.symbol}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      position.side === 'LONG'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {position.side}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{position.entryPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{position.currentPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{position.amount}</TableCell>
                  <TableCell className={`text-right ${position.unrealizedPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {position.unrealizedPnl >= 0 ? '+' : ''}{position.unrealizedPnl.toLocaleString()}
                    <span className="ml-1 text-xs">
                      ({position.unrealizedPnlPercent >= 0 ? '+' : ''}{position.unrealizedPnlPercent.toFixed(2)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{position.strategy}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{position.openedAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Close
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Closed Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Closed Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Entry Price</TableHead>
                <TableHead className="text-right">Exit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Realized P&L</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Closed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.symbol}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      position.side === 'LONG'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {position.side}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{position.entryPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{position.exitPrice.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{position.amount}</TableCell>
                  <TableCell className={`text-right ${position.realizedPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {position.realizedPnl >= 0 ? '+' : ''}{position.realizedPnl.toLocaleString()}
                    <span className="ml-1 text-xs">
                      ({position.realizedPnlPercent >= 0 ? '+' : ''}{position.realizedPnlPercent.toFixed(2)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{position.strategy}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{position.closedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
