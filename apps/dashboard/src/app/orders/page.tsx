'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { X } from 'lucide-react';

const orders = [
  {
    id: '1',
    symbol: 'BTC/KRW',
    side: 'BUY',
    type: 'LIMIT',
    price: 87500000,
    amount: 0.015,
    filled: 0.015,
    status: 'FILLED',
    strategy: 'Momentum Alpha',
    createdAt: '2024-03-20 14:32:15',
  },
  {
    id: '2',
    symbol: 'ETH/KRW',
    side: 'SELL',
    type: 'LIMIT',
    price: 4250000,
    amount: 0.5,
    filled: 0.5,
    status: 'FILLED',
    strategy: 'Mean Reversion Beta',
    createdAt: '2024-03-20 14:28:42',
  },
  {
    id: '3',
    symbol: 'BTC/KRW',
    side: 'BUY',
    type: 'LIMIT',
    price: 87200000,
    amount: 0.02,
    filled: 0.01,
    status: 'PARTIAL',
    strategy: 'Momentum Alpha',
    createdAt: '2024-03-20 14:15:08',
  },
  {
    id: '4',
    symbol: 'XRP/KRW',
    side: 'BUY',
    type: 'LIMIT',
    price: 850,
    amount: 1000,
    filled: 0,
    status: 'OPEN',
    strategy: 'Breakout Gamma',
    createdAt: '2024-03-20 13:58:33',
  },
  {
    id: '5',
    symbol: 'SOL/KRW',
    side: 'SELL',
    type: 'LIMIT',
    price: 185000,
    amount: 2,
    filled: 0,
    status: 'CANCELED',
    strategy: 'Mean Reversion Beta',
    createdAt: '2024-03-20 13:45:12',
  },
];

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-500/20 text-blue-500',
  OPEN: 'bg-warning/20 text-warning',
  PARTIAL: 'bg-purple-500/20 text-purple-500',
  FILLED: 'bg-success/20 text-success',
  CANCELED: 'bg-muted text-muted-foreground',
  REJECTED: 'bg-destructive/20 text-destructive',
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-32"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="PARTIAL">Partial</option>
            <option value="FILLED">Filled</option>
            <option value="CANCELED">Canceled</option>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {orders.filter((o) => o.status === 'OPEN' || o.status === 'PARTIAL').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filled Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {orders.filter((o) => o.status === 'FILLED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fill Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Filled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {order.createdAt}
                  </TableCell>
                  <TableCell className="font-medium">{order.symbol}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.side === 'BUY'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {order.side}
                    </span>
                  </TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell className="text-right">{order.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{order.amount}</TableCell>
                  <TableCell className="text-right">
                    {order.filled} ({((order.filled / order.amount) * 100).toFixed(0)}%)
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {order.strategy}
                  </TableCell>
                  <TableCell className="text-right">
                    {(order.status === 'OPEN' || order.status === 'PARTIAL') && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
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
