import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer } from 'lucide-react';
import { useReps, useProducts, useSales, useReturns, usePayouts } from '@/hooks/useQueries';
import { calculateRepBalances } from '@/lib/calculations';
import { getMonthStart, getMonthEnd, formatMonthYear, getCurrentMonth } from '@/lib/dateUtils';
import { formatDate, formatCurrency } from '@/lib/csv';
import { getCommissionSettings } from '@/lib/commissionSettings';

export default function StatementsPage() {
  const currentMonth = getCurrentMonth();
  const [selectedRepId, setSelectedRepId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(String(currentMonth.year));
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth.month));

  const { data: reps = [] } = useReps();
  const { data: products = [] } = useProducts();
  const { data: sales = [] } = useSales();
  const { data: returns = [] } = useReturns();
  const { data: payouts = [] } = usePayouts();

  const year = parseInt(selectedYear);
  const month = parseInt(selectedMonth);
  const startDate = getMonthStart(year, month);
  const endDate = getMonthEnd(year, month);

  const repIndex = selectedRepId ? parseInt(selectedRepId) : -1;
  const selectedRep = repIndex >= 0 ? reps[repIndex] : null;

  const balances = calculateRepBalances(reps, sales, returns, payouts, products, startDate, endDate);
  const repBalance = repIndex >= 0 ? balances[repIndex] : null;

  const settings = getCommissionSettings();
  const commissionRate = repIndex >= 0 ? (settings.repOverrides[repIndex] ?? settings.defaultCommission) : 0;

  const repSales = sales.filter((s) => {
    const saleDate = new Date(Number(s.date) / 1_000_000);
    return Number(s.repId) === repIndex && saleDate >= startDate && saleDate <= endDate;
  });

  const repReturns = returns.filter((r) => {
    const returnDate = new Date(Number(r.date) / 1_000_000);
    return Number(r.repId) === repIndex && returnDate >= startDate && returnDate <= endDate;
  });

  const repPayouts = payouts.filter((p) => {
    const payoutDate = new Date(Number(p.date) / 1_000_000);
    return Number(p.repId) === repIndex && payoutDate >= startDate && payoutDate <= endDate;
  });

  const handlePrint = () => {
    window.print();
  };

  const years = Array.from({ length: 5 }, (_, i) => currentMonth.year - 2 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Statements</h1>
          <p className="text-muted-foreground">Generate printable statements for reps</p>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Statement Parameters</CardTitle>
          <CardDescription>Select a rep and month to generate a statement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Rep</Label>
              <Select value={selectedRepId} onValueChange={setSelectedRepId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rep" />
                </SelectTrigger>
                <SelectContent>
                  {reps.map((rep, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handlePrint} disabled={!selectedRep}>
              <Printer className="mr-2 h-4 w-4" />
              Print Statement
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedRep && repBalance && (
        <div className="statement-container space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Monthly Statement</CardTitle>
              <CardDescription>
                <div className="mt-2 space-y-1 text-base">
                  <div><strong>Rep:</strong> {selectedRep.name}</div>
                  <div><strong>Period:</strong> {formatMonthYear(year, month)}</div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Sales</h3>
                {repSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales this period</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repSales.map((sale, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(sale.date)}</TableCell>
                          <TableCell>{products[Number(sale.productId)]?.name || 'Unknown'}</TableCell>
                          <TableCell className="text-right">{Number(sale.quantity)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(sale.unitPrice))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(sale.unitPrice) * Number(sale.quantity))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">Returns</h3>
                {repReturns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No returns this period</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repReturns.map((returnItem, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(returnItem.date)}</TableCell>
                          <TableCell>{products[Number(returnItem.productId)]?.name || 'Unknown'}</TableCell>
                          <TableCell className="text-right">{Number(returnItem.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">Payouts</h3>
                {repPayouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payouts this period</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repPayouts.map((payout, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(payout.date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(payout.amount))}</TableCell>
                          <TableCell className="text-muted-foreground">{payout.notes || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="mb-3 text-lg font-semibold">Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">{formatCurrency(repBalance.totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Returns:</span>
                    <span className="font-medium">{formatCurrency(repBalance.totalReturns)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Sales:</span>
                    <span className="font-medium">{formatCurrency(repBalance.totalSales - repBalance.totalReturns)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission ({commissionRate}%):</span>
                    <span className="font-medium">{formatCurrency(repBalance.commission)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Payouts:</span>
                    <span className="font-medium">{formatCurrency(repBalance.totalPayouts)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(repBalance.amountOwed)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
