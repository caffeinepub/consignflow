import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useAdjustments, useAddAdjustment, useReps } from '@/hooks/useQueries';
import { formatDate, formatCurrency } from '@/lib/csv';
import RepSelect from '@/components/RepSelect';
import { toast } from 'sonner';

export default function AdjustmentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repId, setRepId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { data: adjustments = [], isLoading } = useAdjustments();
  const { data: reps = [] } = useReps();
  const addAdjustment = useAddAdjustment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repId) {
      toast.error('Please select a rep');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!notes.trim()) {
      toast.error('Please provide a reason for this adjustment');
      return;
    }

    try {
      await addAdjustment.mutateAsync({
        repId: BigInt(repId),
        amount: BigInt(Math.round(amountValue * 100)),
        date: BigInt(new Date(date).getTime() * 1_000_000),
        notes: notes.trim(),
      });

      toast.success('Adjustment added successfully');
      setRepId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setIsDialogOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add adjustment';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const sortedAdjustments = [...adjustments].sort((a, b) => Number(b.date - a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adjustments</h1>
          <p className="text-muted-foreground">Record adjustments for closed settlement periods</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Adjustment</DialogTitle>
              <DialogDescription>Record an adjustment for a closed settlement period</DialogDescription>
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
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Use negative values for deductions</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Reason / Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain the reason for this adjustment"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addAdjustment.isPending}>
                  {addAdjustment.isPending ? 'Adding...' : 'Add Adjustment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Adjustments</CardTitle>
          <CardDescription>View all adjustment records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading adjustments...</div>
          ) : sortedAdjustments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No adjustments found. Add your first adjustment to get started.
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
                {sortedAdjustments.map((adjustment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{reps[Number(adjustment.repId)]?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(adjustment.amount))}</TableCell>
                    <TableCell>{formatDate(adjustment.date)}</TableCell>
                    <TableCell className="text-muted-foreground">{adjustment.notes}</TableCell>
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
