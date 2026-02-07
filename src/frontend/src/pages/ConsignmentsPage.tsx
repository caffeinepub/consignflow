import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Download } from 'lucide-react';
import { useConsignments, useAddConsignment, useReps, useProducts } from '@/hooks/useQueries';
import { generateCSV, downloadCSV, formatDate } from '@/lib/csv';
import RepSelect from '@/components/RepSelect';
import LineItemsEditor, { type LineItem } from '@/components/LineItemsEditor';
import DateRangeFilter from '@/components/DateRangeFilter';
import { toast } from 'sonner';

export default function ConsignmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repId, setRepId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([{ productId: '', quantity: '1' }]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: consignments = [], isLoading } = useConsignments();
  const { data: reps = [] } = useReps();
  const { data: products = [] } = useProducts();
  const addConsignment = useAddConsignment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repId) {
      toast.error('Please select a rep');
      return;
    }

    if (items.length === 0 || items.some((item) => !item.productId || !item.quantity)) {
      toast.error('Please add at least one complete line item');
      return;
    }

    try {
      const timestamp = BigInt(new Date(date).getTime() * 1_000_000);
      
      for (const item of items) {
        await addConsignment.mutateAsync({
          repId: BigInt(repId),
          productId: BigInt(item.productId),
          quantity: BigInt(item.quantity),
          date: timestamp,
        });
      }

      toast.success('Consignment added successfully');
      setRepId('');
      setDate(new Date().toISOString().split('T')[0]);
      setItems([{ productId: '', quantity: '1' }]);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add consignment');
      console.error(error);
    }
  };

  const exportConsignments = () => {
    const headers = ['Rep', 'Product', 'Quantity', 'Date'];
    const rows = filteredConsignments.map((c) => [
      reps[Number(c.repId)]?.name || 'Unknown',
      products[Number(c.productId)]?.name || 'Unknown',
      Number(c.quantity),
      formatDate(c.date),
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV('consignments.csv', csv);
  };

  const filteredConsignments = consignments.filter((c) => {
    const date = new Date(Number(c.date) / 1_000_000);
    const matchesStart = !startDate || date >= startDate;
    const matchesEnd = !endDate || date <= endDate;
    return matchesStart && matchesEnd;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consignments</h1>
          <p className="text-muted-foreground">Track inventory consigned to reps</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Button variant="outline" size="sm" onClick={exportConsignments} disabled={filteredConsignments.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Consignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Consignment</DialogTitle>
                <DialogDescription>Record items consigned to a rep</DialogDescription>
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
                <LineItemsEditor items={items} onChange={setItems} />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addConsignment.isPending}>
                    {addConsignment.isPending ? 'Adding...' : 'Add Consignment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Consignments</CardTitle>
          <CardDescription>View all consignment records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading consignments...</div>
          ) : filteredConsignments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No consignments found. Add your first consignment to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsignments.map((consignment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{reps[Number(consignment.repId)]?.name || 'Unknown'}</TableCell>
                    <TableCell>{products[Number(consignment.productId)]?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-right">{Number(consignment.quantity)}</TableCell>
                    <TableCell>{formatDate(consignment.date)}</TableCell>
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
