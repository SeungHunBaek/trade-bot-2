import { Timeframe } from '@passive-money/common';

export interface BackfillJobData {
  symbol: string;
  timeframe: Timeframe;
  year: number;
  month: number; // 1-12
}

export interface BackfillRequest {
  symbol: string;
  timeframe: Timeframe;
  startYear: number;
  startMonth: number;
  endYear?: number;
  endMonth?: number;
}

export interface BackfillStatus {
  jobId: string;
  symbol: string;
  timeframe: string;
  year: number;
  month: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}
