import type { Sale, ReturnModel, Payout, Consignment, Product, Rep } from '../backend';
import { getCommissionSettings } from './commissionSettings';

export interface RepBalance {
  repId: number;
  repName: string;
  totalSales: number;
  totalReturns: number;
  totalPayouts: number;
  commission: number;
  amountOwed: number;
}

export interface InventoryItem {
  repId: number;
  repName: string;
  productId: number;
  productName: string;
  quantity: number;
}

export function calculateRepBalances(
  reps: Rep[],
  sales: Sale[],
  returns: ReturnModel[],
  payouts: Payout[],
  products: Product[],
  startDate?: Date,
  endDate?: Date
): RepBalance[] {
  const settings = getCommissionSettings();
  const startTimestamp = startDate ? BigInt(startDate.getTime() * 1_000_000) : undefined;
  const endTimestamp = endDate ? BigInt(endDate.getTime() * 1_000_000) : undefined;

  return reps.map((rep, repId) => {
    const repSales = sales.filter((s) => {
      const matchesRep = Number(s.repId) === repId;
      const matchesDate = (!startTimestamp || s.date >= startTimestamp) && (!endTimestamp || s.date <= endTimestamp);
      return matchesRep && matchesDate;
    });

    const repReturns = returns.filter((r) => {
      const matchesRep = Number(r.repId) === repId;
      const matchesDate = (!startTimestamp || r.date >= startTimestamp) && (!endTimestamp || r.date <= endTimestamp);
      return matchesRep && matchesDate;
    });

    const repPayouts = payouts.filter((p) => {
      const matchesRep = Number(p.repId) === repId;
      const matchesDate = (!startTimestamp || p.date >= startTimestamp) && (!endTimestamp || p.date <= endTimestamp);
      return matchesRep && matchesDate;
    });

    const totalSales = repSales.reduce((sum, sale) => sum + Number(sale.unitPrice) * Number(sale.quantity), 0);
    const totalReturns = repReturns.reduce((sum, ret) => {
      const product = products[Number(ret.productId)];
      const price = product ? Number(product.price) : 0;
      return sum + price * Number(ret.quantity);
    }, 0);
    const totalPayouts = repPayouts.reduce((sum, payout) => sum + Number(payout.amount), 0);

    const commissionRate = settings.repOverrides[repId] ?? settings.defaultCommission;
    const netSales = totalSales - totalReturns;
    const commission = netSales * (commissionRate / 100);
    const amountOwed = commission - totalPayouts;

    return {
      repId,
      repName: rep.name,
      totalSales,
      totalReturns,
      totalPayouts,
      commission,
      amountOwed,
    };
  });
}

export function calculateInventoryByRep(
  reps: Rep[],
  consignments: Consignment[],
  sales: Sale[],
  returns: ReturnModel[],
  products: Product[],
  startDate?: Date,
  endDate?: Date
): InventoryItem[] {
  const startTimestamp = startDate ? BigInt(startDate.getTime() * 1_000_000) : undefined;
  const endTimestamp = endDate ? BigInt(endDate.getTime() * 1_000_000) : undefined;

  const inventory: Map<string, InventoryItem> = new Map();

  // Add consignments
  consignments.forEach((c) => {
    const matchesDate = (!startTimestamp || c.date >= startTimestamp) && (!endTimestamp || c.date <= endTimestamp);
    if (!matchesDate) return;

    const key = `${c.repId}-${c.productId}`;
    const existing = inventory.get(key);
    const product = products[Number(c.productId)];
    
    if (existing) {
      existing.quantity += Number(c.quantity);
    } else {
      inventory.set(key, {
        repId: Number(c.repId),
        repName: reps[Number(c.repId)]?.name || 'Unknown',
        productId: Number(c.productId),
        productName: product?.name || 'Unknown',
        quantity: Number(c.quantity),
      });
    }
  });

  // Subtract sales
  sales.forEach((s) => {
    const matchesDate = (!startTimestamp || s.date >= startTimestamp) && (!endTimestamp || s.date <= endTimestamp);
    if (!matchesDate) return;

    const key = `${s.repId}-${s.productId}`;
    const existing = inventory.get(key);
    if (existing) {
      existing.quantity -= Number(s.quantity);
    }
  });

  // Subtract returns
  returns.forEach((r) => {
    const matchesDate = (!startTimestamp || r.date >= startTimestamp) && (!endTimestamp || r.date <= endTimestamp);
    if (!matchesDate) return;

    const key = `${r.repId}-${r.productId}`;
    const existing = inventory.get(key);
    if (existing) {
      existing.quantity -= Number(r.quantity);
    }
  });

  return Array.from(inventory.values()).filter((item) => item.quantity !== 0);
}
