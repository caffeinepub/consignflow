import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Lock, LockOpen } from 'lucide-react';
import { useSettlementPeriods, useCreateSettlementPeriod, useCloseSettlementPeriod } from '@/hooks/useQueries';
import { formatSettlementPeriodDate } from '@/lib/settlementLock';
import { SettlementStatus } from '@/backend';
import { toast } from 'sonner';

export default function SettlementPeriodsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: periods = [], isLoading } = useSettlementPeriods();
  const createPeriod = useCreateSettlementPeriod();
  const closePeriod = useCloseSettlementPeriod();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      await createPeriod.mutateAsync({
        startDate: BigInt(start.getTime() * 1_000_000),
        endDate: BigInt(end.getTime() * 1_000_000),
      });

      toast.success('Settlement period created successfully');
      setStartDate('');
      setEndDate('');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create settlement period');
      console.error(error);
    }
  };

  const handleClosePeriod = async (periodId: bigint) => {
    try {
      await closePeriod.mutateAsync(periodId);
      toast.success('Settlement period closed successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to close settlement period');
      console.error(error);
    }
  };

  const sortedPeriods = [...periods].sort((a, b) => Number(b.startDate - a.startDate));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settlement Periods</h1>
          <p className="text-muted-foreground">Manage accounting periods and lock transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Settlement Period</DialogTitle>
              <DialogDescription>Define a new accounting period with start and end dates</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPeriod.isPending}>
                  {createPeriod.isPending ? 'Creating...' : 'Create Period'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Settlement Periods</CardTitle>
          <CardDescription>View and manage settlement periods</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading settlement periods...</div>
          ) : sortedPeriods.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No settlement periods found. Create your first period to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPeriods.map((period) => {
                  const isOpen = period.status === SettlementStatus.open;
                  return (
                    <TableRow key={Number(period.id)}>
                      <TableCell className="font-medium">Period #{Number(period.id) + 1}</TableCell>
                      <TableCell>{formatSettlementPeriodDate(period.startDate)}</TableCell>
                      <TableCell>{formatSettlementPeriodDate(period.endDate)}</TableCell>
                      <TableCell>
                        {isOpen ? (
                          <Badge variant="outline" className="gap-1">
                            <LockOpen className="h-3 w-3" />
                            Open
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Closed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isOpen && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Close Period
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Close Settlement Period?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will lock all transactions in this period. You will not be able to add or edit consignments, sales, returns, or payouts within this date range. Only adjustments will be allowed. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleClosePeriod(period.id)}>
                                  Close Period
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
