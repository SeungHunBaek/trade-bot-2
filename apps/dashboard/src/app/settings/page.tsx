'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

const exchangeAccounts = [
  {
    id: '1',
    exchange: 'bithumb',
    name: 'Main Account',
    apiKey: '4ff715707ef50a35****',
    isActive: true,
    createdAt: '2024-01-15',
  },
];

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [riskSettings, setRiskSettings] = useState({
    riskPerTrade: 1,
    dailyLossLimit: 3,
    positionLimit: 20,
    slippageTolerance: 0.3,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Exchange Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Exchange Accounts</CardTitle>
          <CardDescription>Manage your connected exchange API credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exchangeAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary uppercase">
                    {account.exchange.substring(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {account.exchange.charAt(0).toUpperCase() + account.exchange.slice(1)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  API Key: {showApiKey ? account.apiKey.replace('****', '8960093f0ddce9d7') : account.apiKey}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-4">Add New Account</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground">Exchange</label>
                <Select className="mt-1">
                  <option value="bithumb">Bithumb</option>
                  <option value="bybit">Bybit</option>
                  <option value="okx">OKX</option>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Account Name</label>
                <Input className="mt-1" placeholder="My Trading Account" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">API Key</label>
                <Input className="mt-1" placeholder="Enter API Key" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Secret Key</label>
                <Input className="mt-1" type="password" placeholder="Enter Secret Key" />
              </div>
            </div>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management</CardTitle>
          <CardDescription>Configure risk limits for your trading strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Risk Per Trade (%)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximum percentage of portfolio to risk on a single trade
              </p>
              <Input
                type="number"
                value={riskSettings.riskPerTrade}
                onChange={(e) => setRiskSettings({ ...riskSettings, riskPerTrade: parseFloat(e.target.value) })}
                min={0.1}
                max={5}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 1-2%</p>
            </div>

            <div>
              <label className="text-sm font-medium">Daily Loss Limit (%)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximum daily loss before stopping all trading
              </p>
              <Input
                type="number"
                value={riskSettings.dailyLossLimit}
                onChange={(e) => setRiskSettings({ ...riskSettings, dailyLossLimit: parseFloat(e.target.value) })}
                min={1}
                max={10}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 3-5%</p>
            </div>

            <div>
              <label className="text-sm font-medium">Position Limit (%)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximum percentage of portfolio in a single position
              </p>
              <Input
                type="number"
                value={riskSettings.positionLimit}
                onChange={(e) => setRiskSettings({ ...riskSettings, positionLimit: parseFloat(e.target.value) })}
                min={5}
                max={50}
                step={5}
              />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 20-25%</p>
            </div>

            <div>
              <label className="text-sm font-medium">Slippage Tolerance (%)</label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximum allowed slippage for market orders
              </p>
              <Input
                type="number"
                value={riskSettings.slippageTolerance}
                onChange={(e) => setRiskSettings({ ...riskSettings, slippageTolerance: parseFloat(e.target.value) })}
                min={0.1}
                max={2}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 0.2-0.5%</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button>Save Risk Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure Telegram alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Telegram Bot Token</label>
              <Input className="mt-1" type="password" placeholder="Enter Bot Token" defaultValue="8487501405:****" />
            </div>
            <div>
              <label className="text-sm font-medium">Telegram Chat ID</label>
              <Input className="mt-1" placeholder="Enter Chat ID" defaultValue="5958974797" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium">Alert Types</label>
            {[
              { key: 'orderFilled', label: 'Order Filled', description: 'When an order is executed' },
              { key: 'orderFailed', label: 'Order Failed', description: 'When an order fails to execute' },
              { key: 'riskExceeded', label: 'Risk Limit Exceeded', description: 'When risk limits are breached' },
              { key: 'dataDelay', label: 'Data Collection Delay', description: 'When candle data is delayed' },
            ].map((alert) => (
              <div key={alert.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm font-medium">{alert.label}</div>
                  <div className="text-xs text-muted-foreground">{alert.description}</div>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" className="mr-2">Test Connection</Button>
            <Button>Save Notifications</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
