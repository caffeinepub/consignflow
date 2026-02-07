import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Download } from 'lucide-react';
import { usePayouts, useAddPayout, useReps } from '@/hooks/useQueries';
import { generateCSV, downloadCSV, formatDate, formatCurrency } from '@/lib/csv';
import RepSelect from '@/components/RepSelect';
import DateRangeFilter from '@/components/DateRangeFilter';
import { toast } from 'sonner';

export default function PayoutsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repId, setRepId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: payouts = [], isLoading } = usePayouts();
  const { data: reps = [] } = useReps();
  const addPayout = useAddPayout();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repId) {
      toast.error('Please select a rep');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await addPayout.mutateAsync({
        repId: BigInt(repId),
        amount: BigInt(Math.round(amountValue * 100)),
        date: BigInt(new Date(date).getTime() * 1_000_000),
        notes: notes.trim(),
      });

      toast.success('Payout added successfully');
      setRepId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add payout');
      console.error(error);
    }
  };

  const exportPayouts = () => {
    const headers = ['Rep', 'Amount', 'Date', 'Notes'];
    const rows = filteredPayouts.map((p) => [
      reps[Number(p.repId)]?.name || 'Unknown',
      formatCurrency(Number(p.amount)),
      formatDate(p.date),
      p.notes,
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV('payouts.csv', csv);
  };

  const filteredPayouts = payouts.filter((p) => {
    const date = new Date(Number(p.date) / 1_000_000);
    const matchesStart = !startDate || date >= startDate;
    const matchesEnd = !endDate || date <= endDate;
    return matchesStart && matchesEnd;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">Record commission payouts to reps</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
          <Button variant="outline" size="sm" onClick={exportPayouts} disabled={filteredPayouts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Payout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Payout</DialogTitle>
                <DialogDescription>Record a commission payout</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rep">Rep</Label>
                  <RepSelect value={repId} onValueChange={setRepId} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes or reference"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addPayout.isPending}>
                    {addPayout.isPending ? 'Adding...' : 'Add Payout'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payouts</CardTitle>
          <CardDescription>View all payout records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading payouts...</div>
          ) : filteredPayouts.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No payouts found. Add your first payout to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rep</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.map((payout, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{reps[Number(payout.repId)]?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(payout.amount))}</TableCell>
                    <TableCell>{formatDate(payout.date)}</TableCell>
                    <TableCell className="text-muted-foreground">{payout.notes || '—'}</TableCell>
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
