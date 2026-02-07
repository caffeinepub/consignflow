import type { SettlementPeriodView } from '../backend';

export interface LockCheckResult {
  isLocked: boolean;
  message?: string;
  period?: SettlementPeriodView;
}

export function checkSettlementLock(
  date: Date,
  closedPeriods: SettlementPeriodView[]
): LockCheckResult {
  const timestamp = date.getTime();

  for (const period of closedPeriods) {
    const startMs = Number(period.startDate) / 1_000_000;
    const endMs = Number(period.endDate) / 1_000_000;

    if (timestamp >= startMs && timestamp <= endMs) {
      return {
        isLocked: true,
        message: `This date falls within a closed settlement period (${new Date(startMs).toLocaleDateString()} - ${new Date(endMs).toLocaleDateString()}). You cannot add or edit transactions in closed periods. Please create an adjustment instead.`,
        period,
      };
    }
  }

  return { isLocked: false };
}

export function formatSettlementPeriodDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
