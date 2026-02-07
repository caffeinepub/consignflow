import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Download } from 'lucide-react';
import { useSales, useAddSale, useReps, useProducts } from '@/hooks/useQueries';
import { generateCSV, downloadCSV, formatDate, formatCurrency } from '@/lib/csv';
import RepSelect from '@/components/RepSelect';
import LineItemsEditor, { type LineItem } from '@/components/LineItemsEditor';
import DateRangeFilter from '@/components/DateRangeFilter';
import { toast } from 'sonner';

export default function SalesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repId, setRepId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: '1', unitPrice: '' }]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: sales = [], isLoading } = useSales();
  const { data: reps = [] } = useReps();
  const { data: products = [] } = useProducts();
  const addSale = useAddSale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repId) {
      toast.error('Please select a rep');
      return;
    }

    if (items.length === 0 || items.some((item) => !item.productId || !item.quantity || !item.unitPrice)) {
      toast.error('Please add at least one complete line item');
      return;
    }

    try {
      const timestamp = BigInt(new Date(date).getTime() * 1_000_000);
      
      for (const item of items) {
        await addSale.mutateAsync({
          repId: BigInt(repId),
          productId: BigInt(item.productId),
          quantity: BigInt(item.quantity),
          unitPrice: BigInt(Math.round(parseFloat(item.unitPrice!) * 100)),
          date: timestamp,
        });
      }

      toast.success('Sale added successfully');
      setRepId('');
      setDate(new Date().toISOString().split('T')[0]);
      setItems([{ productId: '', quantity: '1', unitPrice: '' }]);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add sale');
      console.error(error);
    }
  };

  const exportSales = () => {
    const headers = ['Rep', 'Product', 'Quantity', 'Unit Price', 'Total', 'Date'];
    const rows = filteredSales.map((s) => [
      reps[Number(s.repId)]?.name || 'Unknown',
      products[Number(s.productId)]?.name || 'Unknown',
      Number(s.quantity),
      formatCurrency(Number(s.unitPrice)),
      formatCurrency(Number(s.unitPrice) * Number(s.quantity)),
      formatDate(s.date),
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV('sales.csv', csv);
  };

  const filteredSales = sales.filter((s) => {
    const date = new Date(Number(s.date) / 1_000_000);
    const matchesStart = !startDate || date >= startDate;
    const matchesEnd = !endDate || date <= endDate;
    return matchesStart && matchesEnd;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Record sales transactions</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Button variant="outline" size="sm" onClick={exportSales} disabled={filteredSales.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Sale</DialogTitle>
                <DialogDescription>Record a sales transaction</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rep">Rep</Label>
                    <RepSelect value={repId} onValueChange={setRepId} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
                <LineItemsEditor items={items} onChange={setItems} showUnitPrice />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addSale.isPending}>
                    {addSale.isPending ? 'Adding...' : 'Add Sale'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
          <CardDescription>View all sales records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading sales...</div>
          ) : filteredSales.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No sales found. Add your first sale to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{reps[Number(sale.repId)]?.name || 'Unknown'}</TableCell>
                    <TableCell>{products[Number(sale.productId)]?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-right">{Number(sale.quantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(sale.unitPrice))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(sale.unitPrice) * Number(sale.quantity))}</TableCell>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
