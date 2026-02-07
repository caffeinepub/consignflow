import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Settings } from 'lucide-react';
import { useReps, useProducts, useSales, useReturns, usePayouts, useConsignments } from '@/hooks/useQueries';
import { calculateRepBalances, calculateInventoryByRep } from '@/lib/calculations';
import { generateCSV, downloadCSV, formatCurrency } from '@/lib/csv';
import DateRangeFilter from '@/components/DateRangeFilter';
import CommissionSettingsDialog from '@/components/CommissionSettingsDialog';

export default function DashboardPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data: reps = [] } = useReps();
  const { data: products = [] } = useProducts();
  const { data: sales = [] } = useSales();
  const { data: returns = [] } = useReturns();
  const { data: payouts = [] } = usePayouts();
  const { data: consignments = [] } = useConsignments();

  const balances = calculateRepBalances(reps, sales, returns, payouts, products, startDate || undefined, endDate || undefined);
  const inventory = calculateInventoryByRep(reps, consignments, sales, returns, products, startDate || undefined, endDate || undefined);

  const exportBalances = () => {
    const headers = ['Rep', 'Total Sales', 'Total Returns', 'Total Payouts', 'Commission', 'Amount Owed'];
    const rows = balances.map((b) => [
      b.repName,
      formatCurrency(b.totalSales),
      formatCurrency(b.totalReturns),
      formatCurrency(b.totalPayouts),
      formatCurrency(b.commission),
      formatCurrency(b.amountOwed),
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV('rep-balances.csv', csv);
  };

  const exportInventory = () => {
    const headers = ['Rep', 'Product', 'Quantity'];
    const rows = inventory.map((i) => [i.repName, i.productName, i.quantity]);
    const csv = generateCSV(headers, rows);
    downloadCSV('inventory-by-rep.csv', csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of rep balances and inventory</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Commission Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balances">Rep Balances</TabsTrigger>
          <TabsTrigger value="inventory">Inventory by Rep</TabsTrigger>
        </TabsList>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Amount Owed by Rep</CardTitle>
                  <CardDescription>Commission earned minus payouts made</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportBalances}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {balances.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No data available. Add reps and sales to see balances.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rep</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">Total Returns</TableHead>
                      <TableHead className="text-right">Total Payouts</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Amount Owed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((balance) => (
                      <TableRow key={balance.repId}>
                        <TableCell className="font-medium">{balance.repName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(balance.totalSales)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(balance.totalReturns)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(balance.totalPayouts)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(balance.commission)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(balance.amountOwed)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory by Rep</CardTitle>
                  <CardDescription>Current stock levels per rep and product</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportInventory}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inventory.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No inventory data available. Add consignments to see inventory.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rep</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.repName}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CommissionSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
